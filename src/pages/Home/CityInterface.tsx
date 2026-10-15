import { assetUrl } from "../../utils/assetUrl";
import { useEffect, useRef, useState } from "react";
import { places, type Location } from "../../data/places";
import { themes, type Theme } from "../../data/discovery";
import { cityAreas } from "../../data/cityAreas";
import {
  useDiscovery,
  matchingPlaces,
  filterDiscovery,
  selectPlace,
  closePlace,
  expandPlace,
} from "../../scenes/CityScene/discoveryStore";
import { MapControls } from "./MapControls";
import "./discovery.css";
import { isFlagship } from "../../scenes/LandmarkExperience/registry";
import { openLandmark } from "../../scenes/LandmarkExperience/store";

function Photograph({
  place,
  compact = false,
}: {
  place: Location;
  compact?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (!place.photo || failed)
    return (
      <div className="photo-unavailable">
        {place.short}
        <small>Photography unavailable · explore the story below</small>
      </div>
    );
  return (
    <figure
      className={
        compact
          ? "destination-thumbnail"
          : `destination-photo ${["eureka", "arts-centre"].includes(place.id) ? "portrait-photo" : ""}`
      }
    >
      <img
        src={place.photo.src}
        alt={place.photo.alt}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
      {!compact && (
        <figcaption>
          <a href={place.photo.source} target="_blank" rel="noreferrer">
            {place.photo.credit}
          </a>{" "}
          ·{" "}
          <a href={place.photo.licenseUrl} target="_blank" rel="noreferrer">
            {place.photo.license}
          </a>{" "}
          · cropped
        </figcaption>
      )}
    </figure>
  );
}
export function CityInterface({ onExplore }: { onExplore: () => void }) {
  const state = useDiscovery();
  const [listOpen, setListOpen] = useState(false);
  const panel = useRef<HTMLElement>(null);
  const resultList = useRef<HTMLElement>(null);
  const [moreBelow, setMoreBelow] = useState(false);
  const lastTrigger = useRef<HTMLElement | null>(null);
  const results = matchingPlaces(state.category, state.query);
  const visible = new Set(results.map((p) => p.id));
  const place = places.find((p) => p.id === state.selectedId);
  const updateListOverflow = () => {
    const el = resultList.current;
    setMoreBelow(!!el && el.scrollHeight - el.clientHeight - el.scrollTop > 8);
  };
  useEffect(() => {
    const el = resultList.current;
    if (!el) return;
    el.scrollTop = 0;
    updateListOverflow();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(updateListOverflow);
    observer.observe(el);
    return () => observer.disconnect();
  }, [state.category, state.query, listOpen]);
  const choose = (id: string) => {
    lastTrigger.current = document.activeElement as HTMLElement;
    selectPlace(id, { width: innerWidth, height: innerHeight });
    setListOpen(false);
  };
  const close = (restore = false) => {
    closePlace(restore);
    requestAnimationFrame(() => {
      if (lastTrigger.current?.isConnected) lastTrigger.current.focus();
      else document.getElementById("landmark-search")?.focus();
    });
  };
  useEffect(() => {
    if (place) panel.current?.focus({ preventScroll: true });
  }, [place?.id]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape" && state.selectedId) {
        e.preventDefault();
        if (state.expanded) expandPlace(false);
        else close();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [state.selectedId, state.expanded]);
  return (
    <>
      <div className="city-overview-copy">
        <span className="eyebrow">MELBOURNE</span>
        <h2>
          A city
          <br />
          built to be
          <br />
          <em>explored.</em>
        </h2>
        <p className="hero-themes">
          {(["Culture", "Education", "Sport", "Life"] as Theme[]).map(
            (theme) => (
              <button
                key={theme}
                onClick={() => {
                  filterDiscovery(theme, "");
                  onExplore();
                }}
              >
                {theme}.
              </button>
            ),
          )}
        </p>
        <button className="text-link" onClick={onExplore}>
          EXPLORE THE CITY <span>→</span>
        </button>
      </div>
      <div
        className={`city-map-ui discovery-ui ${place ? "has-selection" : ""}`}
        aria-label="Explore Melbourne landmarks"
        data-mode={state.mode}
      >
        <MapControls />
        <section
          className={`discovery-browser ${listOpen ? "list-open" : ""}`}
          aria-label="Find a destination"
          data-lenis-prevent
        >
          <header className="discovery-heading">
            <span className="eyebrow">05 — FIND YOUR MELBOURNE</span>
            <h2 aria-label="Discover Melbourne.">
              <span>Discover</span>
              <span>
                <em>Melbourne.</em>
              </span>
            </h2>
          </header>
          <label className="discovery-search">
            <span className="sr-only">Search landmarks</span>
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            >
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m15.5 15.5 5 5" />
            </svg>
            <input
              id="landmark-search"
              type="search"
              placeholder="A place, a passion…"
              value={state.query}
              onChange={(e) => {
                filterDiscovery(state.category, e.target.value);
                setListOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && results.length) {
                  e.preventDefault();
                  choose(results[0].id);
                }
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  document
                    .querySelector<HTMLButtonElement>(
                      ".destination-list button",
                    )
                    ?.focus();
                }
              }}
            />
          </label>
          <div
            className="theme-selector"
            role="group"
            aria-label="Explore by interest"
          >
            <span
              className="theme-indicator"
              aria-hidden="true"
              style={{
                left: `${Object.keys(themes).indexOf(state.category) * 20}%`,
              }}
            />
            {(Object.keys(themes) as Theme[]).map((theme) => (
              <button
                key={theme}
                aria-pressed={state.category === theme}
                onClick={() => {
                  filterDiscovery(theme);
                  setListOpen(true);
                }}
              >
                {theme}
              </button>
            ))}
          </div>
          <div className="theme-story" key={state.category}>
            <h3>{themes[state.category].title}</h3>
            <p>{themes[state.category].description}</p>
          </div>
          <button
            className="mobile-destinations"
            aria-expanded={listOpen}
            onClick={() => setListOpen(!listOpen)}
          >
            {listOpen
              ? "Hide destinations"
              : `Browse ${results.length} destinations`}{" "}
            <span>{listOpen ? "−" : "+"}</span>
          </button>
          <div className="destination-results">
            <p className="results-count" role="status">
              {results.length}{" "}
              {results.length === 1 ? "destination" : "destinations"}
              {state.query ? " found" : ""}
            </p>
            {!results.length && (
              <div className="no-results">
                <p>
                  No places match “{state.query}”. Try MCG, gardens or Culture.
                </p>
                <button
                  className="text-link"
                  onClick={() => filterDiscovery("All", "")}
                >
                  Clear search & filters ↗
                </button>
              </div>
            )}
            <nav
              ref={resultList}
              key={state.category}
              onScroll={updateListOverflow}
              className="destination-list"
              aria-label="Landmark results"
            >
              {results.map((p, i) => (
                <button
                  key={p.id}
                  style={{ animationDelay: `${Math.min(i, 5) * 35}ms` }}
                  onClick={() => choose(p.id)}
                  aria-pressed={state.selectedId === p.id}
                  onKeyDown={(e) => {
                    if (
                      ["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)
                    ) {
                      e.preventDefault();
                      const buttons =
                        e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
                          "button",
                        );
                      const index =
                        e.key === "Home"
                          ? 0
                          : e.key === "End"
                            ? results.length - 1
                            : (i +
                                (e.key === "ArrowDown" ? 1 : -1) +
                                results.length) %
                              results.length;
                      buttons?.[index].focus();
                    }
                  }}
                >
                  {state.category !== "All" && i < 2 && (
                    <Photograph place={p} compact />
                  )}
                  <small>{p.number}</small>
                  <span>
                    {p.short}
                    <em>{p.categories.join(" · ")}</em>
                  </span>
                  <b>↗</b>
                </button>
              ))}
            </nav>
          </div>
          <div className="discovery-bottom-note" aria-hidden="true">
            {moreBelow
              ? "Scroll for more destinations"
              : "Your next chapter starts here."}
            <span>{moreBelow ? "↓" : "↗"}</span>
          </div>
        </section>
        <div className="map-orientation" aria-hidden="true">
          <span>N</span>
          <i>↑</i>
          <small>
            MELBOURNE
            <br />
            37.8° S / 144.9° E
          </small>
        </div>
        <div className="map-pins">
          {cityAreas.map((area) => (
            <span
              key={area.id}
              id={`area-${area.id}`}
              className="city-area-label"
              aria-hidden="true"
            >
              {area.name}
            </span>
          ))}
          {places.map((p) => (
            <button
              id={`pin-${p.id}`}
              key={p.id}
              className="map-pin"
              hidden={!visible.has(p.id)}
              aria-label={`Discover ${p.name}`}
              aria-pressed={state.selectedId === p.id}
              onClick={() => choose(p.id)}
            >
              <span className="pin-dot">{p.number}</span>
              <span className="pin-label">
                <strong>{p.short}</strong>
                <small>{p.categories.join(" · ")}</small>
                <em>{p.shortDescription}</em>
              </span>
            </button>
          ))}
        </div>
        {place && (
          <aside
            ref={panel}
            tabIndex={-1}
            className={`discovery-detail ${state.expanded ? "is-expanded" : ""}`}
            aria-labelledby="destination-title"
            data-lenis-prevent
          >
            <button
              className="detail-close"
              onClick={() => close()}
              aria-label="Close landmark details"
            >
              ×
            </button>
            <span className="eyebrow">
              {place.number} — {place.categories.join(" / ")}
            </span>
            <h2 id="destination-title">{place.name}</h2>
            <Photograph key={place.id} place={place} />
            <p className="destination-intro">{place.intro}</p>
            {isFlagship(place.id) && (
              <button
                className="landmark-enter"
                onClick={() => {
                  if (isFlagship(place.id)) openLandmark(place.id);
                }}
              >
                Enter the 3D experience <span>↗</span>
              </button>
            )}
            <button
              className="text-link detail-expand"
              aria-expanded={state.expanded}
              aria-controls="destination-story"
              onClick={() => expandPlace(!state.expanded)}
            >
              {state.expanded ? "Less detail" : "Discover the story"}{" "}
              <span>{state.expanded ? "−" : "↗"}</span>
            </button>
            {state.expanded && (
              <div id="destination-story" className="destination-story">
                <p>{place.story}</p>
                <h3>A few things to know</h3>
                <ul>
                  {place.facts.map((fact) => (
                    <li key={fact}>{fact}</li>
                  ))}
                </ul>
                <h3>Why visit?</h3>
                <p>{place.whyVisit}</p>
                <h3>Plan your visit</h3>
                <p>{place.visit}</p>
                <a
                  className="text-link"
                  href={place.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  Official visitor information ↗
                </a>
                <details>
                  <summary>Sources & photography</summary>
                  {place.sources.map((url, i) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer">
                      Reference {i + 1} · {new URL(url).hostname} ↗
                    </a>
                  ))}
                  {place.photo && <p>{place.photo.changes}</p>}
                  <small>
                    Content checked 12 October 2026. Consult the venue for
                    current visitor arrangements.
                  </small>
                </details>
              </div>
            )}
            <div className="detail-navigation">
              <button onClick={() => close()}>Back to map</button>
              <button onClick={() => close(true)}>
                Restore previous view ↶
              </button>
            </div>
          </aside>
        )}
      </div>
      <div className="city-attribution">
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
        >
          © OpenStreetMap contributors
        </a>
        <a
          href={assetUrl("/assets/data/melbourne-data.json")}
          target="_blank"
          rel="noreferrer"
        >
          Map data & credits
        </a>
      </div>
    </>
  );
}
