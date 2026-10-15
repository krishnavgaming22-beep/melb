import { useMemo } from "react";
import { mapView } from "../CityScene/mapView";
import { cityTransition } from "../CityScene/cityTransition";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera, Vector3 } from "three";
import {
  flightPath,
  flightTime,
  journey,
  smooth,
  arrivalProgress,
  MELBOURNE,
  shot,
} from "./journey";
export function CameraRig({
  mobile,
  reduced,
}: {
  mobile: boolean;
  reduced: boolean;
}) {
  const v = useMemo(
    () => ({
      pos: new Vector3(),
      target: new Vector3(),
      plane: new Vector3(),
      offset: new Vector3(),
      map: new Vector3(),
      look: new Vector3(),
      marker: new Vector3(),
      city: new Vector3(),
      bias: new Vector3(),
      focus: new Vector3(),
      parallax: new Vector3(),
      view: new Vector3(mapView.x, mapView.z, mapView.zoom),
    }),
    [],
  );
  useFrame(({ camera, size, pointer }, delta) => {
    const p = arrivalProgress();
    flightPath.getPoint(flightTime(p), v.plane);
    const reveal = smooth(0.03, 0.2, p);
    v.offset.set(9 - reveal * 3, 5.3 + reveal * 1.3, 14 - reveal * 5);
    if (mobile) v.offset.multiplyScalar(1.48);
    v.pos.copy(v.plane).add(v.offset);
    v.target.copy(v.plane).add(v.look.set(0, 0.6, -0.6));
    v.target.x += (1 - reveal) * 14;
    // A fixed opening frame lets the aircraft cross the centred word once.
    const chase = smooth(0.13, 0.27, p);
    v.pos.lerp(v.look.set(0, mobile ? 5 : 4, mobile ? 29 : 21), 1 - chase);
    v.target.lerp(v.look.set(0, 3, 0), 1 - chase);
    const map = smooth(0.4, 0.67, p);
    v.map.set(mobile ? 0 : 1, mobile ? 48 : 31, mobile ? 20 : 18);
    v.pos.lerp(v.map, map);
    v.target.lerp(v.look.set(0, -3.5, 0), map);
    const descent = smooth(0.84, 1, p);
    v.pos.lerp(
      v.map.set(MELBOURNE.x + 1.3, mobile ? 9 : 6.5, MELBOURNE.z + 7),
      descent,
    );
    v.target.lerp(
      v.look.copy(MELBOURNE).add(v.offset.set(0, 0, -0.3)),
      descent,
    );
    if (reduced) {
      v.pos.set(0, mobile ? 46 : 32, 19);
      v.target.set(0, -3.5, 0);
    }
    const global = journey.rendered;
    const cityBlend = smooth(0.55, 0.7, global);
    const { lift: flat, mapInteraction: mapBlend } = cityTransition(global);
    const drift = reduced ? 0 : smooth(0.69, 0.79, global) * 3;
    v.view.lerp(
      v.offset.set(mapView.x, mapView.z, mapView.zoom),
      reduced ? 1 : 1 - Math.exp(-5 * Math.min(delta, 0.05)),
    );
    const effectiveZoom = 1 + (v.view.z - 1) * mapBlend;
    const overheadHeight =
      Math.max(46, 53 / (size.width / size.height)) /
      (2 * Math.tan((28 * Math.PI) / 360)) /
      effectiveZoom;
    mapView.unitsPerPixel =
      (2 * overheadHeight * Math.tan((28 * Math.PI) / 360)) / size.height;
    v.city.set(
      MELBOURNE.x + 24 - drift,
      MELBOURNE.y + (mobile ? 58 : 34),
      MELBOURNE.z + (mobile ? 55 : 38),
    );
    v.city.lerp(
      v.map.set(MELBOURNE.x, -3.94 + overheadHeight, MELBOURNE.z),
      flat,
    );
    v.pos.lerp(v.city, cityBlend);
    v.look.set(MELBOURNE.x - (mobile ? 0 : 6) * (1 - flat), -3.94, MELBOURNE.z);
    v.pos.x += v.view.x * mapBlend;
    v.look.x += v.view.x * mapBlend;
    v.pos.z += v.view.y * mapBlend;
    v.look.z += v.view.y * mapBlend;
    const parallax = reduced
      ? 0
      : smooth(0.67, 0.71, global) * (1 - smooth(0.79, 0.87, global));
    v.parallax.lerp(
      v.offset.set(pointer.x * 0.65, pointer.y * 0.32, 0),
      1 - Math.exp(-4 * Math.min(delta, 0.05)),
    );
    v.pos.x += v.parallax.x * parallax;
    v.pos.y += v.parallax.y * parallax;
    v.target.lerp(v.look, cityBlend);
    camera.position.copy(v.pos);
    // A north-up basis removes the singularity at exactly vertical pitch.
    camera.up.set(0, 1 - flat, -flat).normalize();
    camera.lookAt(v.target);
    const cam = camera as PerspectiveCamera;
    const aerialFov = shot.heroFov + map * 3 - descent * 4 + cityBlend;
    const fov = aerialFov * (1 - flat) + 28 * flat;
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
    const marker = document.getElementById("melbourne-label");
    if (marker) {
      v.marker.copy(MELBOURNE).project(camera);
      marker.style.transform = `translate(${(v.marker.x * 0.5 + 0.5) * size.width}px,${(-v.marker.y * 0.5 + 0.5) * size.height}px)`;
      marker.style.opacity = String(
        smooth(0.61, 0.7, p) * (1 - smooth(0.9, 0.97, p)),
      );
    }
  }, -1);
  return null;
}
