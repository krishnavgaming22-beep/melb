import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useScrollTo } from "../../components/motion/ScrollContext";
import { recordFrame } from "../../components/motion/frameMetrics";
import { assetUrl } from "../../utils/assetUrl";
import {
  filmClips,
  filmChapters,
  videoFrame,
  chapterFromTime,
} from "./videoTimeline";
import { VideoScrubber } from "./VideoScrubber";
import images from "./images.json";
import { streetShots } from "./timeline";
import "./streets.css";

export function CinematicStreets() {
  const root = useRef<HTMLElement>(null),
    stage = useRef<HTMLDivElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const controllers = useRef<VideoScrubber[]>([]);
  const progress = useRef(0),
    paint = useRef(() => {}),
    active = useRef(false),
    lastChapter = useRef(0),
    shown = useRef(0);
  const reduced = useReducedMotion(),
    scrollTo = useScrollTo();
  const [near, setNear] = useState(false),
    [chapter, setChapter] = useState(0),
    [failed, setFailed] = useState(false),
    [ready, setReady] = useState(false);
  const [compact, setCompact] = useState(() => innerWidth < 700);
  const frame = filmChapters[chapter],
    clip = filmClips[Math.floor(chapter / 4)];
  paint.current = () => {
    const f = videoFrame(progress.current),
      cs = controllers.current;
    cs.forEach((c, i) =>
      c.request(i === f.clip ? f.time : i < f.clip ? 19.95 : 0),
    );
    const wanted = cs[f.clip];
    // Captions switch only after the new clip has decoded at its requested time.
    if (wanted?.ready && Math.abs(wanted.settled - f.time) < 0.65) {
      shown.current = f.clip;
      const index = chapterFromTime(f.clip, wanted.settled);
      if (index !== lastChapter.current) {
        lastChapter.current = index;
        setChapter(index);
      }
      setReady(true);
    }
    videos.current.forEach((v, i) => {
      if (v) v.style.opacity = cs[i]?.ready && i === shown.current ? "1" : "0";
    });
    stage.current?.style.setProperty("--street-progress", String(f.p));
    const output = stage.current?.querySelector<HTMLOutputElement>("output");
    if (output) {
      output.dataset.target = f.time.toFixed(3);
      output.dataset.time = (cs[shown.current]?.settled ?? 0).toFixed(3);
      output.dataset.clip = String(shown.current);
      output.dataset.seeks = String(cs.reduce((n, c) => n + c.seeks, 0));
      output.dataset.maxSeekMs = String(
        Math.round(Math.max(0, ...cs.map((c) => c.maxSeekMs))),
      );
      output.dataset.meanSeekMs = String(
        Math.round(
          cs.reduce((n, c) => n + c.totalSeekMs, 0) /
            Math.max(
              1,
              cs.reduce((n, c) => n + c.seeks, 0),
            ),
        ),
      );
    }
  };
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => setNear(e.isIntersecting),
      { rootMargin: "100% 0px" },
    );
    if (root.current) observer.observe(root.current);
    const media = matchMedia("(max-width:699px)");
    const resize = () => setCompact(media.matches);
    media.addEventListener("change", resize);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", resize);
      document.body.classList.remove("street-film-active");
    };
  }, []);
  useLayoutEffect(() => {
    if (reduced) return;
    const proxy = { p: 0 };
    const animation = gsap.to(proxy, {
      p: 1,
      ease: "none",
      scrollTrigger: {
        id: "street-video",
        trigger: root.current,
        // Include the exact opening frame so the surrounding navigation yields
        // even when the visitor enters through the introductory link or Replay.
        start: "top 1px",
        end: "bottom bottom",
        scrub: 0.18,
        invalidateOnRefresh: true,
        onToggle(self) {
          active.current = self.isActive;
          document.body.classList.toggle("street-film-active", self.isActive);
        },
      },
      onUpdate() {
        progress.current = proxy.p;
        paint.current();
      },
    });
    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
      document.body.classList.remove("street-film-active");
    };
  }, [reduced]);
  useEffect(() => {
    if (!near) return;
    setReady(false);
    setFailed(false);
    controllers.current = videos.current
      .filter((v): v is HTMLVideoElement => !!v)
      .map((v) => new VideoScrubber(v, () => paint.current()));
    const tick = (_time: number, delta: number) => {
      if (document.hidden) return;
      controllers.current.forEach((c) => c.tick());
      if (active.current) recordFrame("street-video", delta / 1000, 0, 0);
    };
    paint.current();
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      controllers.current.forEach((c) => c.dispose());
      controllers.current = [];
    };
  }, [near, compact]);
  const jump = (index: number) => {
    const p = index / 8;
    if (reduced) {
      progress.current = p;
      lastChapter.current = index;
      setChapter(index);
      paint.current();
    } else if (root.current)
      scrollTo(
        root.current.getBoundingClientRect().top +
          scrollY +
          (root.current.offsetHeight - innerHeight) * p,
      );
  };
  return (
    <>
      <section className="street-film-intro" id="walk">
        <span className="eyebrow">05 / TWO STREETS. MANY STORIES.</span>
        <h2>
          Beyond the skyline.
          <br />
          <em>Into the streets.</em>
        </h2>
        <p>
          Melbourne in motion. Travel above the city, then pause at Flinders
          Street after dark. Collins Street awaits in our architectural
          notebook.
        </p>
        <a
          href="#street-film"
          onClick={(e) => {
            e.preventDefault();
            jump(0);
          }}
        >
          Scroll into the city ↓
        </a>
      </section>
      <section
        ref={root}
        id="street-film"
        className={`street-film street-video-film ${reduced ? "is-reduced" : ""}`}
        aria-label="Melbourne scroll-controlled film"
      >
        <div ref={stage} className="street-film-stage" data-cursor="film">
          <div className="street-film-images">
            <img
              className="street-film-poster"
              src={assetUrl(
                "/assets/streets/video/melbourne-aerial-poster.webp",
              )}
              alt="Melbourne skyline from a real aerial film"
              loading="lazy"
            />
            {near &&
              filmClips.map((c, i) => (
                <video
                  key={`${c.id}-${compact}`}
                  ref={(v) => {
                    videos.current[i] = v;
                  }}
                  className="street-film-video"
                  src={assetUrl(
                    `/assets/streets/video/${c.id}-${compact ? 1280 : 1920}.mp4`,
                  )}
                  muted
                  playsInline
                  preload="auto"
                  disablePictureInPicture
                  aria-label={`${c.location} — scroll-controlled footage`}
                  onError={() => setFailed(true)}
                />
              ))}
          </div>
          <header className="street-film-header">
            <span>
              MELB.<small>{clip.location}</small>
            </span>
            <a
              href="#your-melbourne"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("your-melbourne")
                  ?.focus({ preventScroll: true });
                scrollTo("#your-melbourne");
              }}
            >
              Skip journey ↗
            </a>
          </header>
          {near && !ready && (
            <p className="street-film-status" role="status">
              {failed
                ? "The film could not load. Skip ahead or revisit the architectural notebook."
                : "Preparing the film…"}
            </p>
          )}
          <div className="street-film-caption" key={chapter}>
            <span className="eyebrow">{frame.kind}</span>
            <h2>{frame.title}</h2>
            <p>{frame.text}</p>
          </div>
          <footer className="street-film-footer">
            <span className="street-film-count">
              {String(chapter + 1).padStart(2, "0")}
              <i> / 08</i>
              <small>
                {Math.floor(chapter / 4) === 0
                  ? "THE SKYLINE"
                  : "FLINDERS STREET"}
              </small>
            </span>
            <span className="street-film-hint">
              {reduced ? "CHOOSE A MOMENT" : "SCROLL TO TRAVEL"}
              <small>Real footage · Your scroll controls time</small>
              <small>{clip.author} · Pexels</small>
            </span>
            <div className="street-film-actions">
              {reduced && (
                <>
                  <button
                    disabled={chapter === 0}
                    onClick={() => jump(chapter - 1)}
                  >
                    Previous view
                  </button>
                  <button
                    disabled={chapter === 7}
                    onClick={() => jump(chapter + 1)}
                  >
                    Next view
                  </button>
                </>
              )}
              <button onClick={() => jump(0)}>Replay ↺</button>
              <a href="#street-credits">Film & photo credits</a>
            </div>
          </footer>
          <div className="street-film-line" aria-hidden="true" />
          <output hidden data-testid="film-diagnostics" />
        </div>
      </section>
      <section
        className="street-film-reading"
        id="street-credits"
        aria-label="Film and architectural notebook"
      >
        <div>
          <span className="eyebrow">THE CITY, THROUGH A LENS</span>
          <h3>
            Two streets.
            <br />
            <em>Many perspectives.</em>
          </h3>
          <p>
            Two real films: a moving aerial followed by a fixed-camera view of
            Flinders Street’s evening traffic. Scroll forwards or backwards to
            control time. The change of location is an editorial cut, not a
            continuous street-level walk.
          </p>
          <p>
            Our Collins Street architectural notebook preserves the original
            photographs and their stories. A continuous Collins Street tracking
            film is not yet available in this free collection.
          </p>
          <a href="#your-melbourne">Your Melbourne starts here ↓</a>
        </div>
        <details>
          <summary>Explore the views & photography credits</summary>
          {filmClips.map((c) => (
            <p key={c.id}>
              <a href={c.source} target="_blank" rel="noreferrer">
                {c.location}
              </a>{" "}
              — {c.author}.{" "}
              <a
                href="https://www.pexels.com/license/"
                target="_blank"
                rel="noreferrer"
              >
                Pexels License
              </a>
              . Trimmed, resized, silent, scroll-controlled.
            </p>
          ))}
          <ol>
            {streetShots.map((s, i) => {
              const photo = images.find((a) => a.id === s.image)!;
              return (
                <li key={i}>
                  <strong>
                    {s.street} — {s.title}
                  </strong>
                  <p>{s.text}</p>
                  <img
                    src={assetUrl(photo.variants["1920"].src)}
                    alt={s.text}
                    loading="lazy"
                    width="960"
                    height="640"
                  />
                  <p>
                    <a href={photo.source} target="_blank" rel="noreferrer">
                      {photo.author}
                    </a>{" "}
                    ·{" "}
                    <a href={photo.licenseUrl} target="_blank" rel="noreferrer">
                      {photo.license}
                    </a>
                    . Resized WebP; source licence retained.
                  </p>
                </li>
              );
            })}
          </ol>
          <a href={assetUrl("/assets/streets/ATTRIBUTION.json")} download>
            Photography attribution & source manifest
          </a>
        </details>
      </section>
    </>
  );
}
