import { useSyncExternalStore } from "react";
import { landmarks, type LandmarkId } from "./registry";
import { setTourProgress, tourProgress } from "./tour";
export type ExplorerState = {
  id: LandmarkId | null;
  mode: "free" | "guided";
  phase: "map" | "entering" | "exploring" | "exiting";
  chapter: number;
  displayChapter: number;
  feature: number | null;
  story: boolean;
  ready: boolean;
  error: boolean;
  sceneVisible: boolean;
  request: number;
  session: number;
  settled: boolean;
  visited: number[];
  command:
    | "focus"
    | "reset"
    | "in"
    | "out"
    | "left"
    | "right"
    | "up"
    | "down"
    | "hold";
};
const initial: ExplorerState = {
  id: null,
  mode: "free",
  phase: "map",
  chapter: 0,
  displayChapter: 0,
  feature: null,
  story: false,
  ready: false,
  error: false,
  sceneVisible: false,
  request: 0,
  session: 0,
  settled: false,
  visited: [],
  command: "reset",
};
let state = { ...initial };
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | undefined;
const update = (patch: Partial<ExplorerState>) => {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn());
};
export const getExplorer = () => state;
export const useExplorer = () =>
  useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    getExplorer,
    getExplorer,
  );
export function openLandmark(id: LandmarkId) {
  clearTimeout(timer);
  tourProgress.target = tourProgress.rendered = 0;
  const reduced =
    typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;
  update({
    ...initial,
    id,
    phase: "entering",
    sceneVisible: reduced,
    request: state.request + 1,
    session: state.session + 1,
  });
  if (!reduced) timer = setTimeout(() => update({ sceneVisible: true }), 320);
}
export function exitLandmark(reduced = false) {
  if (!state.id) return;
  clearTimeout(timer);
  update({ phase: "exiting", story: false });
  timer = setTimeout(
    () => update({ ...initial, request: state.request + 1 }),
    reduced ? 0 : 650,
  );
}
export function modelReady(id: LandmarkId) {
  if (state.id === id && state.phase !== "exiting")
    update({ ready: true, error: false });
}
export function modelFailed(id: LandmarkId) {
  if (state.id === id)
    update({ error: true, ready: false, settled: true, phase: "exploring" });
}
export function cameraSettled(request: number) {
  if (state.request === request && state.id && state.phase !== "exiting")
    update({
      settled: true,
      displayChapter: state.feature ?? state.chapter,
      phase: "exploring",
      visited: [...new Set([...state.visited, state.feature ?? state.chapter])],
    });
}
export function setMode(mode: "free" | "guided") {
  if (mode === state.mode) return;
  if (mode === "guided")
    tourProgress.target = tourProgress.rendered =
      (state.feature ?? state.chapter) / 5;
  update({
    mode,
    story: false,
    command: mode === "guided" ? "focus" : "hold",
    chapter: state.feature ?? state.chapter,
    request: state.request + 1,
    settled: mode === "free",
  });
}
export function selectFeature(index: number) {
  if (!state.id || index < 0 || index >= landmarks[state.id].features.length)
    return;
  if (state.mode === "guided") setTourProgress(index / 5);
  update({
    feature: index,
    chapter: index,
    story: false,
    command: "focus",
    request: state.request + 1,
    settled: false,
  });
}
// Called only when the visible story changes or motion settles, not on every frame.
export function syncTourChapter(progress: number, settled: boolean) {
  if (state.mode !== "guided" || state.phase === "exiting") return;
  const chapter = Math.round(progress * 5);
  const requestedChapter = Math.round(tourProgress.target * 5);
  if (
    state.chapter !== requestedChapter ||
    state.displayChapter !== chapter ||
    state.settled !== settled ||
    state.phase === "entering"
  )
    update({
      chapter: requestedChapter,
      feature: chapter,
      displayChapter: chapter,
      settled,
      phase: "exploring",
      visited: [...new Set([...state.visited, chapter])],
    });
}
export function chapterBy(delta: number) {
  if (!state.id) return;
  selectFeature(
    Math.max(
      0,
      Math.min(landmarks[state.id].features.length - 1, state.chapter + delta),
    ),
  );
}
export function cameraCommand(command: ExplorerState["command"]) {
  if (!state.id) return;
  update({
    command,
    feature: command === "reset" ? null : state.feature,
    request: state.request + 1,
    settled: false,
  });
}
export function showStory(story: boolean) {
  update({ story });
}
