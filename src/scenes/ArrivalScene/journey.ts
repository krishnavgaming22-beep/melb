import { CatmullRomCurve3, Vector3, MathUtils } from "three";
/** Single mutable timeline. No per-frame React state. */
export const journey = {
  progress: 0,
  rendered: 0,
  ready: false,
  lowPower: false,
  drawCalls: 0,
  triangles: 0,
  fps: 60,
};
export const clamp = (v: number) => MathUtils.clamp(v, 0, 1);
export const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const geo = (lon: number, lat: number, y = -4) =>
  new Vector3(
    (lon - 134) * 0.52 * Math.cos(Math.PI / 6),
    y,
    -(lat + 27) * 0.52,
  );
export const MELBOURNE = geo(144.9631, -37.8136);
export const flightPath = new CatmullRomCurve3(
  [
    new Vector3(-18, 3, -5),
    new Vector3(-8, 3.8, 1),
    new Vector3(1, 3.5, -1),
    new Vector3(4, 3.1, -1.8),
    new Vector3(3.5, 2.7, 1.3),
    new Vector3(MELBOURNE.x, 2.2, MELBOURNE.z),
  ],
  false,
  "catmullrom",
  0.5,
);
// Arrival holds at the destination. The camera takes over after this point.
export const flightTime = (p: number) => smooth(0, 0.9, p);
export const arrivalProgress = () => clamp(journey.rendered / 0.58);
export const CLOSEST_PASS = 0.12 * 0.58;
export const shot = {
  bankLimit: Math.PI / 12,
  bankGain: 3.6,
  heroScale: 0.074,
  heroFov: 40,
  mapFov: 43,
};
