import { Suspense, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Vector3, Quaternion, Matrix4, MathUtils } from "three";
import { CityScene } from "../CityScene/CityScene";
import { Aircraft } from "./Aircraft";
import { CameraRig } from "./CameraRig";
import { Environment } from "./Environment";
import { CloudSystem } from "./CloudSystem";
import { AustraliaMap } from "./AustraliaMap";
import { LandmarkScene } from "../LandmarkExperience/LandmarkScene";
import { useExplorer } from "../LandmarkExperience/store";
import { recordFrame } from "../../components/motion/frameMetrics";
import {
  flightPath,
  flightTime,
  journey,
  smooth,
  arrivalProgress,
  shot,
} from "./journey";
export default function ArrivalScene({
  mobile,
  reduced,
}: {
  mobile: boolean;
  reduced: boolean;
}) {
  const explorer = useExplorer();
  const aircraft = useRef<Group>(null);
  const refs = useMemo(
    () => ({
      position: new Vector3(),
      tangent: new Vector3(),
      before: new Vector3(),
      after: new Vector3(),
      right: new Vector3(),
      up: new Vector3(),
      worldUp: new Vector3(0, 1, 0),
      matrix: new Matrix4(),
      quat: new Quaternion(),
      bank: new Quaternion(),
      axis: new Vector3(0, 0, 1),
      frames: 0,
      elapsed: 0,
      slowWindows: 0,
    }),
    [],
  );
  useFrame((state, dt) => {
    if (explorer.id && explorer.sceneVisible) return;
    recordFrame(
      journey.progress > 0.955 ? "discovery" : "arrival",
      dt,
      state.gl.info.render.calls,
      state.gl.info.render.triangles,
    );
    const delta = Math.min(dt, 0.05);
    journey.rendered = MathUtils.damp(
      journey.rendered,
      journey.progress,
      13,
      delta,
    );
    const p = arrivalProgress();
    const t = flightTime(p);
    flightPath.getPoint(t, refs.position);
    flightPath.getTangent(t, refs.tangent);
    flightPath.getTangent(Math.max(0, t - 0.035), refs.before);
    flightPath.getTangent(Math.min(1, t + 0.035), refs.after);
    refs.right.crossVectors(refs.worldUp, refs.tangent).normalize();
    refs.up.crossVectors(refs.tangent, refs.right);
    refs.matrix.makeBasis(refs.right, refs.up, refs.tangent);
    refs.quat.setFromRotationMatrix(refs.matrix);
    const curvature =
      refs.before.x * refs.after.z - refs.before.z * refs.after.x;
    const bank = MathUtils.clamp(
      curvature * shot.bankGain,
      -shot.bankLimit,
      shot.bankLimit,
    );
    refs.bank.setFromAxisAngle(refs.axis, reduced ? 0 : bank);
    refs.quat.multiply(refs.bank);
    if (aircraft.current) {
      aircraft.current.position.copy(refs.position);
      aircraft.current.quaternion.slerp(refs.quat, 1 - Math.exp(-12 * delta));
      // Stay at the final geographic destination while the camera takes over.
      aircraft.current.visible =
        !reduced && p > 0.015 && journey.rendered < 0.645;
      const scale = shot.heroScale * (1 - smooth(0.43, 0.68, p) * 0.28);
      aircraft.current.scale.setScalar(scale);
    }
    refs.frames++;
    refs.elapsed += dt;
    if (refs.elapsed > 1) {
      journey.fps = Math.round(refs.frames / refs.elapsed);
      journey.drawCalls = state.gl.info.render.calls;
      journey.triangles = state.gl.info.render.triangles;
      refs.slowWindows = journey.fps < 38 ? refs.slowWindows + 1 : 0;
      if (refs.slowWindows >= 3 && !journey.lowPower) {
        journey.lowPower = true;
        state.setDpr(1);
      }
      refs.frames = 0;
      refs.elapsed = 0;
    }
  }, -2);
  if (explorer.id && explorer.sceneVisible)
    return (
      <LandmarkScene
        key={`${explorer.id}-${explorer.session}`}
        id={explorer.id}
        reduced={reduced}
      />
    );
  return (
    <>
      <Environment />
      <CameraRig mobile={mobile} reduced={reduced} />
      <AustraliaMap />
      <Suspense fallback={null}>
        <CityScene reduced={reduced} />
      </Suspense>
      <group ref={aircraft}>
        <Suspense fallback={null}>
          <Aircraft mobile={mobile} />
        </Suspense>
      </group>
      <CloudSystem mobile={mobile} reduced={reduced} />
    </>
  );
}
