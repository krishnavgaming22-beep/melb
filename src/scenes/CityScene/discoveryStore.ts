import { useSyncExternalStore } from "react";
import { places, cityPoint } from "../../data/places";
import type { Theme } from "../../data/discovery";
import { mapView, resetMapView, panMap } from "./mapView";
export type DiscoveryMode =
  | "INTRO"
  | "MELBOURNE_3D"
  | "TRANSFORMING"
  | "MAP_EXPLORE"
  | "LANDMARK_FOCUS"
  | "LANDMARK_DETAILS";
type State = {
  category: Theme;
  query: string;
  selectedId: string | null;
  expanded: boolean;
  mode: DiscoveryMode;
  previousView: { x: number; z: number; zoom: number } | null;
};
let state: State = {
  category: "All",
  query: "",
  selectedId: null,
  expanded: false,
  mode: "INTRO",
  previousView: null,
};
const listeners = new Set<() => void>();
const emit = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn());
};
export const getDiscovery = () => state;
export function useDiscovery() {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    getDiscovery,
    getDiscovery,
  );
}
export function matchingPlaces(category: Theme, query: string) {
  const words = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return places.filter(
    (p) =>
      (category === "All" || p.categories.includes(category)) &&
      words.every((word) =>
        `${p.name} ${p.short} ${p.aliases.join(" ")} ${p.categories.join(" ")}`
          .toLocaleLowerCase()
          .includes(word),
      ),
  );
}
export function setDiscoveryPhase(progress: number) {
  const mode: DiscoveryMode =
    progress < 0.67
      ? "INTRO"
      : progress < 0.7475
        ? "MELBOURNE_3D"
        : progress < 0.955
          ? "TRANSFORMING"
          : state.selectedId
            ? state.expanded
              ? "LANDMARK_DETAILS"
              : "LANDMARK_FOCUS"
            : "MAP_EXPLORE";
  if (mode !== state.mode) emit({ mode });
}
export function filterDiscovery(category: Theme, query = state.query) {
  const visible = matchingPlaces(category, query);
  const retain = visible.some((p) => p.id === state.selectedId);
  emit({
    category,
    query,
    ...(!retain
      ? {
          selectedId: null,
          expanded: false,
          mode: state.mode.startsWith("LANDMARK") ? "MAP_EXPLORE" : state.mode,
        }
      : {}),
  });
}
export function selectPlace(
  id: string,
  viewport = { width: 1440, height: 900 },
) {
  const place = places.find((p) => p.id === id);
  if (!place) return;
  if (
    !["MAP_EXPLORE", "LANDMARK_FOCUS", "LANDMARK_DETAILS"].includes(state.mode)
  )
    return;
  const previousView = state.selectedId
    ? state.previousView
    : { x: mapView.x, z: mapView.z, zoom: mapView.zoom };
  const [x, , z] = cityPoint(place.lon, place.lat);
  mapView.zoom = place.zoom;
  const span =
    Math.max(46, 53 / (viewport.width / viewport.height)) / place.zoom;
  // Reserve the editorial column on desktop and space above the mobile sheet.
  mapView.x =
    x -
    (viewport.width >= 760
      ? span * (viewport.width / viewport.height) * 0.13
      : 0);
  mapView.z = z + (viewport.width < 760 ? span * 0.16 : 0);
  panMap(0, 0);
  emit({
    selectedId: id,
    expanded: false,
    mode: "LANDMARK_FOCUS",
    previousView,
  });
}
export function expandPlace(expanded: boolean) {
  if (state.selectedId)
    emit({ expanded, mode: expanded ? "LANDMARK_DETAILS" : "LANDMARK_FOCUS" });
}
export function closePlace(restore = false) {
  if (restore && state.previousView) Object.assign(mapView, state.previousView);
  emit({
    selectedId: null,
    expanded: false,
    previousView: null,
    mode: state.mode.startsWith("LANDMARK") ? "MAP_EXPLORE" : state.mode,
  });
}
export function resetDiscovery() {
  resetMapView();
  closePlace();
}
