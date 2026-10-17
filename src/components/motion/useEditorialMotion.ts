import { useLayoutEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import "./motion.css";

gsap.registerPlugin(ScrollTrigger, SplitText);
export const motionBreakpoints = { mobile: 699, tablet: 1023 };

/** Scroll owns the animation; every end state is the original desktop layout. */
export function maskedHeadline(el: HTMLElement, compact = false) {
  return SplitText.create(el, {
    type: "lines,words",
    mask: "lines",
    autoSplit: true,
    linesClass: "motion-line",
    wordsClass: "motion-word",
    onSplit(split) {
      return gsap.fromTo(
        split.words,
        { yPercent: 112, rotation: compact ? 0 : 1.2 },
        {
          yPercent: 0,
          rotation: 0,
          stagger: 0.055,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 94%",
            end: compact ? "top 72%" : "top 58%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    },
  });
}
export function imageReveal(el: HTMLElement, compact = false) {
  const image = el.querySelector("img");
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: el,
      start: "top 96%",
      end: "top 43%",
      scrub: true,
    },
  });
  tl.fromTo(
    el,
    { clipPath: "inset(14% 6% 14% 6%)" },
    { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power2.out" },
    0,
  );
  if (image)
    tl.fromTo(
      image,
      { scale: compact ? 1.035 : 1.08, yPercent: compact ? 0 : 3 },
      { scale: 1, yPercent: 0, duration: 1, ease: "none" },
      0,
    );
  return tl;
}
export function animatedCaption(el: HTMLElement, compact = false) {
  return gsap.fromTo(
    el,
    { y: compact ? 8 : 16, clipPath: "inset(100% 0 0 0)" },
    {
      y: 0,
      clipPath: "inset(0% 0 0 0)",
      ease: "power1.out",
      scrollTrigger: {
        trigger: el,
        start: "top 94%",
        end: "top 76%",
        scrub: true,
      },
    },
  );
}
export function useEditorialMotion(root: RefObject<HTMLDivElement | null>) {
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    if (reduced || !root.current) return;
    const media = gsap.matchMedia();
    media.add(
      { desktop: "(min-width: 1024px)", compact: "(max-width: 1023px)" },
      (context) => {
        const compact = !!context.conditions?.compact;
        const host = root.current!;
        const splits = Array.from(
          host.querySelectorAll<HTMLElement>(
            ".editorial-intro h2,.editorial-heading h2,.your-melbourne > h2,.street-film-intro h2",
          ),
        ).map((el) => maskedHeadline(el, compact));
        host
          .querySelectorAll<HTMLElement>(".photo-window")
          .forEach((el) => imageReveal(el, compact));
        host
          .querySelectorAll<HTMLElement>(
            ".eyebrow,figcaption,.intro-coordinate,.editorial-deck,.intro-bottom,.editorial-columns p,.editorial-note",
          )
          .forEach((el) => {
            if (!el.closest(".street-film,.street-film-reading"))
              animatedCaption(el, compact);
          });
        host.querySelectorAll<HTMLElement>(".next-path").forEach((el, i) =>
          gsap.fromTo(
            el,
            { y: compact ? 14 : 36, opacity: 0.45 },
            {
              y: 0,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: el.parentElement,
                start: `top ${94 - i * 4}%`,
                end: `top ${60 - i * 4}%`,
                scrub: true,
              },
            },
          ),
        );
        // A full-width reveal into the existing dark-green composition, no extra pin.
        const belong = host.querySelector(".belonging-article");
        if (belong && !compact)
          gsap.fromTo(
            belong,
            { clipPath: "inset(0 3% 0 3%)" },
            {
              clipPath: "inset(0 0% 0 0%)",
              ease: "none",
              scrollTrigger: {
                trigger: belong,
                start: "top bottom",
                end: "top 65%",
                scrub: true,
              },
            },
          );
        const releases: (() => void)[] = [];
        if (!compact && matchMedia("(pointer:fine)").matches) {
          host
            .querySelectorAll<HTMLElement>(".next-path > a,.intro-bottom a")
            .forEach((el) => {
              let bounds: DOMRect | null = null;
              const x = gsap.quickTo(el, "x", {
                duration: 0.2,
                ease: "power2.out",
              });
              const y = gsap.quickTo(el, "y", {
                duration: 0.2,
                ease: "power2.out",
              });
              const enter = () => {
                bounds = el.getBoundingClientRect();
              };
              const move = (e: PointerEvent) => {
                if (bounds) {
                  x(
                    Math.max(
                      -3,
                      Math.min(
                        3,
                        (e.clientX - bounds.left - bounds.width / 2) * 0.04,
                      ),
                    ),
                  );
                  y(
                    Math.max(
                      -2,
                      Math.min(
                        2,
                        (e.clientY - bounds.top - bounds.height / 2) * 0.08,
                      ),
                    ),
                  );
                }
              };
              const leave = () => {
                x(0);
                y(0);
                bounds = null;
              };
              el.addEventListener("pointerenter", enter);
              el.addEventListener("pointermove", move);
              el.addEventListener("pointerleave", leave);
              releases.push(() => {
                el.removeEventListener("pointerenter", enter);
                el.removeEventListener("pointermove", move);
                el.removeEventListener("pointerleave", leave);
                x.tween.kill();
                y.tween.kill();
                gsap.set(el, { clearProps: "transform" });
              });
            });
        }
        return () => {
          releases.forEach((release) => release());
          splits.forEach((split) => split.revert());
        };
      },
      root,
    );
    return () => media.revert();
  }, [reduced, root]);
}
