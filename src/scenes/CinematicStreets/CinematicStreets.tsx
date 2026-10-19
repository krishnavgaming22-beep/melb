import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
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
  nearbyClips,
  sceneTreatment,
} from "./videoTimeline";
import { VideoScrubber } from "./VideoScrubber";
import images from "./images.json";
import { streetShots } from "./timeline";
import "./streets.css";
type Decoder = { video: HTMLVideoElement; controller: VideoScrubber };
type Register = (index: number, video: HTMLVideoElement) => () => void;
function FilmLayer({
  index,
  compact,
  register,
  onError,
}: {
  index: number;
  compact: boolean;
  register: Register;
  onError: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null),
    clip = filmClips[index];
  useEffect(() => {
    const video = ref.current!;
    video.src = assetUrl(
      `/assets/streets/video/${clip.id}-${compact ? 1280 : 1920}.mp4`,
    );
    return register(index, video);
  }, [index, compact, register, clip.id]);
  return (
    <video
      ref={ref}
      className={`street-film-video ${clip.portrait ? "film-portrait" : ""}`}
      src={assetUrl(
        `/assets/streets/video/${clip.id}-${compact ? 1280 : 1920}.mp4`,
      )}
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      aria-label={`${clip.location} — scroll-controlled footage`}
      onError={onError}
    />
  );
}
export function CinematicStreets() {
  const root = useRef<HTMLElement>(null),
    stage = useRef<HTMLDivElement>(null),
    decoders = useRef(new Map<number, Decoder>());
  const progress = useRef(0),
    paint = useRef(() => {}),
    active = useRef(false),
    targetRef = useRef(0),
    shownRef = useRef(0),
    chapterRef = useRef(0),
    direction = useRef(1);
  const reduced = useReducedMotion(),
    scrollTo = useScrollTo();
  const [near, setNear] = useState(false),
    [chapter, setChapter] = useState(0),
    [target, setTarget] = useState(0),
    [shown, setShown] = useState(0),
    [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false),
    [compact, setCompact] = useState(() => innerWidth < 700);
  const frame = filmChapters[chapter],
    clip = filmClips[shown];
  const register = useCallback<Register>((index, video) => {
    const controller = new VideoScrubber(video, () => paint.current());
    decoders.current.set(index, { video, controller });
    paint.current();
    return () => {
      controller.dispose();
      decoders.current.delete(index);
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, []);
  paint.current = () => {
    const f = videoFrame(progress.current),
      pool = decoders.current;
    if (targetRef.current !== f.clip) {
      direction.current = f.clip > targetRef.current ? 1 : -1;
      targetRef.current = f.clip;
      setTarget(f.clip);
      setFailed(false);
    }
    pool.forEach(({ controller }, i) =>
      controller.request(
        i === f.clip ? f.time : i < f.clip ? filmClips[i].duration - 0.06 : 0,
      ),
    );
    const wanted = pool.get(f.clip)?.controller;
    // Keep the last decoded image and its caption until the new destination is ready.
    if (wanted?.ready && Math.abs(wanted.settled - f.time) < 0.65) {
      if (shownRef.current !== f.clip) {
        shownRef.current = f.clip;
        setShown(f.clip);
      }
      if (chapterRef.current !== f.chapter) {
        chapterRef.current = f.chapter;
        setChapter(f.chapter);
      }
      setReady(true);
    }
    const visible = shownRef.current,
      visibleChapter = chapterRef.current,
      scene = filmChapters[visibleChapter];
    const local = Math.max(
      0,
      Math.min(
        1,
        ((pool.get(visible)?.controller.settled ?? scene.start) - scene.start) /
          (scene.end - scene.start),
      ),
    );
    const treatment = sceneTreatment(visibleChapter, reduced ? 0.5 : local);
    pool.forEach(({ video, controller }, i) => {
      video.style.opacity = controller.ready && i === visible ? "1" : "0";
      video.style.transform = reduced
        ? "none"
        : `translateY(${treatment.y}%) scale(${treatment.scale})`;
      video.style.clipPath = reduced
        ? "none"
        : `inset(${treatment.inset}% ${treatment.side}% round ${treatment.inset * 2}px)`;
    });
    const poster = stage.current?.querySelector<HTMLElement>(
      ".street-film-poster",
    );
    if (poster)
      poster.style.opacity = pool.get(visible)?.controller.ready ? "0" : "1";
    stage.current?.style.setProperty("--street-progress", String(f.p));
    stage.current?.style.setProperty(
      "--caption-y",
      `${reduced ? 0 : treatment.titleY}px`,
    );
    stage.current?.style.setProperty(
      "--caption-opacity",
      String(reduced ? 1 : treatment.captionOpacity),
    );
    const output = stage.current?.querySelector<HTMLOutputElement>("output");
    if (output) {
      const cs = [...pool.values()].map((v) => v.controller);
      Object.assign(output.dataset, {
        target: f.time.toFixed(3),
        time: (pool.get(visible)?.controller.settled ?? 0).toFixed(3),
        clip: String(visible),
        chapter: String(visibleChapter),
        pool: String(pool.size),
        seeks: String(cs.reduce((n, c) => n + c.seeks, 0)),
        maxSeekMs: String(
          Math.round(Math.max(0, ...cs.map((c) => c.maxSeekMs))),
        ),
        meanSeekMs: String(
          Math.round(
            cs.reduce((n, c) => n + c.totalSeekMs, 0) /
              Math.max(
                1,
                cs.reduce((n, c) => n + c.seeks, 0),
              ),
          ),
        ),
      });
    }
  };
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => setNear(e.isIntersecting),
      { rootMargin: "100% 0px" },
    );
    if (root.current) observer.observe(root.current);
    const mq = matchMedia("(max-width:699px)"),
      resize = () => setCompact(mq.matches);
    mq.addEventListener("change", resize);
    return () => {
      observer.disconnect();
      mq.removeEventListener("change", resize);
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
        start: "top 1px",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
        onToggle(s) {
          active.current = s.isActive;
          document.body.classList.toggle("street-film-active", s.isActive);
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
      active.current = false;
      document.body.classList.remove("street-film-active");
    };
  }, [reduced]);
  useEffect(() => {
    if (!near) return;
    const tick = (_time: number, delta: number) => {
      if (document.hidden) return;
      decoders.current.forEach(({ controller }) => controller.tick());
      if (active.current) recordFrame("street-video", delta / 1000, 0, 0);
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [near]);
  const jump = (index: number) => {
    const p =
      (Math.max(0, Math.min(filmChapters.length - 1, index)) +
        (reduced ? 0.35 : 0.015)) /
      filmChapters.length;
    if (reduced) {
      progress.current = p;
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
        <span className="eyebrow">05 / TWENTY MOMENTS. ONE MELBOURNE.</span>
        <h2>
          Beyond the skyline.
          <br />
          <em>Into the city.</em>
        </h2>
        <p>
          Follow the river. Wander a laneway. Look up, slow down, find the sea.
          Twenty moments from eleven real films — a Melbourne journey shaped by
          your scroll.
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
        <div
          ref={stage}
          className={`street-film-stage ${clip.portrait ? "is-portrait-film" : ""}`}
          data-cursor="film"
        >
          <div className="street-film-images">
            <img
              className={`street-film-poster ${clip.portrait ? "film-portrait" : ""}`}
              src={assetUrl(`/assets/streets/video/${clip.id}-poster.webp`)}
              alt={clip.location}
              loading="lazy"
            />
            {near &&
              nearbyClips(target, shown, direction.current).map((i) => (
                <FilmLayer
                  key={`${i}-${compact}`}
                  index={i}
                  compact={compact}
                  register={register}
                  onError={() => {
                    if (i === targetRef.current) setFailed(true);
                  }}
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
                scrollTo("#your-melbourne");
              }}
            >
              Skip journey ↗
            </a>
          </header>
          {near && (!ready || failed) && (
            <p className="street-film-status" role="status">
              {failed
                ? "This film could not load. Choose another moment below."
                : "Preparing the film…"}
            </p>
          )}
          <div className="street-film-caption">
            <span className="eyebrow">{frame.kind}</span>
            <div className="film-title-mask">
              <h2>{frame.title}</h2>
            </div>
            <p>{frame.text}</p>
          </div>
          <footer className="street-film-footer">
            <span className="street-film-count">
              {String(chapter + 1).padStart(2, "0")}
              <i> / {filmChapters.length}</i>
              <label className="film-scene-picker">
                <span className="sr-only">Choose a film scene</span>
                <select
                  aria-label="Choose a film scene"
                  value={chapter}
                  onChange={(e) => jump(Number(e.target.value))}
                >
                  {filmChapters.map((s, i) => (
                    <option key={s.kind} value={i}>
                      {String(i + 1).padStart(2, "0")} ·{" "}
                      {s.kind.split(" / ")[1]}
                    </option>
                  ))}
                </select>
              </label>
            </span>
            <span className="street-film-hint">
              {reduced ? "CHOOSE A MOMENT" : "SCROLL TO TRAVEL"}
              <small>Real footage · Your scroll controls time</small>
              <small>{clip.author} · Pexels</small>
            </span>
            <div className="street-film-actions">
              <button
                disabled={chapter === 0}
                aria-label="Previous film scene"
                onClick={() => jump(chapter - 1)}
              >
                ←
              </button>
              <button
                disabled={chapter === filmChapters.length - 1}
                aria-label="Next film scene"
                onClick={() => jump(chapter + 1)}
              >
                →
              </button>
              <button onClick={() => jump(0)}>Replay ↺</button>
              <a
                href="#street-credits"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("#street-credits");
                }}
              >
                Credits
              </a>
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
            One city.
            <br />
            <em>Many perspectives.</em>
          </h3>
          <p>
            Twenty moments, eleven real films. From the river to Hosier Lane,
            the State Library, the Shrine and St Kilda. Scroll in either
            direction to control time. Changes of location are editorial cuts;
            this is a curated film journey, not unrestricted 3D exploration.
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
