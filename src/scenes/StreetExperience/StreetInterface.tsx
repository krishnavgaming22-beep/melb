import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import {
  closeStreet,
  getStreet,
  streetLook,
  streetPoint,
  updateStreet,
  useStreet,
} from "./store";
import "./street.css";
const stories = [
  [
    "A street, captured",
    "Look along part of Bourke Street Mall, within a 281-metre photomesh tile. The mesh records the city in May 2020. It is a historical aerial capture, with missing and distorted street-level surfaces.",
  ],
  [
    "People and trams",
    "Bourke Street Mall is a pedestrian and tram precinct between Elizabeth and Swanston streets. These viewpoints are a digital inspection, not a walking route or a guide to crossing tram tracks.",
  ],
  [
    "Look above the shopfronts",
    "The capture preserves the relationship between real buildings, but awnings, trees and narrow spaces obscure lower façades. Look up to compare the clearer upper levels with the fragmented ground plane.",
  ],
  [
    "Continue in the real city",
    "Visit the Melbourne Visitor Booth in Bourke Street Mall for maps and local recommendations. The current city has changed since this capture; use the official visitor information when planning a trip.",
  ],
];
export function StreetInterface() {
  const s = useStreet(),
    reduced = useReducedMotion(),
    root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!s.open) return;
    const prior = document.activeElement as HTMLElement | null,
      overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("street-open");
    root.current?.focus();
    window.dispatchEvent(
      new CustomEvent("melb:landmark-active", { detail: true }),
    );
    const fail = () => updateStreet({ error: true, playing: false });
    const keys = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeStreet();
        return;
      }
      if (e.key === "Tab") {
        const els = Array.from(
          root.current?.querySelectorAll<HTMLElement>(
            "button:not(:disabled),a,select",
          ) ?? [],
        );
        const first = els[0],
          last = els.at(-1);
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
        return;
      }
      if ((e.target as Element)?.closest("button,select,a")) return;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        if (e.key === "ArrowLeft") streetLook.yaw -= 0.16;
        if (e.key === "ArrowRight") streetLook.yaw += 0.16;
        if (e.key === "ArrowUp") streetPoint(getStreet().point + 1);
        if (e.key === "ArrowDown") streetPoint(getStreet().point - 1);
      }
    };
    document.addEventListener("keydown", keys);
    window.addEventListener("melb:scene-failed", fail);
    return () => {
      document.removeEventListener("keydown", keys);
      window.removeEventListener("melb:scene-failed", fail);
      document.body.style.overflow = overflow;
      document.body.classList.remove("street-open");
      window.dispatchEvent(
        new CustomEvent("melb:landmark-active", { detail: false }),
      );
      prior?.focus({ preventScroll: true });
    };
  }, [s.open]);
  if (!s.open) return null;
  return createPortal(
    <div
      className="street-explorer"
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label="Bourke Street captured viewpoints"
      tabIndex={-1}
      data-lenis-prevent
    >
      <div id="street-view-curtain" aria-hidden="true" />
      <header>
        <button className="street-brand" onClick={closeStreet}>
          MELB.<small>← Return to the stories</small>
        </button>
        <div role="group" aria-label="Street exploration mode">
          <button
            aria-pressed={s.mode === "free"}
            onClick={() => updateStreet({ mode: "free", playing: false })}
          >
            Free look
          </button>
          <button
            aria-pressed={s.mode === "guided"}
            onClick={() => updateStreet({ mode: "guided", playing: false })}
          >
            Guided viewpoints
          </button>
        </div>
        <button onClick={closeStreet} aria-label="Close street explorer">
          Close ×
        </button>
      </header>
      <div className="street-caption">
        <span className="eyebrow">BOURKE STREET / MAY 2020</span>
        <h2>The captured city.</h2>
        <p>
          Experimental connected viewpoints.
          <br />
          Aerial photogrammetry · visible surface gaps.
        </p>
      </div>
      {!s.ready && !s.error && (
        <div className="street-loading" role="status">
          Loading the real city mesh…
          <small>One tile, on demand. You can return at any time.</small>
        </div>
      )}
      {s.error && (
        <div className="street-loading" role="alert">
          The captured view could not load.
          <button
            onClick={() =>
              updateStreet({
                quality: s.quality === "high" ? "medium" : "high",
                error: false,
              })
            }
          >
            Try the other quality level
          </button>
          <button onClick={closeStreet}>Return to the stories</button>
        </div>
      )}
      <aside className="street-story">
        <button
          className="street-hotspot"
          aria-expanded={s.info}
          onClick={() => updateStreet({ info: !s.info })}
        >
          0{s.point + 1} / {stories[s.point][0]} {s.info ? "−" : "+"}
        </button>
        {s.info && (
          <div>
            <p>{stories[s.point][1]}</p>
            <a
              href="https://whatson.melbourne.vic.gov.au/things-to-do/melbourne-visitor-booth"
              target="_blank"
              rel="noreferrer"
            >
              Official visitor information ↗
            </a>
          </div>
        )}
      </aside>
      <footer>
        <div className="street-route">
          <span className="eyebrow">CONNECTED VIEWS / {s.point + 1} OF 4</span>
          <div role="group" aria-label="Choose viewpoint">
            {stories.map((p, i) => (
              <button
                key={p[0]}
                aria-label={`Viewpoint ${i + 1}`}
                aria-current={s.point === i ? "step" : undefined}
                onClick={() => {
                  streetPoint(i);
                  updateStreet({ playing: false });
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <small>Views fade between positions; no continuous walk.</small>
        </div>
        <div className="street-controls">
          <label>
            Detail{" "}
            <select
              value={s.quality}
              onChange={(e) =>
                updateStreet({
                  quality: e.target.value as "high" | "medium",
                  playing: false,
                })
              }
            >
              <option value="high">High · 23 MB</option>
              <option value="medium">Light · 5.3 MB</option>
            </select>
          </label>
          <div>
            <button
              disabled={s.point === 0 || !s.ready}
              onClick={() => {
                streetPoint(s.point - 1);
                updateStreet({ playing: false });
              }}
            >
              ← Previous
            </button>
            {s.mode === "guided" && (
              <button
                disabled={!s.ready || reduced}
                onClick={() => {
                  if (s.point === 3 && !s.playing) streetPoint(0);
                  updateStreet({ playing: !s.playing });
                }}
              >
                {s.playing ? "Pause" : "Play"}
              </button>
            )}
            <button
              disabled={s.point === 3 || !s.ready}
              onClick={() => {
                streetPoint(s.point + 1);
                updateStreet({ playing: false });
              }}
            >
              Next →
            </button>
          </div>
          <div>
            <button
              onClick={() => {
                streetLook.yaw -= 0.25;
              }}
            >
              Look left
            </button>
            <button
              onClick={() => {
                streetLook.yaw += 0.25;
              }}
            >
              Look right
            </button>
            <button
              onClick={() => {
                streetPoint(0);
                updateStreet({ playing: false });
              }}
            >
              Reset
            </button>
          </div>
        </div>
        <div className="street-attribution">
          <a
            href="https://discover.data.vic.gov.au/en_AU/dataset/city-of-melbourne-3d-textured-mesh-photomesh-2020"
            target="_blank"
            rel="noreferrer"
          >
            City of Melbourne photomesh 2020
          </a>{" "}
          ·{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noreferrer"
          >
            CC BY 4.0
          </a>{" "}
          · Simplified geometry and compressed textures. MGA55 / AHD; horizontal
          datum unconfirmed. Street identification informed by{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
          >
            © OpenStreetMap contributors
          </a>
          .{" "}
          {reduced
            ? "Reduced motion: use viewpoint buttons."
            : "Drag to look in Free look. Arrow keys: turn / change viewpoint."}
        </div>
      </footer>
    </div>,
    document.body,
  );
}
