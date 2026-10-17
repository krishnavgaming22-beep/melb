import { assetUrl } from "../../utils/assetUrl";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { flagshipIds, landmarkPlace, landmarks } from "./registry";
import {
  cameraCommand,
  chapterBy,
  exitLandmark,
  getExplorer,
  openLandmark,
  modelFailed,
  selectFeature,
  setMode,
  showStory,
  useExplorer,
} from "./store";
import "./landmark.css";
import { advanceTour, setTourProgress } from "./tour";
export function LandmarkInterface() {
  const s = useExplorer(),
    reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const active = !!s.id;
  useEffect(() => {
    if (!s.id) return;
    const id = s.id;
    const failed = () => modelFailed(id);
    const timeout = window.setTimeout(() => {
      if (!getExplorer().ready) failed();
    }, 27000);
    window.addEventListener("melb:scene-failed", failed);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("melb:scene-failed", failed);
    };
  }, [s.id, s.session]);
  useEffect(() => {
    if (!active) return;
    const prior = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow,
      padding = document.body.style.paddingRight;
    document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
    document.body.style.overflow = "hidden";
    document.body.classList.add("landmark-open");
    window.dispatchEvent(
      new CustomEvent("melb:landmark-active", { detail: true }),
    );
    root.current?.focus();
    const keys = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (getExplorer().story) showStory(false);
        else exitLandmark(reduced);
        return;
      }
      if (e.key === "Tab") {
        const focusable = Array.from(
          root.current?.querySelectorAll<HTMLElement>(
            "button:not(:disabled),a[href],select,input",
          ) ?? [],
        ).filter(
          (el) =>
            !el.closest("[hidden]") &&
            getComputedStyle(el).visibility !== "hidden",
        );
        const first = focusable[0],
          last = focusable.at(-1);
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === root.current)
        ) {
          e.preventDefault();
          last?.focus();
        } else if (
          !e.shiftKey &&
          (document.activeElement === last ||
            document.activeElement === root.current)
        ) {
          e.preventDefault();
          first?.focus();
        }
      }
      if (
        (e.target instanceof Element &&
          e.target.closest("select,input,textarea")) ||
        getExplorer().story
      )
        return;
      if (
        [
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "+",
          "-",
          "Home",
        ].includes(e.key)
      ) {
        e.preventDefault();
        const guided = getExplorer().mode === "guided";
        if (guided && (e.key === "ArrowRight" || e.key === "ArrowDown"))
          chapterBy(1);
        else if (guided && (e.key === "ArrowLeft" || e.key === "ArrowUp"))
          chapterBy(-1);
        else
          cameraCommand(
            (
              {
                ArrowLeft: "left",
                ArrowRight: "right",
                ArrowUp: "up",
                ArrowDown: "down",
                "+": "in",
                "-": "out",
                Home: "reset",
              } as const
            )[e.key as "Home"],
          );
      }
    };
    const wheel = (e: WheelEvent) => {
      const current = getExplorer();
      if (
        current.mode !== "guided" ||
        current.story ||
        (e.target instanceof Element &&
          e.target.closest(".landmark-panel,.landmark-story"))
      )
        return;
      e.preventDefault();
      if (!current.ready) return;
      advanceTour(
        (e.deltaY *
          (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1)) /
          3000,
      );
    };
    document.addEventListener("keydown", keys);
    window.addEventListener("wheel", wheel, { passive: false });
    return () => {
      document.removeEventListener("keydown", keys);
      window.removeEventListener("wheel", wheel);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = padding;
      document.body.classList.remove("landmark-open");
      window.dispatchEvent(
        new CustomEvent("melb:landmark-active", { detail: false }),
      );
      prior?.focus({ preventScroll: true });
    };
  }, [active, reduced]);
  if (!s.id) return null;
  const lm = landmarks[s.id],
    place = landmarkPlace(s.id),
    feature = lm.features[s.displayChapter],
    photo = place.photo;
  return createPortal(
    <div
      ref={root}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`${place.name} immersive explorer`}
      className={`landmark-explorer ${s.phase} ${s.story ? "story-open" : ""}`}
      data-mode={s.mode}
      data-lenis-prevent
    >
      <div key={s.session} className="landmark-curtain" aria-hidden="true" />
      <header className="landmark-header">
        <button
          className="landmark-brand"
          onClick={() => exitLandmark(reduced)}
          aria-label="Return to Melbourne map"
        >
          MELB.<span>← Return to Melbourne</span>
        </button>
        <div
          className="landmark-modes"
          role="group"
          aria-label="Exploration mode"
        >
          <button
            aria-pressed={s.mode === "free"}
            onClick={() => setMode("free")}
          >
            Free Explore
          </button>
          <button
            aria-pressed={s.mode === "guided"}
            onClick={() => setMode("guided")}
          >
            Guided Experience
          </button>
        </div>
        <label className="landmark-switch">
          <span className="sr-only">Choose landmark</span>
          <select
            value={s.id}
            onChange={(e) => openLandmark(e.target.value as typeof lm.id)}
          >
            {flagshipIds.map((id) => (
              <option key={id} value={id}>
                {landmarkPlace(id).short}
              </option>
            ))}
          </select>
        </label>
      </header>
      {!s.story && (
        <>
          <div className="landmark-title">
            <span className="eyebrow">
              MELBOURNE / {place.categories.join(" + ")}
            </span>
            <h2>{lm.title}</h2>
            <p>{lm.subtitle}</p>
          </div>
          {!s.ready && !s.error && (
            <div className="landmark-loading" role="status">
              <span className="eyebrow">A CLOSER PERSPECTIVE</span>
              <p>Preparing {place.short}…</p>
              <small>You can return to the map at any time.</small>
            </div>
          )}
          {s.error && (
            <div className="landmark-loading" role="alert">
              <p>The architectural view could not load.</p>
              <button onClick={() => openLandmark(lm.id)}>Try again</button>
              <button onClick={() => showStory(true)}>
                Read the illustrated story
              </button>
            </div>
          )}
          <div
            className="landmark-pins"
            aria-label="Architectural features"
            hidden={!s.ready || s.mode !== "free"}
          >
            {lm.features.map((f, i) => (
              <button
                id={`landmark-pin-${i}`}
                key={i}
                aria-label={f.title}
                aria-pressed={s.feature === i}
                onClick={() => selectFeature(i)}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                <em>{f.title}</em>
              </button>
            ))}
          </div>
          {(s.mode === "guided" || s.feature !== null) && (
            <section
              className={`landmark-panel ${s.settled || s.error ? "arrived" : "moving"}`}
              aria-label="Feature story"
              data-lenis-prevent
            >
              <span className="eyebrow">
                {s.mode === "guided" ? "GUIDED JOURNEY" : "A CLOSER LOOK"} /{" "}
                {String(s.chapter + 1).padStart(2, "0")} — 06
              </span>
              <div aria-live="polite" aria-busy={!s.settled && !s.error}>
                {
                  <div key={feature.title} className="landmark-copy">
                    <h3>{feature.title}</h3>
                    <p>{feature.text}</p>
                    <a href={feature.source} target="_blank" rel="noreferrer">
                      Read the source ↗
                    </a>
                  </div>
                }
              </div>
              {s.mode === "guided" && (
                <label className="tour-scrubber">
                  Journey progress
                  <input
                    id="landmark-tour-progress"
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    defaultValue={s.chapter * 20}
                    onChange={(e) =>
                      setTourProgress(Number(e.target.value) / 100)
                    }
                    aria-label="Guided journey progress"
                  />
                </label>
              )}
              {s.mode === "guided" && (
                <div className="chapter-controls">
                  <button
                    disabled={s.chapter === 0}
                    onClick={() => chapterBy(-1)}
                    aria-label="Previous chapter"
                  >
                    ←
                  </button>
                  <div className="chapter-dots" aria-label="Chapters">
                    {lm.features.map((f, i) => (
                      <button
                        key={f.title}
                        aria-label={`Chapter ${i + 1}: ${f.title}`}
                        aria-current={s.chapter === i ? "step" : undefined}
                        onClick={() => selectFeature(i)}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={s.chapter === 5}
                    onClick={() => chapterBy(1)}
                    aria-label="Next chapter"
                  >
                    →
                  </button>
                </div>
              )}
              {s.mode === "guided" && s.chapter === 5 && s.settled && (
                <button
                  className="landmark-story-link"
                  onClick={() => setMode("free")}
                >
                  Keep exploring freely ↗
                </button>
              )}
            </section>
          )}
          <nav
            className="landmark-feature-index"
            aria-label="Explore architectural features"
          >
            <span className="eyebrow">EXPLORE THE DETAILS</span>
            {lm.features.map((f, i) => (
              <button
                key={f.title}
                onClick={() => selectFeature(i)}
                aria-pressed={s.feature === i}
              >
                <small>
                  {s.visited.includes(i) ? "•" : String(i + 1).padStart(2, "0")}
                </small>
                {f.title}
              </button>
            ))}
          </nav>
        </>
      )}
      {s.story && (
        <article
          className="landmark-story"
          aria-label="Landmark story"
          data-lenis-prevent
        >
          <button className="story-close" onClick={() => showStory(false)}>
            ← Back to the architecture
          </button>
          <span className="eyebrow">
            THE MELBOURNE STORIES / {place.number}
          </span>
          <h2>{place.name}</h2>
          {photo && (
            <figure>
              <img src={photo.src} alt={photo.alt} />
              <figcaption>
                <a href={photo.source} target="_blank" rel="noreferrer">
                  {photo.credit}
                </a>{" "}
                ·{" "}
                <a href={photo.licenseUrl} target="_blank" rel="noreferrer">
                  {photo.license}
                </a>
              </figcaption>
            </figure>
          )}
          <p className="story-lead">{place.intro}</p>
          <p>{place.story}</p>
          <h3>In the life of the city</h3>
          <ul>
            {place.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <p>{place.whyVisit}</p>
          <h3>Read the architecture</h3>
          {lm.features.map((f) => (
            <section key={f.title}>
              <h4>{f.title}</h4>
              <p>
                {f.text}{" "}
                <a
                  href={f.source}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Source for ${f.title}`}
                >
                  ↗
                </a>
              </p>
            </section>
          ))}
          <h3>Plan your visit</h3>
          <p>{place.visit}</p>
          <a href={place.href} target="_blank" rel="noreferrer">
            Official visitor information ↗
          </a>
          <details>
            <summary>About this architectural study</summary>
            <p>
              Original reference-based exterior reconstruction. Proportions and
              fine details are estimated, not survey measurements. Surroundings
              are simplified; no interior access is represented. Compare with
              the credited photograph for the actual architecture.
            </p>
            <p>{photo?.changes}</p>
            {s.id === "federation" && (
              <p>
                Mapped building footprints:{" "}
                <a
                  href="https://www.openstreetmap.org/copyright"
                  target="_blank"
                  rel="noreferrer"
                >
                  © OpenStreetMap contributors, ODbL 1.0
                </a>
                .{" "}
                <a
                  href={assetUrl(
                    "/assets/landmarks/federation-footprints.geojson",
                  )}
                >
                  Download source footprints
                </a>
                . Heights and façade details are estimated.
              </p>
            )}
            {place.sources.map((url) => (
              <p key={url}>
                <a href={url} target="_blank" rel="noreferrer">
                  {new URL(url).hostname} ↗
                </a>
              </p>
            ))}
          </details>
        </article>
      )}
      <footer className="landmark-footer">
        <p>
          {s.mode === "free"
            ? "Drag right to look right · Drag up to rise · Pinch or scroll to zoom"
            : "Six perspectives · Use arrows or scroll to continue"}
          <small>Architectural study · Estimated detail</small>
        </p>
        <div>
          <button onClick={() => showStory(!s.story)}>
            {s.story ? "Close story" : "Explore the story"} ↗
          </button>
          <button
            disabled={!s.ready || s.mode === "guided"}
            onClick={() => cameraCommand("in")}
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            disabled={!s.ready || s.mode === "guided"}
            onClick={() => cameraCommand("out")}
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            disabled={!s.ready}
            onClick={() => {
              setMode("free");
              cameraCommand("reset");
            }}
          >
            Reset view ↶
          </button>
        </div>
      </footer>
    </div>,
    document.body,
  );
}
