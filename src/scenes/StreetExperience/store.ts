import { useSyncExternalStore } from "react";
import { getExplorer } from "../LandmarkExperience/store";
type StreetState = {
  open: boolean;
  ready: boolean;
  error: boolean;
  point: number;
  mode: "free" | "guided";
  playing: boolean;
  info: boolean;
  quality: "high" | "medium";
  request: number;
};
const initial: StreetState = {
  open: false,
  ready: false,
  error: false,
  point: 0,
  mode: "free",
  playing: false,
  info: false,
  quality: "high",
  request: 0,
};
let state = { ...initial };
const listeners = new Set<() => void>();
export const getStreet = () => state;
export function updateStreet(patch: Partial<StreetState>) {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn());
}
export const useStreet = () =>
  useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    getStreet,
    getStreet,
  );
export function openStreet() {
  if (getExplorer().id) return;
  updateStreet({ ...initial, open: true, request: state.request + 1 });
}
export function closeStreet() {
  updateStreet({ open: false, playing: false, ready: false });
}
export function streetPoint(index: number) {
  updateStreet({
    point: Math.max(0, Math.min(3, index)),
    request: state.request + 1,
    info: false,
  });
}
export const streetLook = { yaw: 0, pitch: 0 };
export const streetMetrics = {
  loadMs: 0,
  bytes: 0,
  fps: 0,
  drawCalls: 0,
  triangles: 0,
  longFrames: 0,
};
