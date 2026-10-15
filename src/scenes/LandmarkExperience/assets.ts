import { assetUrl } from "../../utils/assetUrl";
import {
  GLTFLoader,
  type GLTF,
} from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { Mesh } from "three";
import type { LandmarkId } from "./registry";
const cache = new Map<LandmarkId, GLTF>();
export const assetMetrics: Record<string, { loadMs: number; bytes: number }> =
  {};
export async function loadLandmark(id: LandmarkId, signal: AbortSignal) {
  const existing = cache.get(id);
  if (existing) {
    cache.delete(id);
    cache.set(id, existing);
    return existing;
  }
  const start = performance.now();
  const response = await fetch(assetUrl(`/assets/landmarks/${id}.glb`), { signal });
  if (!response.ok) throw new Error(`Landmark asset HTTP ${response.status}`);
  const buffer = await response.arrayBuffer();
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.parseAsync(buffer, assetUrl("/assets/landmarks/"));
  if (signal.aborted) {
    dispose(gltf);
    throw new DOMException("Cancelled", "AbortError");
  }
  gltf.scene.traverse((o) => {
    if (o instanceof Mesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  cache.set(id, gltf);
  assetMetrics[id] = {
    loadMs: performance.now() - start,
    bytes: buffer.byteLength,
  };
  // Only the active and most recent scene remain cached. Assets are not shared across models.
  while (cache.size > 2) {
    const oldest = cache.keys().next().value!;
    dispose(cache.get(oldest)!);
    cache.delete(oldest);
  }
  return gltf;
}
function dispose(gltf: GLTF) {
  gltf.scene.traverse((o) => {
    if (o instanceof Mesh) {
      o.geometry.dispose();
      for (const m of Array.isArray(o.material) ? o.material : [o.material])
        m.dispose();
    }
  });
}
