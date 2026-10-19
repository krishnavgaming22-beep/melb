import { useEffect, useState } from "react";
const eventName = "melb:motion-preference";
export function readMotionPreference() {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem("melb-motion");
  } catch {
    /* Private browsing: system default. */
  }
  return (
    saved === "reduced" ||
    (saved !== "full" && matchMedia("(prefers-reduced-motion: reduce)").matches)
  );
}
export function setMotionPreference(reduced: boolean) {
  try {
    localStorage.setItem("melb-motion", reduced ? "reduced" : "full");
  } catch {
    /* Still applies for this session. */
  }
  document.documentElement.dataset.motion = reduced ? "reduced" : "full";
  window.dispatchEvent(new CustomEvent(eventName, { detail: reduced }));
}
export function useReducedMotion() {
  const [reduced, set] = useState(readMotionPreference);
  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => set(readMotionPreference());
    const manual = (e: Event) => set((e as CustomEvent<boolean>).detail);
    m.addEventListener("change", update);
    window.addEventListener(eventName, manual);
    return () => {
      m.removeEventListener("change", update);
      window.removeEventListener(eventName, manual);
    };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? "reduced" : "full";
  }, [reduced]);
  return reduced;
}
