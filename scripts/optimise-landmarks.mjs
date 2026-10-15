import fs from "node:fs";
import { NodeIO } from "../.photomesh-test/tooling/node_modules/@gltf-transform/core/dist/index.js";
import { ALL_EXTENSIONS } from "../.photomesh-test/tooling/node_modules/@gltf-transform/extensions/dist/index.js";
import {
  weld,
  meshopt,
  dedup,
  prune,
} from "../.photomesh-test/tooling/node_modules/@gltf-transform/functions/dist/index.js";
import {
  MeshoptEncoder,
  MeshoptDecoder,
} from "../.photomesh-test/tooling/node_modules/meshoptimizer/index.js";
await MeshoptEncoder.ready;
await MeshoptDecoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "meshopt.encoder": MeshoptEncoder,
    "meshopt.decoder": MeshoptDecoder,
  });
const manifest = JSON.parse(
  fs.readFileSync("public/assets/landmarks/manifest.json"),
);
for (const id of Object.keys(manifest)) {
  const path = `public/assets/landmarks/${id}.glb`;
  const doc = await io.read(path);
  await doc.transform(
    dedup(),
    weld(),
    prune(),
    meshopt({ encoder: MeshoptEncoder, level: "high" }),
  );
  await io.write(path, doc);
  manifest[id].uncompressedBytes = manifest[id].bytes;
  manifest[id].bytes = fs.statSync(path).size;
  const start = performance.now();
  const decoded = await io.read(path);
  const geometry = new Set();
  let tris = 0,
    bytes = 0;
  for (const mesh of decoded.getRoot().listMeshes())
    for (const p of mesh.listPrimitives()) {
      tris +=
        (p.getIndices()?.getCount() ?? p.getAttribute("POSITION").getCount()) /
        3;
      for (const a of [...p.listAttributes(), p.getIndices()].filter(Boolean))
        if (!geometry.has(a)) {
          geometry.add(a);
          bytes += a.getArray().byteLength;
        }
    }
  manifest[id].triangles = tris;
  manifest[id].decodedGeometryBytes = bytes;
  manifest[id].nodeDecodeMs = Math.round(performance.now() - start);
  manifest[id].compression =
    "Meshopt + vertex quantisation; no geometry decimation";
}
fs.writeFileSync(
  "public/assets/landmarks/manifest.json",
  JSON.stringify(manifest, null, 2),
);
console.log(manifest);
