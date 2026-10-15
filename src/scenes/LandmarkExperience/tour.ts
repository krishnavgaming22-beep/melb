import { CatmullRomCurve3, MathUtils, Vector3 } from "three";
import { landmarks, type LandmarkId, type Point } from "./registry";

// Directed exterior routes. Six anchors, one parameter: no chapter-owned tweens.
const cameras: Record<LandmarkId, Point[]> = {
  mcg: [
    [9, 15, 13],
    [-7, 12, 14],
    [9, 14, 12],
    [2, 16, 10],
    [13, 12, 5],
    [10, 14, 16],
  ],
  flinders: [
    [11, 8, 17],
    [11, 6, 10],
    [9, 4, 10],
    [0, 7, 15],
    [-8, 13, 10],
    [10, 9, 17],
  ],
  federation: [
    [-9, 10, 13],
    [-8, 7, 10],
    [8, 8, 12],
    [7, 11, 9],
    [-5, 12, 10],
    [-8, 10, 12],
  ],
  shrine: [
    [4, 4.5, 7.5],
    [2.8, 2.8, 5.5],
    [2.5, 2.3, 5],
    [-3, 4, 5],
    [-4, 4, 6],
    [4, 4.2, 6.5],
  ],
};
// Story focus is composed with surrounding architecture; hotspot locations stay exact.
const targets: Record<LandmarkId, Point[]> = {
  mcg: [
    [0, 1, 0],
    [-1.5, 1.5, -0.5],
    [1.4, 1, 0],
    [0, 0.4, 0],
    [2, 1.8, -0.5],
    [0, 1, 0],
  ],
  flinders: [
    [0, 0.8, 0],
    [4, 1.3, 0],
    [4.8, 0.8, 0.3],
    [-1, 0.8, 0],
    [-1, 0.7, -0.6],
    [0, 0.8, 0],
  ],
  federation: [
    [0, 0.6, 0],
    [-1.5, 0.3, 0.2],
    [1.1, 1, -0.6],
    [0.2, 0.8, -1.2],
    [-0.6, 0.8, -1],
    [0, 0.6, 0],
  ],
  shrine: [
    [0, 0.65, 0.5],
    [0, 0.35, 0.8],
    [0, 0.65, 0.65],
    [0, 1.1, 0],
    [-0.4, 0.7, 0],
    [0, 0.65, 0],
  ],
};
export const tours = Object.fromEntries(
  Object.entries(landmarks).map(([id, lm]) => [
    id,
    {
      position: new CatmullRomCurve3(
        cameras[id as LandmarkId].map((p) => new Vector3(...p)),
        false,
        "centripetal",
      ),
      target: new CatmullRomCurve3(
        targets[id as LandmarkId].map((p) => new Vector3(...p)),
        false,
        "centripetal",
      ),
    },
  ]),
) as Record<
  LandmarkId,
  { position: CatmullRomCurve3; target: CatmullRomCurve3 }
>;
export const tourProgress = { target: 0, rendered: 0 };
export function sampleTour(
  id: LandmarkId,
  progress: number,
  position: Vector3,
  target: Vector3,
) {
  const p = MathUtils.clamp(progress, 0, 1);
  tours[id].position.getPoint(p, position);
  tours[id].target.getPoint(p, target);
}
export function setTourProgress(progress: number) {
  tourProgress.target = MathUtils.clamp(progress, 0, 1);
}
export function advanceTour(delta: number) {
  setTourProgress(tourProgress.target + delta);
}
