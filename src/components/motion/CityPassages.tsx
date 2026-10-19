import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useScrollTo } from "./ScrollContext";
import { places } from "../../data/places";
import { openLandmark } from "../../scenes/LandmarkExperience/store";
import { assetUrl } from "../../utils/assetUrl";
import "./passages.css";
gsap.registerPlugin(ScrollTrigger);

export function CityOverture() {
  const root = useRef<HTMLElement>(null),
    reduced = useReducedMotion();
  const scrollTo = useScrollTo();
  useLayoutEffect(() => {
    if (reduced) return;
    const media = gsap.matchMedia();
    media.add(
      { wide: "(min-width: 900px)", small: "(max-width: 899px)" },
      (context) => {
        const wide = !!context.conditions?.wide;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            id: "city-overture",
            trigger: root.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (s) => {
              root.current!.dataset.progress = s.progress.toFixed(3);
            },
          },
        });
        tl.fromTo(
          ".overture-aperture",
          {
            clipPath: wide
              ? "inset(22% 32% 22% 32% round 160px)"
              : "inset(25% 12% 25% 12% round 120px)",
          },
          { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 0.48 },
          0,
        )
          .fromTo(
            ".overture-aperture img",
            { scale: 1.3, yPercent: 8 },
            { scale: 1, yPercent: -4, duration: 1 },
            0,
          )
          .fromTo(
            ".overture-word",
            { xPercent: 22, scale: 1.15 },
            { xPercent: -28, scale: 0.8, duration: 0.62 },
            0,
          )
          .to(".overture-word", { opacity: 0, duration: 0.12 }, 0.5)
          .fromTo(
            ".overture-title span",
            { yPercent: 115 },
            { yPercent: 0, stagger: 0.065, duration: 0.16 },
            0.38,
          )
          .fromTo(
            ".overture-note",
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.14 },
            0.6,
          )
          .fromTo(
            ".overture-shade",
            { opacity: 0.05 },
            { opacity: 0.7, duration: 0.5 },
            0.4,
          )
          .to(".overture-title", { yPercent: -15, duration: 0.2 }, 0.8)
          .fromTo(
            ".overture-curtain",
            { scaleY: 0 },
            { scaleY: 1, duration: 0.13 },
            0.87,
          );
        if (wide) {
          tl.to(
            ".overture-title",
            { scale: 0.78, transformOrigin: "left center", duration: 0.2 },
            0.6,
          );
          tl.fromTo(
            ".overture-card",
            { yPercent: 150, rotation: 12 },
            {
              yPercent: 0,
              rotation: (i) => [-6, 2, 7][i],
              stagger: 0.045,
              duration: 0.2,
            },
            0.58,
          );
        }
        return () => tl.kill();
      },
      root,
    );
    return () => media.revert();
  }, [reduced]);
  return (
    <section
      id="why-melbourne"
      ref={root}
      className={`city-overture ${reduced ? "motion-static" : ""}`}
      aria-label="More than a destination"
    >
      <div className="overture-stage" data-cursor="SCROLL">
        <div className="overture-aperture">
          <img
            src={assetUrl("/assets/streets/video/melbourne-aerial-poster.webp")}
            alt="Melbourne skyline and the Yarra from above"
            loading="lazy"
          />
          <div className="overture-shade" />
        </div>
        <span className="overture-kicker eyebrow">
          04 / A CITY THAT MOVES YOU
        </span>
        <div className="overture-word" aria-hidden="true">
          MELBOURNE
        </div>
        <h2 className="overture-title">
          <i>
            <span>More than</span>
          </i>
          <i>
            <span>
              a <em>destination.</em>
            </span>
          </i>
        </h2>
        <div className="overture-note">
          <p>
            A city to discover.
            <br />A place to learn, live and belong.
          </p>
          <a
            href="#sport"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("#sport");
            }}
          >
            Find your Melbourne ↗
          </a>
        </div>
        <a
          className="overture-credit"
          href="https://www.pexels.com/video/melbourne-city-17920530/"
          target="_blank"
          rel="noreferrer"
        >
          Nick English / Pexels · Film still
        </a>
        <div className="overture-deck" aria-hidden="true">
          {[
            ["shrine-stone", "Remember."],
            ["hosier-lane", "Discover."],
            ["st-kilda", "Breathe."],
          ].map(([id, label]) => (
            <figure className="overture-card" key={id}>
              <img
                src={assetUrl(`/assets/streets/video/${id}-poster.webp`)}
                alt=""
                loading="lazy"
              />
              <figcaption>{label}</figcaption>
            </figure>
          ))}
        </div>
        <div className="overture-curtain" aria-hidden="true" />
      </div>
    </section>
  );
}

const passageIds = ["mcg", "flinders", "federation", "shrine"] as const;
export function LandmarkPassage() {
  const root = useRef<HTMLElement>(null),
    reduced = useReducedMotion(),
    scrollTo = useScrollTo();
  useLayoutEffect(() => {
    if (reduced) return;
    const media = gsap.matchMedia();
    media.add(
      "(min-width:900px)",
      () => {
        const track =
          root.current!.querySelector<HTMLElement>(".landmark-track")!;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            id: "landmark-passage",
            trigger: root.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (s) => {
              root.current!.dataset.progress = s.progress.toFixed(3);
            },
          },
        });
        tl.to(
          track,
          { x: () => -(track.scrollWidth - innerWidth), duration: 1 },
          0,
        );
        root
          .current!.querySelectorAll<HTMLElement>(".passage-panel")
          .forEach((panel, i) => {
            tl.fromTo(
              panel.querySelector("img"),
              { xPercent: -8, scale: 1.18 },
              { xPercent: 8, scale: 1, duration: 0.45 },
              Math.max(0, i * 0.2 - 0.1),
            );
            tl.fromTo(
              panel.querySelector("h3"),
              { yPercent: 80 },
              { yPercent: 0, duration: 0.12 },
              i * 0.22,
            );
          });
        return () => tl.kill();
      },
      root,
    );
    return () => media.revert();
  }, [reduced]);
  const select = (i: number) => {
    if (innerWidth < 900 || reduced) scrollTo(`#passage-${passageIds[i]}`);
    else if (root.current)
      scrollTo(
        root.current.getBoundingClientRect().top +
          scrollY +
          ((root.current.offsetHeight - innerHeight) * i) / 3,
      );
  };
  return (
    <section
      id="landmark-passage"
      ref={root}
      className={`landmark-passage ${reduced ? "motion-static" : ""}`}
      aria-label="Four Melbourne perspectives"
    >
      <div className="landmark-passage-stage">
        <header>
          <span className="eyebrow">FOUR PLACES. A THOUSAND PERSPECTIVES.</span>
          <a
            href="#education"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("#education");
            }}
          >
            Continue the story ↗
          </a>
        </header>
        <div className="landmark-track">
          {passageIds.map((id, i) => {
            const p = places.find((p) => p.id === id)!;
            const photo = p.photo!;
            return (
              <article
                className={`passage-panel passage-${id}`}
                id={`passage-${id}`}
                key={id}
              >
                <div className="passage-image">
                  <img src={photo.src} alt={photo.alt} loading="lazy" />
                </div>
                <div className="passage-copy">
                  <span className="eyebrow">
                    0{i + 1} / {p.categories.join(" + ")}
                  </span>
                  <h3>
                    {p.short}
                    <em>
                      {
                        [
                          "Together, louder.",
                          "Under the clocks.",
                          "Room for ideas.",
                          "A moment of quiet.",
                        ][i]
                      }
                    </em>
                  </h3>
                  <p>{p.intro}</p>
                  <button
                    data-cursor="EXPLORE"
                    onClick={() => openLandmark(id)}
                  >
                    Explore {p.short} in 3D ↗
                  </button>
                  <small>
                    <a href={photo.source} target="_blank" rel="noreferrer">
                      {photo.credit}
                    </a>{" "}
                    ·{" "}
                    <a href={photo.licenseUrl} target="_blank" rel="noreferrer">
                      {photo.license}
                    </a>{" "}
                    · Cropped photograph
                  </small>
                </div>
              </article>
            );
          })}
        </div>
        <nav aria-label="Landmark passage chapters">
          {passageIds.map((id, i) => (
            <button key={id} onClick={() => select(i)}>
              0{i + 1}
              <span>{places.find((p) => p.id === id)!.short}</span>
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}
