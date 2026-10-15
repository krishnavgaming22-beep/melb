import { MathUtils, Spherical, Vector3 } from "three";
/** Shortest exterior orbit: radius cannot dip through the architectural envelope. */
export function sampleExteriorArc(
  a: Spherical,
  b: Spherical,
  t: number,
  radius: number,
  out: Vector3,
  scratch = new Spherical(),
) {
  const e = t * t * (3 - 2 * t);
  scratch.set(
    Math.max(radius * 1.6, MathUtils.lerp(a.radius, b.radius, e)),
    MathUtils.lerp(a.phi, b.phi, e),
    MathUtils.lerp(a.theta, b.theta, e),
  );
  return out.setFromSpherical(scratch);
}
