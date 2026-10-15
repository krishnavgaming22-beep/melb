import { assetUrl } from "../../utils/assetUrl";
import {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ThreeScene } from "../../components/three/ThreeScene";
import { journey } from "../../scenes/ArrivalScene/journey";
import {
  setDiscoveryPhase,
  resetDiscovery,
  selectPlace,
  filterDiscovery,
} from "../../scenes/CityScene/discoveryStore";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useScrollTo } from "../../components/motion/SmoothScroll";
const ArrivalScene = lazy(
  () => import("../../scenes/ArrivalScene/ArrivalScene"),
);
import { CityInterface } from "./CityInterface";
import { LandmarkInterface } from "../../scenes/LandmarkExperience/LandmarkInterface";
import { useExplorer } from "../../scenes/LandmarkExperience/store";
const stops = [
  ["Arrive", 0],
  ["Australia", 0.39],
  ["Melbourne", 0.71],
  ["Explore", 0.97],
] as const;
export function ArrivalExperience() {
  const explorer = useExplorer();
  const root = useRef<HTMLElement>(null);
  const debugShot = import.meta.env.DEV
    ? new URLSearchParams(location.search).get("shot")
    : null;
  const [active, setActive] = useState(true);
  const [ready, setReady] = useState(journey.ready);
  const [loadIssue, setLoadIssue] = useState(false);
  const [mobile, setMobile] = useState(() => innerWidth < 700);
  const reduced = useReducedMotion();
  const scrollTo = useScrollTo();
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: "100px" },
    );
    if (root.current) observer.observe(root.current);
    const resize = () => setMobile(innerWidth < 700);
    const visibility = () =>
      setActive(
        !document.hidden &&
          !!root.current &&
          root.current.getBoundingClientRect().bottom > 0,
      );
    const loaded = () => setReady(true);
    const failed = () => {
      setReady(true);
      setLoadIssue(true);
    };
    const timeout = window.setTimeout(() => {
      if (!journey.ready) failed();
    }, 30000);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("melb:scene-ready", loaded);
    window.addEventListener("melb:scene-failed", failed);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("melb:scene-ready", loaded);
      window.removeEventListener("melb:scene-failed", failed);
      window.clearTimeout(timeout);
    };
  }, []);
  useLayoutEffect(() => {
    journey.progress = 0;
    journey.rendered = 0;
    const ctx = gsap.context(() => {
      const state = { p: 0 };
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        paused: debugShot !== null,
        scrollTrigger:
          debugShot !== null
            ? undefined
            : {
                id: "arrival",
                trigger: root.current,
                start: "top top",
                end: "bottom bottom",
                scrub: reduced ? true : 0.35,
                invalidateOnRefresh: true,
              },
        onUpdate: () => {
          journey.progress = state.p;
          setDiscoveryPhase(state.p);
          const stage =
            root.current?.querySelector<HTMLElement>(".arrival-stage");
          stage?.style.setProperty("--journey", String(state.p));
          const map = root.current?.querySelector<HTMLElement>(".city-map-ui");
          if (map) map.inert = state.p < 0.955;
          const overview = root.current?.querySelector<HTMLElement>(
            ".city-overview-copy",
          );
          if (overview) overview.inert = state.p < 0.66 || state.p > 0.82;
          root.current
            ?.querySelectorAll<HTMLButtonElement>(".journey-stop")
            .forEach((el, i) => {
              const current =
                state.p >= stops[i][1] - 0.02 &&
                (i === 3 || state.p < stops[i + 1][1] - 0.02);
              el.setAttribute("aria-current", current ? "step" : "false");
            });
        },
      });
      tl.to(state, { p: 1, duration: 1 }, 0);
      const arrival = gsap.timeline({ defaults: { ease: "none" } });
      arrival
        .to(
          ".opening-word",
          { yPercent: reduced ? 0 : -14, opacity: 0, duration: 0.23 },
          0.18,
        )
        .to(
          ".opening-caption",
          { opacity: 0, y: reduced ? 0 : -24, duration: 0.08 },
          0.16,
        )
        .fromTo(
          ".flight-copy",
          { opacity: 0, y: reduced ? 0 : 25 },
          { opacity: 1, y: 0, duration: 0.1 },
          0.26,
        )
        .to(
          ".flight-copy",
          { opacity: 0, y: reduced ? 0 : -20, duration: 0.08 },
          0.42,
        )
        .to(".ocean-layer", { opacity: 1, duration: 0.25 }, 0.4)
        .fromTo(
          ".map-copy",
          { opacity: 0, y: reduced ? 0 : 20 },
          { opacity: 1, y: 0, duration: 0.1 },
          0.56,
        )
        .to(".map-copy", { opacity: 0, duration: 0.06 }, 0.77)
        .fromTo(
          ".australia-label",
          { opacity: 0 },
          { opacity: 1, duration: 0.1 },
          0.58,
        )
        .to(".australia-label", { opacity: 0, duration: 0.08 }, 0.81)
        .fromTo(
          ".descent-copy",
          { opacity: 0, y: reduced ? 0 : 25 },
          { opacity: 1, y: 0, duration: 0.1 },
          0.88,
        )
        .to(".arrival-stage", { "--ui-color": "#f2efe8", duration: 0.2 }, 0.42);
      arrival.to({}, { duration: 0.02 }, 0.98);
      tl.add(arrival.duration(0.58), 0);
      tl.to(".descent-copy", { opacity: 0, duration: 0.035 }, 0.605)
        .fromTo(
          ".city-attribution",
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.04 },
          0.56,
        )
        .to(".city-background", { opacity: 1, duration: 0.1 }, 0.56)
        .to(
          ".arrival-stage",
          { "--ui-color": "#233b40", duration: 0.075 },
          0.605,
        )
        .to(".side-coordinate", { opacity: 0, duration: 0.05 }, 0.61)
        .fromTo(
          ".city-overview-copy",
          { opacity: 0, y: reduced ? 0 : 28 },
          { opacity: 1, y: 0, duration: 0.045 },
          0.67,
        )
        .to(
          ".city-overview-copy",
          { opacity: 0, y: reduced ? 0 : -15, duration: 0.05 },
          0.785,
        )
        .fromTo(
          ".city-map-ui",
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.03 },
          0.945,
        );
      tl.fromTo(
        ".discovery-browser",
        { y: reduced ? 0 : 8 },
        { y: 0, duration: 0.03 },
        0.945,
      );
      if (!reduced)
        tl.fromTo(
          ".discovery-heading h2 > span",
          { clipPath: "inset(100% 0 0 0)" },
          { clipPath: "inset(0% 0 0 0)", duration: 0.018, stagger: 0.005 },
          0.947,
        );
      tl.fromTo(
        ".discovery-heading .eyebrow, .discovery-heading h2, .discovery-search, .theme-selector, .theme-story, .destination-results, .map-controls",
        { opacity: 0, y: reduced ? 0 : 10 },
        { opacity: 1, y: 0, duration: 0.015, stagger: 0.004 },
        0.945,
      );
      if (debugShot !== null)
        tl.progress(Math.max(0, Math.min(1, Number(debugShot))));
      else ScrollTrigger.refresh();
    }, root);
    return () => {
      ctx.revert();
      journey.progress = 0;
      journey.rendered = 0;
      resetDiscovery();
      setDiscoveryPhase(0);
    };
  }, [reduced, debugShot]);
  const jump = (p: number) => {
    if (root.current)
      scrollTo(
        root.current.offsetTop + (root.current.offsetHeight - innerHeight) * p,
      );
  };
  useEffect(() => {
    const discover = (event: Event) => {
      filterDiscovery("All", "");
      const id = (event as CustomEvent<string | null>).detail;
      if (id) {
        setDiscoveryPhase(1);
        selectPlace(id, { width: innerWidth, height: innerHeight });
      }
      jump(0.985);
    };
    window.addEventListener("melb:discover-place", discover);
    return () => window.removeEventListener("melb:discover-place", discover);
  }, [scrollTo]);
  return (
    <section
      ref={root}
      className={`arrival ${reduced ? "reduced-arrival" : ""}`}
      style={debugShot !== null ? { height: "100svh" } : undefined}
      id="arrive"
      aria-label="Your arrival in Melbourne"
    >
      <div className="arrival-stage">
        {debugShot !== null && (
          <div className="shot-debug">
            <span>DEV · Shot {debugShot}</span>
            {[0, 0.07, 0.16, 0.39, 0.53, 0.6, 0.73, 0.85, 0.97].map((p) => (
              <a key={p} href={`/?shot=${p}`}>
                {Math.round(p * 100)}%
              </a>
            ))}
          </div>
        )}
        <div className="arrival-background">
          <div className="sky-grain" />
          <img
            className="sky-cloud sky-cloud-one"
            src={assetUrl("/assets/textures/cloud-0.webp")}
            alt=""
          />
          <img
            className="sky-cloud sky-cloud-two"
            src={assetUrl("/assets/textures/cloud-1.webp")}
            alt=""
          />
          <div className="ocean-layer" />
          <div className="city-background" />
        </div>
        <div className="arrival-text-back">
          <div className="opening-word">
            <span className="eyebrow opening-kicker">
              A DIFFERENT PERSPECTIVE
            </span>
            <h1>MELB.</h1>
            <div className="word-subline">
              <span>ARRIVE.</span>
              <span>EXPLORE.</span>
              <span>BELONG.</span>
            </div>
          </div>
        </div>
        <div
          className="arrival-webgl"
          role="img"
          aria-label="A commercial passenger aircraft flies through clouds, across Australia to Melbourne, where a city model transforms into an interactive landmark map."
        >
          <Suspense fallback={null}>
            <ThreeScene
              active={
                (active || !!explorer.id) && !explorer.story && !document.hidden
              }
            >
              <ArrivalScene mobile={mobile} reduced={reduced} />
            </ThreeScene>
          </Suspense>
        </div>
        {!ready && (
          <div className="asset-loader" role="status">
            <span>MELB.</span>
            <small>Preparing your arrival</small>
            <i />
          </div>
        )}
        {loadIssue && (
          <div className="scene-load-notice" role="status">
            The 3D view is taking longer than expected.{" "}
            <button
              onClick={() => {
                setLoadIssue(false);
                jump(0.98);
              }}
            >
              Browse the destination guide ↗
            </button>
          </div>
        )}
        <div className="opening-occluder" aria-hidden="true">
          <div className="opening-word">
            <span className="eyebrow opening-kicker">
              A DIFFERENT PERSPECTIVE
            </span>
            <span className="occluded-word">MELB.</span>
            <div className="word-subline">
              <span>ARRIVE.</span>
              <span>EXPLORE.</span>
              <span>BELONG.</span>
            </div>
          </div>
        </div>
        <div className="arrival-text-front">
          <div className="opening-caption">
            <h2>
              A world away.
              <br />
              <em>A little closer.</em>
            </h2>
            <p>Your journey to Melbourne starts here.</p>
          </div>
          <div className="flight-copy">
            <span className="eyebrow">01 — THE JOURNEY</span>
            <h2>
              Let the everyday
              <br />
              <em>fall away.</em>
            </h2>
          </div>
          <div className="map-copy">
            <span className="eyebrow">02 — A NEW PERSPECTIVE</span>
            <h2>
              Across an ocean.
              <br />
              <em>Towards a feeling.</em>
            </h2>
          </div>
          <div className="descent-copy">
            <span className="eyebrow">03 — YOUR DESTINATION</span>
            <h2>Melbourne.</h2>
            <p>Welcome to your next chapter.</p>
            <span className="destination-coordinates">
              37.8136° S &nbsp; 144.9631° E
            </span>
          </div>
          <span className="australia-label eyebrow">
            AUSTRALIA <b> / </b> SOUTHERN HEMISPHERE
          </span>
          <div id="melbourne-label" aria-hidden="true">
            <i />
            <div>
              <span>MELBOURNE</span>
              <small>VICTORIA, AUSTRALIA</small>
            </div>
          </div>
        </div>
        <div className="descent-haze" aria-hidden="true" />
        <CityInterface onExplore={() => jump(0.98)} />
        <LandmarkInterface />
        <div className="arrival-ui">
          <button className="skip-discovery" onClick={() => jump(0.98)}>
            Skip to Melbourne discovery
          </button>
          <div className="side-coordinate">
            <span>DESTINATION / MEL</span>
            <span>37.8° S &nbsp; 144.9° E</span>
          </div>
          <div className="journey-footer">
            <button
              className="scroll-prompt"
              onClick={() =>
                journey.progress > 0.96
                  ? scrollTo("#why-melbourne")
                  : jump(
                      journey.progress < 0.1
                        ? 0.18
                        : Math.min(1, journey.progress + 0.2),
                    )
              }
            >
              <span className="scroll-arrow">↓</span>
              <span>SCROLL TO EXPLORE</span>
            </button>
            <nav className="journey-track" aria-label="Arrival sequence">
              <div className="journey-track-line">
                <i />
              </div>
              {stops.map(([label, p], i) => (
                <button
                  key={label}
                  className="journey-stop"
                  onClick={() => jump(p)}
                  aria-current={i === 0 ? "step" : false}
                >
                  <span>0{i + 1}</span>
                  {label}
                </button>
              ))}
            </nav>
            <span className="arrival-edition">
              A CITY. A FEELING.
              <br />A PLACE TO BELONG.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
