import assert from "node:assert/strict";
import fs from "node:fs";
import { build } from "esbuild";
import { JSDOM } from "jsdom";
import { PerspectiveCamera, Vector3 } from "three";
const dir = ".photomesh-test";
await build({
  stdin: {
    contents: `export * from './src/scenes/CinematicStreets/VideoScrubber'; export * from './src/scenes/CinematicStreets/videoTimeline'; export * from './src/scenes/LandmarkExperience/cameraControls'; export * from './src/scenes/LandmarkExperience/registry';`,
    resolveDir: process.cwd(),
    loader: "ts",
  },
  outfile: `${dir}/phase5-test.mjs`,
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
});
const {
  VideoScrubber,
  videoFrame,
  filmClips,
  filmChapters,
  nearbyClips,
  sceneTreatment,
  chapterFromTime,
  createLandmarkControls,
  landmarks,
} = await import("../.photomesh-test/phase5-test.mjs");
let paints = 0;
class Video extends EventTarget {
  readyState = 2;
  duration = 20;
  seeking = false;
  _time = 0;
  writes = [];
  seekable = { length: 1, start: () => 0, end: () => 20 };
  get currentTime() {
    return this._time;
  }
  set currentTime(t) {
    this.writes.push(t);
    this._time = t;
    this.seeking = true;
  }
  finish() {
    this.seeking = false;
    this.dispatchEvent(new Event("seeked"));
  }
}
const v = new Video(),
  c = new VideoScrubber(v, () => paints++);
c.request(4);
c.tick();
assert.equal(v.writes.length, 1);
c.request(16);
c.tick();
c.request(8);
c.tick();
assert.equal(v.writes.length, 1, "pending seeks coalesce");
v.finish();
c.tick();
assert.equal(v.writes.at(-1), 8, "latest target wins");
v.finish();
c.request(2);
c.tick();
v.finish();
assert.equal(c.settled, 2, "reverse seeks settle");
c.tick();
assert.equal(v.writes.length, 3, "idle does not seek");
c.request(100);
c.tick();
assert(v.writes.at(-1) < 20, "safe end frame");
v.finish();
c.request(NaN);
c.tick();
assert.equal(v.writes.at(-1), 0);
v.finish();
v.readyState = 0;
c.request(10);
c.tick();
assert.equal(v.writes.at(-1), 0, "metadata gated");
v.readyState = 2;
v.seekable.length = 0;
c.tick();
assert.equal(v.writes.at(-1), 0, "seekability gated");
c.dispose();
const old = paints;
v.finish();
c.tick();
assert.equal(paints, old, "cleanup detaches media handlers");
console.log(
  "PASS Decoder queue: coalescing, reverse, readiness, endpoints, idle and cleanup",
);
for (let i = 0; i <= 10000; i++) {
  const p = i / 10000,
    f = videoFrame(p);
  assert(f.time >= 0 && f.time < filmClips[f.clip].duration);
  assert(f.clip >= 0 && f.clip < filmClips.length);
  assert(f.chapter >= 0 && f.chapter < filmChapters.length);
  assert.equal(chapterFromTime(f.clip, f.time), f.chapter);
  assert.deepEqual(f, videoFrame(p));
}
assert.equal(videoFrame(-1).p, 0);
assert.equal(videoFrame(2).p, 1);
assert.equal(videoFrame(NaN).p, 0);
console.log(
  "PASS 10,001 deterministic video samples, correct chapter/caption mapping and endpoints",
);
const dom = new JSDOM("<!doctype html><canvas></canvas>");
globalThis.document = dom.window.document;
globalThis.window = dom.window;
const el = document.querySelector("canvas");
Object.defineProperties(el, {
  clientHeight: { value: 900 },
  clientWidth: { value: 1440 },
});
el.setPointerCapture = () => {};
el.releasePointerCapture = () => {};
function event(type, x, y) {
  const e = new dom.window.Event(type, { bubbles: true, cancelable: true });
  Object.assign(e, {
    pointerId: 1,
    pointerType: "mouse",
    button: 0,
    clientX: x,
    clientY: y,
    pageX: x,
    pageY: y,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
  });
  el.dispatchEvent(e);
}
for (const [id, lm] of Object.entries(landmarks)) {
  const camera = new PerspectiveCamera(39, 1.6, 0.1, 160);
  camera.up.set(0, 0, -1);
  camera.position.fromArray(lm.home);
  const control = createLandmarkControls(camera, el, lm.radius);
  control.target.fromArray(lm.target);
  control.update();
  const from = camera.position.clone(),
    right = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  event("pointerdown", 500, 450);
  event("pointermove", 620, 450);
  event("pointerup", 620, 450);
  for (let n = 0; n < 90; n++) control.update(1 / 60);
  assert(
    camera.position.clone().sub(from).dot(right) > 0,
    `${id}: right drag moves camera right`,
  );
  const to = camera.position.clone();
  event("pointerdown", 620, 450);
  event("pointermove", 500, 450);
  event("pointerup", 500, 450);
  for (let n = 0; n < 90; n++) control.update(1 / 60);
  assert(
    camera.position.distanceTo(from) < 0.005,
    `${id}: opposite drag restores orbit`,
  );
  assert(camera.position.distanceTo(to) > 0);
  const height = camera.position.y;
  event("pointerdown", 500, 450);
  event("pointermove", 500, 350);
  event("pointerup", 500, 350);
  for (let n = 0; n < 90; n++) control.update(1 / 60);
  assert(camera.position.y > height, `${id}: upward drag raises viewpoint`);
  for (let n = 0; n < 100; n++) {
    event("pointerdown", 500, 450);
    event("pointermove", 900, 50);
    event("pointerup", 900, 50);
    control.update(1 / 60);
  }
  for (let n = 0; n < 180; n++) control.update(1 / 60);
  assert(camera.position.toArray().every(Number.isFinite));
  assert(
    control.getPolarAngle() >= 0.22 - 0.001 &&
      control.getPolarAngle() <= 1.22 + 0.001,
  );
  const settled = camera.position.clone();
  for (let n = 0; n < 60; n++) control.update(1 / 60);
  assert(camera.position.distanceTo(settled) < 0.001);
  assert.deepEqual(camera.up.toArray(), [0, 1, 0]);
  control.dispose();
}
console.log(
  "PASS All four real OrbitControls: right/left/up direction, inherited map axis, limits and rapid-input settling",
);
const sources = JSON.parse(
  fs.readFileSync("public/assets/streets/video/SOURCES.json"),
);
for (const s of sources) {
  assert(
    s.costINR === 0 && s.source.startsWith("https://www.pexels.com/video/"),
  );
  for (const w of [1280, 1920])
    assert(
      fs.statSync(`public/assets/streets/video/${s.id}-${w}.mp4`).size > 100000,
    );
}
console.log(
  "PASS All films: local responsive variants and per-asset free licence provenance",
);

assert.equal(filmChapters.length, 20);
for (let target = 0; target < filmClips.length; target++)
  for (let shown = 0; shown < filmClips.length; shown++)
    for (const direction of [-1, 1]) {
      const pool = nearbyClips(target, shown, direction);
      assert(pool.length <= 3);
      assert(pool.includes(target) && pool.includes(shown));
      assert(pool.every((i) => i >= 0 && i < filmClips.length));
    }
for (let chapter = 0; chapter < filmChapters.length; chapter++) {
  const forward = Array.from({ length: 101 }, (_, i) =>
    sceneTreatment(chapter, i / 100),
  );
  const reverse = Array.from({ length: 101 }, (_, i) =>
    sceneTreatment(chapter, (100 - i) / 100),
  ).reverse();
  assert.deepEqual(forward, reverse);
  for (const frame of forward)
    assert(Object.values(frame).every(Number.isFinite));
}
console.log(
  "PASS Twenty scenes: bounded decoder pool, rapid jumps, reversible framing and finite endpoints",
);
