import assert from "node:assert/strict";
import fs from "node:fs";
import { build } from "esbuild";
import { JSDOM } from "jsdom";
import { Vector3 } from "three";
const dom = new JSDOM(
  '<html><body><button id="opener">Enter street</button></body></html>',
  { url: "https://offline.test/" },
);
for (const key of [
  "window",
  "document",
  "HTMLElement",
  "Element",
  "Node",
  "Event",
  "CustomEvent",
  "MouseEvent",
  "KeyboardEvent",
])
  globalThis[key] = dom.window[key];
Object.defineProperty(globalThis, "navigator", {
  value: dom.window.navigator,
  configurable: true,
});
globalThis.getComputedStyle = dom.window.getComputedStyle;
globalThis.innerWidth = 1440;
globalThis.innerHeight = 900;
globalThis.matchMedia = dom.window.matchMedia = () => ({
  matches: true,
  addEventListener() {},
  removeEventListener() {},
});
globalThis.IntersectionObserver = class {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    this.callback([{ isIntersecting: true }]);
  }
  disconnect() {}
};
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
await build({
  entryPoints: ["scripts/phase4-test-entry.tsx"],
  outfile: ".photomesh-test/phase4-dom.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
  loader: { ".css": "empty" },
  jsx: "automatic",
});
const app = await import("../.photomesh-test/phase4-dom.mjs");
const React = await import("react");
const { render, screen, fireEvent, act, cleanup } =
  await import("@testing-library/react");
const checks = [];
function pass(s) {
  checks.push(s);
  console.log("PASS", s);
}
const p = new Vector3(),
  t = new Vector3(),
  last = new Vector3(),
  again = new Vector3(),
  target = new Vector3();
const pathSamples = [];
for (const id of app.flagshipIds) {
  let maxStep = 0,
    minHeight = Infinity,
    minDistance = Infinity;
  const snapshots = [];
  for (let i = 0; i <= 1000; i++) {
    app.sampleTour(id, i / 1000, p, t);
    assert([...p, ...t].every(Number.isFinite));
    assert(p.y > 2);
    assert(p.distanceTo(t) > 3);
    if (i) {
      const step = p.distanceTo(last);
      maxStep = Math.max(maxStep, step);
      assert(step < 0.2);
    }
    last.copy(p);
    minHeight = Math.min(minHeight, p.y);
    minDistance = Math.min(minDistance, p.distanceTo(t));
    snapshots.push(p.toArray());
  }
  for (let i = 1000; i >= 0; i--) {
    app.sampleTour(id, i / 1000, again, target);
    assert.deepEqual(again.toArray(), snapshots[i]);
  }
  for (let anchor = 1; anchor < 5; anchor++) {
    const epsilon = 0.00001;
    app.sampleTour(id, anchor / 5 - epsilon, p, t);
    app.sampleTour(id, anchor / 5, again, target);
    const a = again.clone().sub(p).normalize();
    app.sampleTour(id, anchor / 5 + epsilon, p, t);
    const b = p.clone().sub(again).normalize();
    assert(a.dot(b) > 0.99, "continuous tangent at chapter");
  }
  pathSamples.push({ id, samples: 2002, maxStep, minHeight, minDistance });
}
pass(
  "8,008 forward/reverse path samples: deterministic positions, finite targets and continuous chapter tangents",
);
app.openLandmark("mcg");
app.modelReady("mcg");
app.setMode("guided");
app.selectFeature(5);
app.syncTourChapter(0.1, false);
assert.equal(app.getExplorer().chapter, 5);
assert.equal(app.tourProgress.target, 1);
app.chapterBy(-1);
assert.equal(app.tourProgress.target, 0.8);
app.advanceTour(-0.3);
assert.equal(app.tourProgress.target, 0.5);
app.advanceTour(-10);
assert.equal(app.tourProgress.target, 0);
app.advanceTour(10);
assert.equal(app.tourProgress.target, 1);
app.exitLandmark(true);
await new Promise((r) => setTimeout(r, 5));
pass(
  "Scroll, direct selection and rapid previous/next share one bounded progress target",
);
let selected = null;
const handle = (e) => {
  selected = e.detail;
};
window.addEventListener("melb:discover-place", handle);
render(React.createElement(app.EditorialJourney));
for (const id of [
  "sport",
  "culture",
  "education",
  "lifestyle",
  "quality-of-life",
])
  assert(document.querySelector(`article#${id}`));
for (const u of app.universities) {
  fireEvent.click(screen.getByRole("button", { name: u.name, exact: true }));
  assert(screen.getByRole("heading", { name: u.name }));
  assert.equal(
    screen
      .getByRole("link", { name: "Explore official study information ↗" })
      .getAttribute("href"),
    u.href,
  );
}
for (const topic of app.livingTopics) {
  fireEvent.click(
    screen.getByRole("button", { name: new RegExp(topic.title) }),
  );
  assert(screen.getByRole("heading", { name: topic.title }));
}
fireEvent.click(screen.getByRole("button", { name: "Find the library ↗" }));
assert.equal(selected, "library");
fireEvent.click(screen.getByRole("button", { name: "The MCG", exact: true }));
fireEvent.click(
  screen.getAllByRole("button", { name: "Enter the 3D landmark ↗" })[0],
);
assert.equal(app.getExplorer().id, "mcg");
for (const image of screen.getAllByRole("img"))
  assert(fs.existsSync("public" + image.getAttribute("src")));
for (const link of screen.getAllByRole("link"))
  assert(
    /^(https:\/\/|#)/.test(link.getAttribute("href")) ||
      (link.hasAttribute("download") &&
        fs.existsSync("public" + link.getAttribute("href"))),
  );
assert(screen.getByRole("link", { name: "Plan a visit ↗" }));
assert(screen.getByRole("link", { name: "Explore studying here ↗" }));
assert(screen.getByRole("link", { name: "Explore relocation resources ↗" }));
cleanup();
window.removeEventListener("melb:discover-place", handle);
app.exitLandmark(true);
await new Promise((r) => setTimeout(r, 5));
pass(
  "Five editorial articles: selectors, university links, practical topics, licensed local photos and map/landmark connections",
);
document.getElementById("opener").focus();
app.openStreet();
render(React.createElement(app.StreetInterface));
assert(document.body.classList.contains("street-open"));
assert(screen.getByRole("status"));
act(() => app.updateStreet({ ready: true }));
for (let i = 0; i < 4; i++) {
  fireEvent.click(
    screen.getByRole("button", { name: `Viewpoint ${i + 1}`, exact: true }),
  );
  assert.equal(app.getStreet().point, i);
  fireEvent.click(document.querySelector(".street-hotspot"));
  assert(document.querySelector(".street-story p"));
}
assert(screen.getByRole("button", { name: "Next →" }).disabled);
fireEvent.click(screen.getByRole("button", { name: "Guided viewpoints" }));
assert.equal(app.getStreet().mode, "guided");
assert(
  screen.getByRole("button", { name: "Play" }).disabled,
  "Reduced-motion automatic play disabled",
);
fireEvent.click(screen.getByRole("button", { name: "← Previous" }));
assert.equal(app.getStreet().point, 2);
fireEvent.click(screen.getByRole("button", { name: "Free look" }));
const yaw = app.streetLook.yaw;
fireEvent.click(screen.getByRole("button", { name: "Look left" }));
assert(app.streetLook.yaw < yaw);
fireEvent.change(screen.getByRole("combobox"), { target: { value: "medium" } });
assert.equal(app.getStreet().quality, "medium");
act(() => app.updateStreet({ error: true, ready: false }));
assert(screen.getByRole("alert"));
fireEvent.click(
  screen.getByRole("button", { name: "Try the other quality level" }),
);
assert.equal(app.getStreet().quality, "high");
fireEvent.keyDown(document, { key: "Escape" });
assert(!app.getStreet().open);
assert(!document.body.classList.contains("street-open"));
assert.equal(document.activeElement.id, "opener");
cleanup();
pass(
  "Archived Phase 4 prototype (not on main website): four viewpoints, modes, reduced motion, looking, quality switch, error recovery, exit and restored focus",
);
const inspection = JSON.parse(
  fs.readFileSync("docs/phase4/mall-inspection.json"),
);
for (const v of inspection.points) {
  assert(Math.abs(v.position[0]) < 140.5 && Math.abs(v.position[2]) < 140.5);
  assert(Math.abs(v.position[1] - v.ground - 1.7) < 0.001);
}
pass(
  "Viewpoints lie within the original tile and 1.7 m above sampled high-LOD mesh surfaces; no datum alignment claimed",
);
for (let i = 0; i <= 10000; i++) {
  const p = i / 10000,
    f = app.streetFrame(p);
  assert(f.index >= 0 && f.index < 8 && f.blend >= 0 && f.blend <= 1);
  assert.deepEqual(f, app.streetFrame(p));
  assert.equal(app.streetFrame(p, true).scale, 1);
  assert.equal(app.streetFrame(p, true).x, 0);
}
assert.equal(app.streetFrame(-9).index, 0);
assert.equal(app.streetFrame(9).index, 7);
assert.equal(app.streetFrame(NaN).index, 0);
render(React.createElement(app.CinematicStreets));
assert(screen.getByRole("heading", { name: "Where the city meets." }));
for (let i = 1; i < 8; i++) {
  fireEvent.click(screen.getByRole("button", { name: "Next view" }));
  assert(screen.getByRole("heading", { name: app.streetShots[i].title }));
  assert(document.querySelectorAll(".street-film-photo").length <= 4);
}
assert(screen.getByRole("button", { name: "Next view" }).disabled);
for (let i = 6; i >= 0; i--) {
  fireEvent.click(screen.getByRole("button", { name: "Previous view" }));
  assert(screen.getByRole("heading", { name: app.streetShots[i].title }));
}
fireEvent.click(screen.getByRole("button", { name: "Next view" }));
fireEvent.click(screen.getByRole("button", { name: "Replay ↺" }));
assert(screen.getByRole("button", { name: "Previous view" }).disabled);
assert.equal(
  screen.getByRole("link", { name: "Skip journey ↗" }).getAttribute("href"),
  "#your-melbourne",
);
assert(screen.getByText(/curated photographic essay/));
cleanup();
assert(!document.body.classList.contains("street-film-active"));
for (const path of [
  "src/pages/Home/ArrivalExperience.tsx",
  "src/scenes/ArrivalScene/ArrivalScene.tsx",
  "src/pages/Home/EditorialJourney.tsx",
])
  assert(!fs.readFileSync(path, "utf8").includes("StreetExperience/"));
pass(
  "Photographic streets: 10,001 deterministic samples, reduced-motion forward/reverse/replay, four-image mount limit, attribution, skip and legacy isolation",
);
fs.writeFileSync(
  "docs/phase4/offline-tests.json",
  JSON.stringify(
    {
      date: "2026-10-13",
      checks,
      pathSamples,
      browser:
        "Blocked by browser URL security policy; no FPS, responsive layout or live WebGL claims",
    },
    null,
    2,
  ),
);
console.log(`${checks.length} Phase 4 groups passed.`);
