import assert from "node:assert/strict";
import fs from "node:fs";
import { build } from "esbuild";
import { JSDOM } from "jsdom";
const dom = new JSDOM(
  '<html><body><button id="return-focus">Enter</button></body></html>',
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
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
await build({
  entryPoints: ["scripts/phase3-test-entry.tsx"],
  outfile: ".photomesh-test/phase3-dom.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
  loader: { ".css": "empty" },
  jsx: "automatic",
});
const React = await import("react");
const { render, screen, fireEvent, act, cleanup } =
  await import("@testing-library/react");
const app = await import("../.photomesh-test/phase3-dom.mjs");
const checks = [];
const pass = (name) => {
  checks.push(name);
  console.log("PASS", name);
};
for (const id of app.flagshipIds) {
  const lm = app.landmarks[id];
  assert.equal(lm.features.length, 6);
  assert(fs.existsSync(`public/assets/landmarks/${id}.glb`));
  assert(fs.existsSync(`assets/blender/landmarks/${id}.blend`));
  for (const f of lm.features) {
    assert(f.source.startsWith("https://"));
    assert(f.point.every(Number.isFinite));
    assert(f.camera.every(Number.isFinite));
    assert(f.camera[1] > 2);
  }
  const place = app.landmarkPlace(id);
  assert(fs.existsSync("public" + place.photo.src));
  assert(place.photo.license.startsWith("CC"));
}
pass(
  "Four local GLBs, Blender source files, 24 sourced features and licensed photographs",
);
app.setDiscoveryPhase(1);
app.filterDiscovery("Sport", "MCG");
app.selectPlace("mcg", { width: 1440, height: 900 });
const discovery = JSON.stringify(app.getDiscovery?.() ?? {}),
  view = JSON.stringify(app.mapView);
app.openLandmark("mcg");
app.modelReady("mcg");
app.cameraSettled(app.getExplorer().request);
app.setMode("guided");
app.selectFeature(4);
const old = app.getExplorer().request;
app.selectFeature(2);
app.cameraSettled(old);
assert.equal(app.getExplorer().settled, false);
app.cameraSettled(app.getExplorer().request);
assert.equal(app.getExplorer().settled, true);
app.setMode("free");
assert.equal(app.getExplorer().command, "hold");
assert.equal(app.getExplorer().feature, 2);
app.showStory(true);
assert.equal(app.getExplorer().story, true);
app.openLandmark("shrine");
app.modelReady("mcg");
assert.equal(app.getExplorer().ready, false);
assert.equal(app.getExplorer().id, "shrine");
app.exitLandmark(true);
await new Promise((r) => setTimeout(r, 5));
assert.equal(app.getExplorer().id, null);
assert.equal(JSON.stringify(app.mapView), view);
assert.equal(JSON.stringify(app.getDiscovery?.() ?? {}), discovery);
pass(
  "Stale camera/load callbacks, rapid mode changes, landmark switching and map view preservation",
);
for (const id of app.flagshipIds) {
  document.getElementById("return-focus").focus();
  app.openLandmark(id);
  render(React.createElement(app.LandmarkInterface));
  assert(screen.getByRole("dialog"));
  assert(document.body.classList.contains("landmark-open"));
  assert(screen.getByRole("status").textContent.includes("Preparing"));
  act(() => {
    app.modelReady(id);
    app.cameraSettled(app.getExplorer().request);
  });
  fireEvent.click(screen.getByRole("button", { name: "Guided Experience" }));
  for (let i = 0; i < 6; i++) {
    fireEvent.click(
      screen.getByRole("button", {
        name: `Chapter ${i + 1}: ${app.landmarks[id].features[i].title}`,
      }),
    );
    assert(screen.getByRole('heading', {name: app.landmarks[id].features[Math.max(0,i-1)].title}));
    act(() => app.cameraSettled(app.getExplorer().request));
    assert(
      screen.getByRole("heading", {
        name: app.landmarks[id].features[i].title,
      }),
    );
  }
  assert(screen.getByRole("button", { name: "Next chapter" }).disabled);
  fireEvent.click(screen.getByRole("button", { name: "Previous chapter" }));
  assert.equal(app.getExplorer().chapter, 4);
  fireEvent.click(screen.getByRole("button", { name: "Free Explore" }));
  assert.equal(app.getExplorer().mode, "free");
  fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
  assert.equal(app.getExplorer().command, "in");
  fireEvent.click(screen.getByRole("button", { name: "Reset view ↶" }));
  assert.equal(app.getExplorer().command, "reset");
  fireEvent.click(screen.getByRole("button", { name: "Explore the story ↗" }));
  assert(screen.getByRole("article"));
  assert(screen.getByRole("img").getAttribute("src").endsWith(`${id}.jpg`));
  fireEvent.keyDown(document, { key: "Escape" });
  assert.equal(app.getExplorer().story, false);
  fireEvent.keyDown(document, { key: "ArrowLeft" });
  assert.equal(app.getExplorer().command, "left");
  fireEvent.click(
    screen.getByRole("button", { name: "Return to Melbourne map" }),
  );
  await act(async () => await new Promise((r) => setTimeout(r, 5)));
  assert.equal(app.getExplorer().id, null);
  assert(!document.body.classList.contains("landmark-open"));
  assert.equal(document.activeElement.id, "return-focus");
  cleanup();
}
pass(
  "All four DOM journeys: 24 chapters, reverse navigation, modes, zoom/reset, photo stories, Escape and focus restoration",
);
app.openLandmark("mcg");
render(React.createElement(app.LandmarkInterface));
act(() => app.modelFailed("mcg"));
assert(screen.getByRole("alert"));
fireEvent.click(
  screen.getByRole("button", { name: "Read the illustrated story" }),
);
assert(screen.getByRole("article"));
fireEvent.click(
  screen.getByRole("button", { name: "Return to Melbourne map" }),
);
await act(async () => await new Promise((r) => setTimeout(r, 5)));
cleanup();
pass("Asset failure keeps illustrated content and exit available");
app.filterDiscovery('All','');
for(const id of app.flagshipIds){
 app.selectPlace(id,{width:1440,height:900});
 const savedDiscovery=JSON.stringify(app.getDiscovery()),savedMap=JSON.stringify(app.mapView);
 render(React.createElement(React.Fragment,null,React.createElement(app.CityInterface,{onExplore(){}}),React.createElement(app.LandmarkInterface)));
 fireEvent.click(screen.getByRole('button',{name:'Enter the 3D experience ↗'}));
 assert.equal(app.getExplorer().id,id);
 fireEvent.click(screen.getByRole('button',{name:'Return to Melbourne map'}));
 await act(async()=>await new Promise(r=>setTimeout(r,5)));
 assert.equal(JSON.stringify(app.getDiscovery()),savedDiscovery);assert.equal(JSON.stringify(app.mapView),savedMap);
 cleanup();
}
pass('Four map detail entry buttons open the matching experience and preserve discovery state on return');
for (const id of app.flagshipIds) {
  app.openLandmark(id);
  app.setMode("guided");
  app.chapterBy(100);
  assert.equal(app.getExplorer().chapter, 5);
  app.chapterBy(-100);
  assert.equal(app.getExplorer().chapter, 0);
}
app.exitLandmark(true);
app.openLandmark("flinders");
await new Promise((r) => setTimeout(r, 5));
assert.equal(app.getExplorer().id, "flinders");
app.exitLandmark(true);
await new Promise((r) => setTimeout(r, 5));
pass(
  "Chapter boundaries and interrupted exit cannot close a newly opened landmark",
);
fs.mkdirSync("docs/phase3", { recursive: true });
fs.writeFileSync(
  "docs/phase3/offline-tests.json",
  JSON.stringify(
    {
      checks,
      browser: "Not tested: saved localhost permission denial",
      date: "2026-10-13",
    },
    null,
    2,
  ),
);
console.log(
  `${checks.length} groups passed. These are DOM/state tests, not browser/WebGL validation.`,
);
