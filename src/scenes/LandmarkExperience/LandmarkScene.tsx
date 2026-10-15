import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Color,
  Group,
  MathUtils,
  PerspectiveCamera,
  Raycaster,
  Spherical,
  Vector3,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { loadLandmark } from "./assets";
import { sampleExteriorArc } from "./cameraPath";
import { sampleTour, tourProgress } from "./tour";
import { recordFrame } from "../../components/motion/frameMetrics";
import { landmarks, type LandmarkId } from "./registry";
import {
  cameraSettled,
  getExplorer,
  modelFailed,
  modelReady,
  useExplorer,
  syncTourChapter,
} from "./store";
export const landmarkMetrics = {
  fps: 0,
  drawCalls: 0,
  triangles: 0,
  geometries: 0,
  textures: 0,
};
export function LandmarkScene({
  id,
  reduced,
}: {
  id: LandmarkId;
  reduced: boolean;
}) {
  const { camera, gl, scene, size, setDpr } = useThree();
  const state = useExplorer(),
    landmark = landmarks[id];
  const [model, setModel] = useState<Group | null>(null);
  const controls = useMemo(() => new OrbitControls(camera), [camera]);
  const motion = useRef({
    request: -1,
    elapsed: 0,
    from: new Vector3(),
    to: new Vector3(),
    fromTarget: new Vector3(),
    target: new Vector3(),
    a: new Spherical(),
    b: new Spherical(),
    scratch: new Spherical(),
    running: false,
    guided: false,
    blend: 0,
    tourPosition: new Vector3(),
    tourTarget: new Vector3(),
  });
  const projection = useMemo(
    () => ({
      p: new Vector3(),
      dir: new Vector3(),
      ray: new Raycaster(),
      frames: 0,
      elapsed: 0,
      total: 0,
      slow: 0,
      occluded: Array(6).fill(false) as boolean[],
    }),
    [],
  );
  useEffect(() => {
    setModel(null);
    const abort = new AbortController();
    let finished = false;
    const timeout = setTimeout(() => {
      if (!finished) {
        abort.abort();
        modelFailed(id);
      }
    }, 25000);
    loadLandmark(id, abort.signal)
      .then((asset) => {
        if (!abort.signal.aborted) {
          finished = true;
          clearTimeout(timeout);
          setModel(asset.scene);
          modelReady(id);
        }
      })
      .catch(() => {
        if (!abort.signal.aborted) modelFailed(id);
      });
    return () => {
      abort.abort();
      clearTimeout(timeout);
    };
  }, [id]);
  useEffect(() => {
    const background = scene.background,
      fog = scene.fog;
    scene.background = new Color("#e7e5db");
    scene.fog = null;
    controls.connect(gl.domElement);
    const pc = camera as PerspectiveCamera;
    const old = { near: pc.near, far: pc.far, fov: pc.fov, up: pc.up.clone() };
    pc.near = 0.1;
    pc.far = 160;
    pc.fov = 39;
    pc.up.set(0, 1, 0);
    pc.updateProjectionMatrix();
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.enablePan = false;
    controls.minPolarAngle = 0.22;
    controls.maxPolarAngle = 1.22;
    controls.minDistance = landmark.radius * 1.4;
    controls.maxDistance = landmark.radius * 5.5;
    controls.rotateSpeed = 0.55;
    controls.zoomSpeed = 0.6;
    camera.position.fromArray(landmark.home).multiplyScalar(1.13);
    controls.target.fromArray(landmark.target);
    controls.update();
    return () => {
      controls.dispose();
      scene.background = background;
      scene.fog = fog;
      pc.near = old.near;
      pc.far = old.far;
      pc.fov = old.fov;
      pc.up.copy(old.up);
      pc.clearViewOffset();
      pc.updateProjectionMatrix();
    };
  }, [camera, scene, controls, landmark]);
  useFrame((_, dt) => {
    const s = getExplorer(),
      m = motion.current;
    if (s.ready)
      recordFrame(
        `landmark-${id}-${s.mode}`,
        dt,
        gl.info.render.calls,
        gl.info.render.triangles,
      );
    const pc = camera as PerspectiveCamera;
    // Responsive FOV changes preserve the current orbit and selected feature.
    const aspect = size.width / size.height;
    const framing = Math.max(1, Math.min(1.75, 1 / aspect));
    const fov =
      (2 * Math.atan(Math.tan((39 * Math.PI) / 360) * framing) * 180) / Math.PI;
    pc.fov = MathUtils.damp(
      pc.fov,
      fov,
      reduced ? 1000 : 8,
      Math.min(dt, 0.05),
    );
    pc.updateProjectionMatrix();
    const guided = s.mode === "guided" && s.ready;
    if (guided)
      pc.setViewOffset(
        size.width,
        size.height,
        size.width >= 900 ? size.width * 0.1 : 0,
        size.width < 760 ? size.height * 0.12 : 0,
        size.width,
        size.height,
      );
    else if (pc.view?.enabled) pc.clearViewOffset();
    if (guided) {
      if (!m.guided) {
        m.from.copy(camera.position);
        m.fromTarget.copy(controls.target);
        m.blend = 0;
      }
      m.guided = true;
      m.running = false;
      m.request = s.request;
      controls.enabled = false;
      if (!s.story) {
        tourProgress.rendered = reduced
          ? tourProgress.target
          : MathUtils.damp(
              tourProgress.rendered,
              tourProgress.target,
              9,
              Math.min(dt, 0.05),
            );
        if (Math.abs(tourProgress.rendered - tourProgress.target) < 0.0001)
          tourProgress.rendered = tourProgress.target;
        sampleTour(id, tourProgress.rendered, m.tourPosition, m.tourTarget);
        m.blend = reduced ? 1 : Math.min(1, m.blend + dt / 0.65);
        const ease = m.blend * m.blend * (3 - 2 * m.blend);
        camera.position.lerpVectors(m.from, m.tourPosition, ease);
        controls.target.lerpVectors(m.fromTarget, m.tourTarget, ease);
        camera.lookAt(controls.target);
        syncTourChapter(
          tourProgress.rendered,
          m.blend === 1 && tourProgress.rendered === tourProgress.target,
        );
        const slider = document.getElementById(
          "landmark-tour-progress",
        ) as HTMLInputElement | null;
        if (slider && document.activeElement !== slider)
          slider.value = String(tourProgress.rendered * 100);
      }
    } else m.guided = false;
    if (!guided && s.request !== m.request && s.ready) {
      m.request = s.request;
      m.elapsed = 0;
      m.from.copy(camera.position);
      m.fromTarget.copy(controls.target);
      m.to.copy(camera.position);
      m.target.copy(controls.target);
      if (s.command === "hold") {
        m.running = false;
        controls.enabled = s.mode === "free";
        cameraSettled(m.request);
      } else {
        if (s.command === "reset") {
          m.to.fromArray(landmark.home);
          m.target.fromArray(landmark.target);
        } else if (s.command === "focus") {
          const f = landmark.features[s.feature ?? s.chapter];
          m.to.fromArray(f.camera);
          m.target.fromArray(f.point);
        } else {
          const offset = camera.position.clone().sub(controls.target);
          const sphere = new Spherical().setFromVector3(offset);
          if (s.command === "in") sphere.radius *= 0.84;
          if (s.command === "out") sphere.radius *= 1.19;
          if (s.command === "left") sphere.theta -= 0.16;
          if (s.command === "right") sphere.theta += 0.16;
          if (s.command === "up") sphere.phi -= 0.1;
          if (s.command === "down") sphere.phi += 0.1;
          sphere.radius = MathUtils.clamp(
            sphere.radius,
            controls.minDistance,
            controls.maxDistance,
          );
          sphere.phi = MathUtils.clamp(sphere.phi, 0.22, 1.22);
          m.to.setFromSpherical(sphere).add(controls.target);
        }
        // Fly around the exterior, not through the building on a straight chord.
        m.a.setFromVector3(m.from);
        m.b.setFromVector3(m.to);
        let angle = m.b.theta - m.a.theta;
        angle = Math.atan2(Math.sin(angle), Math.cos(angle));
        m.b.theta = m.a.theta + angle;
        m.running = true;
        controls.enabled = false;
      }
    }
    if (!guided && m.running) {
      m.elapsed += Math.min(dt, 0.05);
      const duration = s.phase === "entering" ? 1.8 : 1.15;
      const t = reduced ? 1 : Math.min(1, m.elapsed / duration);
      const e = t * t * (3 - 2 * t);
      sampleExteriorArc(
        m.a,
        m.b,
        t,
        landmark.radius,
        camera.position,
        m.scratch,
      );
      controls.target.lerpVectors(m.fromTarget, m.target, e);
      camera.lookAt(controls.target);
      if (t === 1) {
        m.running = false;
        cameraSettled(m.request);
        controls.enabled = s.mode === "free" && !s.story;
      }
    } else if (!guided) {
      controls.enabled =
        s.ready && s.mode === "free" && !s.story && s.phase === "exploring";
      controls.update();
    }
    // Conservative outer-envelope collision safeguard for direct orbit input.
    if (controls.enabled && camera.position.length() < landmark.radius * 1.5) {
      camera.position.setLength(landmark.radius * 1.5);
      camera.lookAt(controls.target);
    }
    pc.updateMatrixWorld();
    projection.frames++;
    projection.total++;
    projection.elapsed += dt;
    if (model && s.mode === "free" && !s.story) {
      for (let i = 0; i < landmark.features.length; i++) {
        const el = document.getElementById(`landmark-pin-${i}`);
        if (!el) continue;
        projection.p.fromArray(landmark.features[i].point);
        const distance = camera.position.distanceTo(projection.p);
        projection.dir.copy(projection.p).sub(camera.position).normalize();
        projection.ray.set(camera.position, projection.dir);
        projection.ray.far = Math.max(0, distance - 0.12);
        if (projection.frames % 12 === i)
          projection.occluded[i] =
            projection.ray.intersectObject(model, true).length > 0;
        const blocked = projection.occluded[i];
        projection.p.project(camera);
        const visible =
          !blocked &&
          projection.p.z > -1 &&
          projection.p.z < 1 &&
          Math.abs(projection.p.x) < 0.95 &&
          Math.abs(projection.p.y) < 0.87;
        el.style.visibility = visible ? "visible" : "hidden";
        el.style.transform = `translate(-50%,-50%) translate(${(projection.p.x * 0.5 + 0.5) * size.width}px,${(-projection.p.y * 0.5 + 0.5) * size.height}px)`;
      }
    }
    if (projection.elapsed >= 1) {
      landmarkMetrics.fps = Math.round(projection.total / projection.elapsed);
      landmarkMetrics.drawCalls = gl.info.render.calls;
      landmarkMetrics.triangles = gl.info.render.triangles;
      landmarkMetrics.geometries = gl.info.memory.geometries;
      landmarkMetrics.textures = gl.info.memory.textures;
      projection.slow = landmarkMetrics.fps < 38 ? projection.slow + 1 : 0;
      if (projection.slow === 3) setDpr(1);
      projection.total = 0;
      projection.elapsed = 0;
    }
  });
  return (
    <>
      <hemisphereLight args={["#f8f4e8", "#79847d", 1.7]} />
      <directionalLight
        position={[-9, 18, 12]}
        intensity={2.4}
        color="#fff1d7"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-far={65}
        shadow-normalBias={0.025}
        shadow-bias={-0.00015}
      />
      <directionalLight position={[8, 5, -8]} intensity={0.6} color="#c5d4dd" />
      {model && <primitive object={model} dispose={null} />}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.04, 0]}
        receiveShadow
      >
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#e7e5db" roughness={1} />
      </mesh>
    </>
  );
}
