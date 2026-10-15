import fs from "node:fs";
import assert from "node:assert/strict";
import { NodeIO } from "../.photomesh-test/tooling/node_modules/@gltf-transform/core/dist/index.js";
import { ALL_EXTENSIONS } from "../.photomesh-test/tooling/node_modules/@gltf-transform/extensions/dist/index.js";
import { MeshoptDecoder } from "../.photomesh-test/tooling/node_modules/meshoptimizer/index.js";
import {
  Vector3,
  Spherical,
  Matrix4,
  Quaternion,
  PerspectiveCamera,
} from "three";
import { build } from "esbuild";
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
const { landmarks, sampleExteriorArc } =
  await import("../.photomesh-test/phase3-dom.mjs");
await MeshoptDecoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.decoder": MeshoptDecoder });
const report = [];
for (const [id, lm] of Object.entries(landmarks)) {
  const doc = await io.read(`public/assets/landmarks/${id}.glb`);
  let triangles = 0,
    vertices = 0;
  const bounds = [
    new Vector3(Infinity, Infinity, Infinity),
    new Vector3(-Infinity, -Infinity, -Infinity),
  ];
  for (const node of doc.getRoot().listNodes()) {
    const m = new Matrix4().compose(
      new Vector3(...node.getTranslation()),
      new Quaternion(...node.getRotation()),
      new Vector3(...node.getScale()),
    );
    for (const p of node.getMesh()?.listPrimitives() ?? []) {
      const position = p.getAttribute("POSITION");
      const normal = p.getAttribute("NORMAL");
      assert(normal);
      triangles += (p.getIndices()?.getCount() ?? position.getCount()) / 3;
      const pos = [];
      for (let i = 0; i < position.getCount(); i++) {
        position.getElement(i, pos);
        assert(pos.every(Number.isFinite));
        const v = new Vector3(...pos).applyMatrix4(m);
        bounds[0].min(v);
        bounds[1].max(v);
        vertices++;
      }
    }
  }
  assert(triangles < 100000);
  assert(bounds[1].y > 1);
  assert(bounds[0].y > -0.1);
  assert(fs.statSync(`public/assets/landmarks/${id}.glb`).size < 1000000);
  let samples = 0;
  const positions = [lm.home, ...lm.features.map((f) => f.camera)];
  for (const from of positions)
    for (const to of positions) {
      const a = new Spherical().setFromVector3(new Vector3(...from)),
        b = new Spherical().setFromVector3(new Vector3(...to));
      b.theta =
        a.theta +
        Math.atan2(Math.sin(b.theta - a.theta), Math.cos(b.theta - a.theta));
      for (let t = 0; t <= 1; t += 0.025) {
        const v = sampleExteriorArc(a, b, t, lm.radius, new Vector3());
        assert(v.toArray().every(Number.isFinite));
        assert(v.length() >= lm.radius * 1.6 - 1e-8);
        assert(v.y > 2);
        samples++;
      }
    }
  for (const aspect of [1440 / 900, 390 / 844, 844 / 390]) {
    const factor = Math.max(1, Math.min(1.75, 1 / aspect));
    const fov =
      (2 * Math.atan(Math.tan((39 * Math.PI) / 360) * factor) * 180) / Math.PI;
    for (const f of lm.features) {
      const c = new PerspectiveCamera(fov, aspect, 0.1, 160);
      c.position.fromArray(f.camera);
      c.lookAt(new Vector3(...f.point));
      c.updateMatrixWorld();
      const p = new Vector3(...f.point).project(c);
      assert(Math.abs(p.x) < 0.001 && Math.abs(p.y) < 0.001 && p.z < 1);
    }
  }
  report.push({
    id,
    triangles,
    vertices,
    bounds: bounds.map((v) => v.toArray()),
    cameraPathSamples: samples,
    viewports: 3,
  });
}
fs.writeFileSync(
  "docs/phase3/asset-validation.json",
  JSON.stringify(
    {
      report,
      note: "Offline decoded geometry and camera mathematics. No browser FPS, visual occlusion, CSS layout or GPU testing implied.",
    },
    null,
    2,
  ),
);
console.log(report);
