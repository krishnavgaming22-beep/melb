import { Camera } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
/** Camera-relative steering (not object-grab rotation). Construct in the final up frame. */
export function createLandmarkControls(
  camera: Camera,
  element: HTMLElement,
  radius: number,
  reduced = false,
) {
  camera.up.set(0, 1, 0);
  const controls = new OrbitControls(camera, element);
  controls.enableDamping = !reduced;
  controls.dampingFactor = 0.12;
  controls.enablePan = false;
  controls.minPolarAngle = 0.22;
  controls.maxPolarAngle = 1.22;
  controls.minDistance = radius * 1.4;
  controls.maxDistance = radius * 5.5;
  controls.rotateSpeed = -0.55;
  controls.zoomSpeed = 0.6;
  return controls;
}
