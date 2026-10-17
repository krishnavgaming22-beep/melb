import { useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { journey } from "../../scenes/ArrivalScene/journey";
import { frameReport } from "./frameMetrics";
import { assetMetrics } from "../../scenes/LandmarkExperience/assets";
export function Diagnostics() {
  const ref = useRef<HTMLOutputElement>(null);
  useEffect(() => {
    const id = setInterval(() => {
      if (ref.current) {
        ref.current.dataset.progress = journey.progress.toFixed(4);
        ref.current.dataset.triggers = String(ScrollTrigger.getAll().length);
        ref.current.dataset.lenis = String(
          document.documentElement.classList.contains("lenis"),
        );
        ref.current.dataset.fps = String(journey.fps);
        ref.current.dataset.drawCalls = String(journey.drawCalls);
        ref.current.dataset.triangles = String(journey.triangles);
        ref.current.dataset.rendered = journey.rendered.toFixed(4);
        ref.current.dataset.frameReport = JSON.stringify(frameReport());
        ref.current.dataset.canvases = String(
          document.querySelectorAll("canvas").length,
        );
      }
    }, 250);
    return () => clearInterval(id);
  }, []);
  return (
    <>
      <output ref={ref} id="dev-diagnostics" hidden />
      {new URLSearchParams(location.search).has("bench") && (
        <button
          style={{
            position: "fixed",
            right: 12,
            top: 100,
            zIndex: 200,
            background: "#f3f0e8",
            color: "#233b40",
            padding: 12,
            border: "1px solid #233b40",
            fontSize: 12,
          }}
          onClick={() => {
            const report = {
              timestamp: new Date().toISOString(),
              viewport: [innerWidth, innerHeight],
              devicePixelRatio: devicePixelRatio,
              frames: frameReport(),
              landmarkLoads: assetMetrics,
              canvasCount: document.querySelectorAll("canvas").length,
              scrollTriggers: ScrollTrigger.getAll().length,
              note: "Rolling last 600 rendered frames per scene. Frame intervals, not isolated GPU timings.",
            };
            const url = URL.createObjectURL(
              new Blob([JSON.stringify(report, null, 2)], {
                type: "application/json",
              }),
            );
            const link = document.createElement("a");
            link.href = url;
            link.download = "melb-browser-performance.json";
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }}
        >
          Save performance report ↓
        </button>
      )}
    </>
  );
}
