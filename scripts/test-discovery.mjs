import assert from "node:assert/strict";
import fs from "node:fs";
import { build } from "esbuild";
import { JSDOM } from "jsdom";
const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "https://offline.test/",
});
for (const key of [
  "window",
  "document",
  "HTMLElement",
  "Element",
  "Node",
  "Event",
  "MouseEvent",
  "KeyboardEvent",
])
  globalThis[key] = dom.window[key];
Object.defineProperty(globalThis, "navigator", {
  value: dom.window.navigator,
  configurable: true,
});
globalThis.innerWidth = 1440;
globalThis.innerHeight = 900;
globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
dom.window.PointerEvent = dom.window.MouseEvent;
dom.window.HTMLElement.prototype.setPointerCapture = () => {};
await build({
  entryPoints: ["scripts/phase2-test-entry.tsx"],
  outfile: ".photomesh-test/phase2-dom.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
  loader: { ".css": "empty" },
  jsx: "automatic",
});
const React = await import("react");
const { MemoryRouter } = await import("react-router-dom");
const { render, fireEvent, screen, act, cleanup } =
  await import("@testing-library/react");
const app = await import("../.photomesh-test/phase2-dom.mjs");
const checks = [];
const passed = (name) => {
  checks.push(name);
  console.log("PASS", name);
};
assert.equal(app.places.length, 12);
for (const p of app.places) {
  assert(p.photo?.src && p.photo.license.startsWith("CC"));
  assert(fs.existsSync("public" + p.photo.src));
  assert(p.facts.length >= 2 && p.sources.length);
  assert(p.categories.length && p.futureExperience === null);
}
passed(
  "All 12 records: photos, licences, facts, sources, categories and future references",
);
assert.deepEqual(
  app
    .matchingPlaces("Sport", "")
    .map((p) => p.id)
    .sort(),
  ["marvel", "mcg", "rod-laver"],
);
for (const query of ["MCG", "cricket", "the G"])
  assert(app.matchingPlaces("All", query).some((p) => p.id === "mcg"));
assert.equal(app.matchingPlaces("All", "not-a-real-landmark").length, 0);
assert(app.matchingPlaces("Culture", "").some((p) => p.id === "mcg"));
assert(app.matchingPlaces("Education", "").some((p) => p.id === "library"));
passed(
  "Multi-category filtering, abbreviations, partial searches and no results",
);
app.setDiscoveryPhase(0.5);
app.selectPlace("mcg");
assert.equal(app.getDiscovery().selectedId, null);
app.setDiscoveryPhase(0.98);
app.mapView.x = 2;
app.mapView.z = 3;
app.mapView.zoom = 1.2;
app.selectPlace("mcg");
assert.equal(app.getDiscovery().mode, "LANDMARK_FOCUS");
assert.equal(app.mapView.zoom, 2.5);
app.selectPlace("library");
app.expandPlace(true);
assert.equal(app.getDiscovery().mode, "LANDMARK_DETAILS");
app.closePlace(true);
assert.equal(app.mapView.x, 2);
assert.equal(app.mapView.zoom, 1.2);
app.selectPlace("mcg");
const retained = app.mapView.x;
app.closePlace();
assert.equal(app.mapView.x, retained);
app.selectPlace("mcg");
app.filterDiscovery("Education");
assert.equal(app.getDiscovery().selectedId, null);
app.resetDiscovery();
assert.equal(app.mapView.zoom, 1);
passed(
  "Camera ownership, fly-to targets, switching, previous-view restoration, closing and reset",
);
for (let repeat = 0; repeat < 4; repeat++)
  for (const p of [0.67, 0.75, 0.82, 0.91, 0.98, 0.86, 0.79, 0.7, 0.98]) {
    app.setDiscoveryPhase(p);
    const phase = app.cityTransition(p);
    assert(Object.values(phase).every((x) => x >= 0 && x <= 1));
    assert.deepEqual(phase, app.cityTransition(p));
  }
assert.equal(app.cityTransition(0.98).flatten, 1);
assert.equal(app.cityTransition(0.67).flatten, 0);
passed(
  "Repeated partial forward/reverse transitions and deterministic endpoints",
);
const points = [
  { id: "a", x: 5, y: 5, active: true },
  { id: "b", x: 6, y: 6, active: true },
  { id: "c", x: 100, y: 100, active: true },
];
const before = JSON.stringify(points);
assert(app.crowdedMarkers(points, "b").has("a"));
assert.equal(JSON.stringify(points), before);
passed(
  "Collision suppression preserves selected pin and all geographic positions",
);
app.filterDiscovery("All", "");
app.setDiscoveryPhase(0.98);
app.journey.rendered = 0.98;
render(
  React.createElement(
    MemoryRouter,
    null,
    React.createElement(app.CityInterface, {
      onExplore: () => app.setDiscoveryPhase(0.98),
    }),
  ),
);
for (const p of app.places) {
  fireEvent.click(screen.getByRole("button", { name: `Discover ${p.name}` }));
  assert(screen.getByRole("heading", { name: p.name }));
  assert.equal(app.getDiscovery().selectedId, p.id);
  fireEvent.click(screen.getByRole("button", { name: /Discover the story/ }));
  assert(screen.getByText(p.facts[0]));
  assert(screen.getByRole("link", { name: /Official visitor information/ }));
  fireEvent.keyDown(window, { key: "Escape" });
  assert.equal(app.getDiscovery().expanded, false);
  fireEvent.click(
    screen.getByRole("button", { name: "Close landmark details" }),
  );
  assert.equal(app.getDiscovery().selectedId, null);
}
passed(
  "React DOM: every marker opens correct title, photo, facts, official link and closes",
);
const search = screen.getByRole("searchbox", { name: "Search landmarks" });
fireEvent.change(search, { target: { value: "MCG" } });
assert.equal(screen.getByRole("status").textContent, "1 destination found");
fireEvent.keyDown(search, { key: "Enter" });
assert.equal(app.getDiscovery().selectedId, "mcg");
fireEvent.click(screen.getByRole("button", { name: "Back to map" }));
fireEvent.change(search, { target: { value: "zzzz" } });
assert(screen.getByText(/No places match/));
fireEvent.click(screen.getByRole("button", { name: /Clear search/ }));
for (const theme of ["Culture", "Education", "Sport", "Life", "All"]) {
  fireEvent.click(screen.getByRole("button", { name: theme, exact: true }));
  assert.equal(app.getDiscovery().category, theme);
  for (const p of app.places) {
    const pin = document.getElementById("pin-" + p.id);
    assert.equal(pin.hidden, theme !== "All" && !p.categories.includes(theme));
  }
}
passed(
  "React DOM: search Enter, no-result recovery and five filters update pins and results together",
);
fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
assert(app.mapView.zoom > 1);
fireEvent.click(screen.getByRole("button", { name: "Reset view" }));
assert.equal(app.mapView.zoom, 1);
const surface = screen.getByRole("region", { name: "Pan Melbourne map" });
fireEvent.keyDown(surface, { key: "ArrowRight" });
assert(app.mapView.x > 0);
fireEvent.keyDown(surface, { key: "Home" });
assert.equal(app.mapView.x, 0);
fireEvent.click(screen.getByRole("button", { name: "Move map" }));
assert.equal(surface.style.touchAction, "none");
fireEvent.click(screen.getByRole("button", { name: "Resume scroll" }));
assert.equal(surface.style.touchAction, "pan-y");
fireEvent.pointerDown(surface, {
  pointerId: 1,
  button: 0,
  clientX: 100,
  clientY: 100,
});
fireEvent.pointerMove(surface, { pointerId: 1, clientX: 120, clientY: 100 });
fireEvent.pointerUp(surface, { pointerId: 1 });
assert(app.mapView.x < 0);
passed(
  "React DOM: zoom/reset, keyboard pan, gesture mode toggle and pointer drag",
);
fireEvent.click(screen.getByRole("button", { name: "Reset view" }));
const wheel = new dom.window.WheelEvent("wheel", {
  deltaY: 100,
  cancelable: true,
  bubbles: true,
});
fireEvent(surface, wheel);
assert.equal(wheel.defaultPrevented, false);
assert.equal(app.mapView.zoom, 1);
fireEvent.wheel(surface, { deltaY: -100, ctrlKey: true, cancelable: true });
assert(app.mapView.zoom > 1);
fireEvent.click(screen.getByRole("button", { name: "Reset view" }));
fireEvent.click(screen.getByRole("button", { name: "Move map" }));
const pointer = (type, id, x) => {
  const event = new dom.window.Event(type, { bubbles: true, cancelable: true });
  Object.defineProperties(event, {
    pointerId: { value: id },
    pointerType: { value: "touch" },
    button: { value: 0 },
    clientX: { value: x },
    clientY: { value: 100 },
  });
  fireEvent(surface, event);
};
pointer("pointerdown", 1, 100);
pointer("pointerdown", 2, 200);
pointer("pointermove", 2, 210);
pointer("pointermove", 2, 240);
assert(app.mapView.zoom > 1);
pointer("pointerup", 1, 100);
pointer("pointerup", 2, 240);
app.journey.rendered = 0.8;
const locked = app.mapView.x;
fireEvent.keyDown(surface, { key: "ArrowRight" });
assert.equal(app.mapView.x, locked);
passed(
  "React DOM: normal wheel stays page-scroll, deliberate zoom, two-pointer pinch and transform gesture lock",
);
const list = screen.getByRole("navigation", { name: "Landmark results" });
const rows = list.querySelectorAll("button");
fireEvent.keyDown(rows[0], { key: "End" });
assert.equal(document.activeElement, rows[rows.length - 1]);
Object.defineProperties(list, {
  scrollHeight: { value: 900, configurable: true },
  clientHeight: { value: 200, configurable: true },
});
list.scrollTop = 0;
fireEvent.scroll(list);
assert(screen.getByText("Scroll for more destinations"));
list.scrollTop = 700;
fireEvent.scroll(list);
assert(screen.getByText("Your next chapter starts here."));
fireEvent.click(screen.getByRole("button", { name: "Sport", exact: true }));
assert.equal(document.querySelector(".theme-indicator").style.left, "60%");
assert.equal(
  screen.getByRole("navigation", { name: "Landmark results" }).scrollTop,
  0,
);
passed(
  "Polish: last-row keyboard access, truthful overflow hint, filter scroll reset and active indicator",
);
await act(async () => {
  await new Promise((resolve) => setTimeout(resolve, 5));
});
cleanup();
fs.mkdirSync("docs/phase2", { recursive: true });
fs.writeFileSync(
  "docs/phase2/offline-tests.json",
  JSON.stringify(
    {
      date: "2026-10-12",
      checks,
      environment:
        "Node + jsdom. No browser rendering, network requests or WebGL execution.",
      liveBrowserVerified: false,
    },
    null,
    2,
  ),
);
console.log(
  `${checks.length} groups passed. Live browser verification remains pending.`,
);
