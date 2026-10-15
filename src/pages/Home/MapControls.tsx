import { useEffect, useRef, useState } from "react";
import {
  mapView,
  panMap,
  resetMapView,
  zoomMap,
} from "../../scenes/CityScene/mapView";
import { journey } from "../../scenes/ArrivalScene/journey";
import { resetDiscovery } from "../../scenes/CityScene/discoveryStore";

export function MapControls() {
  const surface = useRef<HTMLDivElement>(null);
  const [touchMode, setTouchMode] = useState(false);
  useEffect(() => {
    const el = surface.current;
    if (!el) return;
    const pointers = new Map<number, { x: number; y: number }>();
    let distance = 0;
    const end = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      distance = 0;
      el.classList.toggle("dragging", pointers.size > 0);
    };
    const down = (e: PointerEvent) => {
      if (
        journey.rendered < 0.955 ||
        e.button !== 0 ||
        (e.pointerType === "touch" && !touchMode)
      )
        return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      el.setPointerCapture(e.pointerId);
      el.classList.add("dragging");
    };
    const move = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId);
      if (!prev) return;
      if (journey.rendered < 0.955) {
        pointers.clear();
        el.classList.remove("dragging");
        return;
      }
      const dx = e.clientX - prev.x,
        dy = e.clientY - prev.y;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const next = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance) zoomMap(next / distance);
        distance = next;
      } else panMap(-dx * mapView.unitsPerPixel, -dy * mapView.unitsPerPixel);
    };
    const wheel = (e: WheelEvent) => {
      if ((e.ctrlKey || e.metaKey) && journey.rendered > 0.955) {
        e.preventDefault();
        zoomMap(Math.exp(-e.deltaY * 0.006));
      }
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    el.addEventListener("lostpointercapture", end);
    el.addEventListener("wheel", wheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", end);
      el.removeEventListener("pointercancel", end);
      el.removeEventListener("lostpointercapture", end);
      el.removeEventListener("wheel", wheel);
      pointers.clear();
      el.classList.remove("dragging");
    };
  }, [touchMode]);
  useEffect(() => () => resetMapView(), []);
  return (
    <>
      <div
        ref={surface}
        className="map-gesture-surface"
        style={{ touchAction: touchMode ? "none" : "pan-y" }}
        data-lenis-prevent-touch={touchMode ? "" : undefined}
        aria-label="Pan Melbourne map"
        role="region"
        tabIndex={0}
        onKeyDown={(e) => {
          if (journey.rendered < 0.955) return;
          const step = 2 / mapView.zoom;
          if (e.key === "ArrowLeft") panMap(-step, 0);
          else if (e.key === "ArrowRight") panMap(step, 0);
          else if (e.key === "ArrowUp") panMap(0, -step);
          else if (e.key === "ArrowDown") panMap(0, step);
          else if (e.key === "+" || e.key === "=") zoomMap(1.25);
          else if (e.key === "-") zoomMap(0.8);
          else if (e.key === "Home") resetDiscovery();
          else return;
          e.preventDefault();
        }}
      />
      <div className="map-controls" role="group" aria-label="Map view controls">
        <button onClick={() => zoomMap(1.25)} aria-label="Zoom in">
          +
        </button>
        <button onClick={() => zoomMap(0.8)} aria-label="Zoom out">
          −
        </button>
        <button onClick={resetDiscovery}>Reset view</button>
        <button
          className="touch-map-toggle"
          aria-pressed={touchMode}
          onClick={() => setTouchMode(!touchMode)}
        >
          {touchMode ? "Resume scroll" : "Move map"}
        </button>
        <span className="map-control-hint">
          Drag to move · Ctrl/⌘ scroll to zoom
        </span>
      </div>
    </>
  );
}
