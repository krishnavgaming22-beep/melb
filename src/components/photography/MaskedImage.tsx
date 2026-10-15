import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "../../hooks/useReducedMotion";
export function MaskedImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { clipPath: "inset(10% 0)" },
        {
          clipPath: "inset(0% 0)",
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
      gsap.fromTo(
        ref.current?.querySelector("img") ?? null,
        { yPercent: -5 },
        {
          yPercent: 5,
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, [reduced]);
  return (
    <div ref={ref} className="masked-image">
      <img src={src} alt={alt} loading="lazy" decoding="async" />
    </div>
  );
}
