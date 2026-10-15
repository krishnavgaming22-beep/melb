import { assetUrl } from "../../utils/assetUrl";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useScrollTo } from "../../components/motion/ScrollContext";
import { streetFrame, streetShots } from "./timeline";
import images from "./images.json";
import "./streets.css";

/** A photographic essay. One document-scroll progress controls framing and dissolves. */
const imageSize = () =>
  innerWidth < 700
    ? "960"
    : innerWidth * Math.min(window.devicePixelRatio || 1, 2) > 1920
      ? "3200"
      : "1920";
export function CinematicStreets() {
  const root = useRef<HTMLElement>(null),
    stage = useRef<HTMLDivElement>(null);
  const lastIndex = useRef(0);
  const progress = useRef(0),
    paint = useRef<() => void>(() => {});
  const reduced = useReducedMotion(),
    scrollTo = useScrollTo();
  const [index, setIndex] = useState(0),
    [near, setNear] = useState(false);
  const [loaded, setLoaded] = useState(0),
    [presented, setPresented] = useState<string>(streetShots[0].image),
    [failed, setFailed] = useState<string[]>([]);
  const [width, setWidth] = useState(() => imageSize());
  const shot = streetShots[index];
  const ids = [
    ...new Set([
      streetShots[Math.max(0, index - 1)].image,
      shot.image,
      streetShots[Math.min(7, index + 1)].image,
      presented,
    ]),
  ];
  const current = images.find((a) => a.id === shot.image)!;
  paint.current = () => {
    const f = streetFrame(progress.current, reduced);
    const nextId = streetShots[f.next].image;
    const hasImage = (id: string) =>
      !!stage.current?.querySelector(
        `img[data-image="${id}"][data-ready="true"]`,
      );
    const currentReady = hasImage(streetShots[f.index].image);
    const nextReady = hasImage(nextId);
    stage.current
      ?.querySelectorAll<HTMLElement>(".street-film-photo")
      .forEach((el) => {
        const id = el.dataset.image;
        const active =
          id === (currentReady ? streetShots[f.index].image : presented);
        const next = id === nextId && !active;
        const canBlend =
          currentReady && nextReady && nextId !== streetShots[f.index].image;
        el.style.opacity = String(
          active
            ? canBlend
              ? 1 - f.blend
              : 1
            : next && canBlend
              ? f.blend
              : 0,
        );
        if (currentReady || !active)
          el.style.transform =
            active && !reduced && innerWidth >= 700
              ? `translate3d(${f.x}%,0,0) scale(${f.scale * f.detail})`
              : "none";
      });
    stage.current?.style.setProperty(
      "--street-progress",
      String(progress.current),
    );
  };
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => setNear(e.isIntersecting),
      { rootMargin: "100% 0px" },
    );
    if (root.current) observer.observe(root.current);
    const resize = () => setWidth(imageSize());
    const chrome = () => {
      const bounds = root.current?.getBoundingClientRect();
      document.body.classList.toggle(
        "street-film-active",
        !!bounds && bounds.top <= 40 && bounds.bottom > innerHeight * 0.6,
      );
    };
    window.addEventListener("scroll", chrome, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", chrome);
      document.body.classList.remove("street-film-active");
    };
  }, []);
  useLayoutEffect(() => {
    if (reduced) return;
    const trigger = ScrollTrigger.create({
      trigger: root.current,
      start: "top top",
      end: "bottom bottom",
      invalidateOnRefresh: true,
      onUpdate(self) {
        progress.current = self.progress;
        const next = streetFrame(self.progress).index;
        if (lastIndex.current !== next) {
          lastIndex.current = next;
          setIndex(next);
        }
        paint.current();
      },
      onRefresh(self) {
        progress.current = self.progress;
        const next = streetFrame(self.progress).index;
        if (lastIndex.current !== next) {
          lastIndex.current = next;
          setIndex(next);
        }
        paint.current();
      },
    });
    return () => trigger.kill();
  }, [reduced]);
  useLayoutEffect(() => {
    if (
      stage.current?.querySelector(
        `img[data-image="${shot.image}"][data-ready="true"]`,
      )
    )
      setPresented(shot.image);
    paint.current();
  }, [index, loaded, width, reduced, shot.image, presented]);
  function jump(next: number) {
    const p = Math.max(0, Math.min(7, next)) / 8;
    if (reduced) {
      progress.current = p;
      lastIndex.current = streetFrame(p, true).index;
      setIndex(lastIndex.current);
    } else if (root.current)
      scrollTo(
        window.scrollY +
          root.current.getBoundingClientRect().top +
          p * (root.current.offsetHeight - innerHeight),
      );
  }
  const error = failed.includes(`${shot.image}-${width}`);
  const ready = !!stage.current?.querySelector(
    `img[data-image="${shot.image}"][data-ready="true"]`,
  );
  return (
    <>
      <section id="walk" className="street-film-intro">
        <span className="eyebrow">05 / TWO STREETS. MANY STORIES.</span>
        <h2>
          Beyond the skyline.
          <br />
          <em>Into the streets.</em>
        </h2>
        <p>
          Flinders Street & Collins Street. An architectural photographic
          journey through real Melbourne.
        </p>
        <a href="#street-film">
          Scroll into the city <span aria-hidden="true">↓</span>
        </a>
      </section>
      <section
        ref={root}
        id="street-film"
        className={`street-film ${reduced ? "is-reduced" : ""}`}
        aria-label="Melbourne streets photographic journey"
      >
        <div ref={stage} className="street-film-stage">
          <div className="street-film-images" aria-hidden="true">
            {near &&
              ids.map((id) => {
                const a = images.find((a) => a.id === id)!;
                const v = a.variants[width as keyof typeof a.variants];
                return (
                  <img
                    key={`${id}-${width}`}
                    data-image={id}
                    className="street-film-photo"
                    src={assetUrl(v.src)}
                    width={v.width}
                    height={v.height}
                    alt=""
                    decoding="async"
                    style={{
                      objectPosition: streetShots.find((s) => s.image === id)
                        ?.position,
                    }}
                    onLoad={async (e) => {
                      const image = e.currentTarget;
                      try {
                        await image.decode();
                        if (image.isConnected) {
                          image.dataset.ready = "true";
                          setLoaded((v) => v + 1);
                        }
                      } catch {
                        if (image.isConnected)
                          setFailed((v) => [...v, `${id}-${width}`]);
                      }
                    }}
                    onError={() => setFailed((v) => [...v, `${id}-${width}`])}
                  />
                );
              })}
          </div>
          <header className="street-film-header">
            <span>
              MELB.<small>{shot.street} / Melbourne</small>
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
          {!ready && near && (
            <p className="street-film-status" role="status">
              {error
                ? "This photograph could not load. The stories and navigation remain available."
                : "Preparing this view…"}
            </p>
          )}
          <div className="street-film-caption">
            <span className="eyebrow">{shot.kind}</span>
            <h2>{shot.title}</h2>
            <p>{shot.text}</p>
          </div>
          <footer className="street-film-footer">
            <span className="street-film-count">
              {String(index + 1).padStart(2, "0")}
              <i> / 08</i>
              <small>{shot.street}</small>
            </span>
            <span className="street-film-hint">
              {reduced ? "CHOOSE A VIEW" : "SCROLL TO EXPLORE"}
              <small>Real photographs · Directed framing</small>
              <small>
                {current.author} · {current.license}
              </small>
            </span>
            <div className="street-film-actions">
              {reduced && (
                <>
                  <button
                    disabled={index === 0}
                    onClick={() => jump(index - 1)}
                  >
                    Previous view
                  </button>
                  <button
                    disabled={index === 7}
                    onClick={() => jump(index + 1)}
                  >
                    Next view
                  </button>
                </>
              )}
              <button onClick={() => jump(0)}>Replay ↺</button>
              <a href="#street-credits">Photo credits</a>
            </div>
          </footer>
          <div className="street-film-line" aria-hidden="true" />
        </div>
      </section>
      <section
        className="street-film-reading"
        id="street-credits"
        aria-label="Street photography and sources"
      >
        <div>
          <span className="eyebrow">THE CITY, THROUGH A LENS</span>
          <h3>
            Two streets.
            <br />
            <em>Many perspectives.</em>
          </h3>
          <p>
            This is a curated photographic essay, with gentle framing and
            dissolves controlled by your scroll. Views were captured on
            different dates; transitions are editorial, not a continuous walk or
            unrestricted 3D exploration.
          </p>
          <a href="#your-melbourne">Your Melbourne starts here ↓</a>
        </div>
        <details>
          <summary>Explore the views & photography credits</summary>
          <ol>
            {streetShots.map((s, i) => (
              <li key={i}>
                <strong>
                  {s.street} — {s.title}
                </strong>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
          {images.map((a) => (
            <p key={a.id}>
              <a href={a.source} target="_blank" rel="noreferrer">
                {a.title.replace("File:", "")}
              </a>{" "}
              — {a.author}.{" "}
              <a href={a.licenseUrl} target="_blank" rel="noreferrer">
                {a.license}
              </a>
              . Resized WebP; animated framing. Derivatives retain the source
              licence.
            </p>
          ))}
          <a href={assetUrl("/assets/streets/ATTRIBUTION.json")} download>
            Download attribution & source manifest
          </a>
        </details>
        <span className="street-film-current-credit">
          Current view: {current.author} · {current.license}
        </span>
      </section>
    </>
  );
}
