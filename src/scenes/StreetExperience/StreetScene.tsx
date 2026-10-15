import { assetUrl } from "../../utils/assetUrl";
import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, Group, Mesh, PerspectiveCamera, Texture, Vector3 } from "three";
import {
  GLTFLoader,
  type GLTF,
} from "three/examples/jsm/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import {
  getStreet,
  streetLook,
  streetMetrics,
  streetPoint,
  updateStreet,
  useStreet,
} from "./store";
import inspection from "../../../docs/phase4/mall-inspection.json";
import { recordFrame } from "../../components/motion/frameMetrics";

export const streetPoints = inspection.points.map((p) => p.position);
function dispose(asset: GLTF) {
  const geometries = new Set(),
    materials = new Set(),
    textures = new Set<Texture>();
  asset.scene.traverse((o) => {
    if (o instanceof Mesh) {
      if (!geometries.has(o.geometry)) {
        geometries.add(o.geometry);
        o.geometry.dispose();
      }
      for (const m of Array.isArray(o.material) ? o.material : [o.material])
        if (!materials.has(m)) {
          materials.add(m);
          for (const value of Object.values(m))
            if (value instanceof Texture) textures.add(value);
          m.dispose();
        }
    }
  });
  textures.forEach((t) => t.dispose());
}
export default function StreetScene({ reduced }: { reduced: boolean }) {
  const { camera, gl, scene, setDpr } = useThree(),
    s = useStreet();
  const [model, setModel] = useState<Group | null>(null);
  const motion = useRef({
    request: -1,
    elapsed: 0,
    switched: false,
    auto: 0,
    yaw: 0,
    pitch: 0,
    seconds: 0,
    frames: 0,
    slow: 0,
    target: new Vector3(),
  });
  useEffect(() => {
    const abort = new AbortController(),
      start = performance.now();
    let asset: GLTF | undefined;
    const ktx = new KTX2Loader()
      .setTranscoderPath(assetUrl("/decoders/basis/"))
      .detectSupport(gl);
    const loader = new GLTFLoader()
      .setMeshoptDecoder(MeshoptDecoder)
      .setKTX2Loader(ktx);
    updateStreet({ ready: false, error: false });
    setModel(null);
    const timeout = setTimeout(() => {
      abort.abort();
      updateStreet({ error: true, ready: false, playing: false });
    }, 30000);
    fetch(assetUrl(`/assets/photomesh/C4-22/${s.quality}.glb`), { signal: abort.signal })
      .then((r) => {
        if (!r.ok) throw Error("Asset unavailable");
        return r.arrayBuffer();
      })
      .then(async (buffer) => {
        const gltf = await loader.parseAsync(
          buffer,
          assetUrl("/assets/photomesh/C4-22/"),
        );
        if (abort.signal.aborted) {
          dispose(gltf);
          return;
        }
        asset = gltf;
        streetMetrics.loadMs = performance.now() - start;
        streetMetrics.bytes = buffer.byteLength;
        setModel(gltf.scene);
        updateStreet({ ready: true });
        clearTimeout(timeout);
      })
      .catch(() => {
        if (!abort.signal.aborted)
          updateStreet({ error: true, playing: false });
        clearTimeout(timeout);
      });
    return () => {
      abort.abort();
      clearTimeout(timeout);
      if (asset) dispose(asset);
      ktx.dispose();
    };
  }, [gl, s.quality]);
  useEffect(() => {
    const pc = camera as PerspectiveCamera,
      old = {
        near: pc.near,
        far: pc.far,
        fov: pc.fov,
        bg: scene.background,
        fog: scene.fog,
      };
    pc.near = 0.08;
    pc.far = 450;
    pc.fov = 64;
    pc.clearViewOffset();
    pc.updateProjectionMatrix();
    scene.background = new Color("#cad6dc");
    scene.fog = null;
    camera.position.fromArray(streetPoints[0]);
    streetLook.yaw = 0;
    streetLook.pitch = 0;
    let drag: { x: number; y: number; id: number } | null = null;
    const down = (e: PointerEvent) => {
      if (getStreet().mode !== "free") return;
      drag = { x: e.clientX, y: e.clientY, id: e.pointerId };
      gl.domElement.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      streetLook.yaw -= (e.clientX - drag.x) * 0.004;
      streetLook.pitch = Math.max(
        -0.45,
        Math.min(0.5, streetLook.pitch + (e.clientY - drag.y) * 0.003),
      );
      drag = { x: e.clientX, y: e.clientY, id: e.pointerId };
    };
    const up = () => {
      drag = null;
    };
    gl.domElement.addEventListener("pointerdown", down);
    gl.domElement.addEventListener("pointermove", move);
    gl.domElement.addEventListener("pointerup", up);
    gl.domElement.addEventListener("pointercancel", up);
    return () => {
      gl.domElement.removeEventListener("pointerdown", down);
      gl.domElement.removeEventListener("pointermove", move);
      gl.domElement.removeEventListener("pointerup", up);
      gl.domElement.removeEventListener("pointercancel", up);
      pc.near = old.near;
      pc.far = old.far;
      pc.fov = old.fov;
      pc.updateProjectionMatrix();
      scene.background = old.bg;
      scene.fog = old.fog;
    };
  }, [camera, gl, scene]);
  useFrame((_, dt) => {
    const st = getStreet(),
      m = motion.current;
    if (!st.ready) return;
    recordFrame(
      `street-${st.quality}`,
      dt,
      gl.info.render.calls,
      gl.info.render.triangles,
    );
    if (m.request !== st.request) {
      m.request = st.request;
      m.elapsed = 0;
      m.switched = false;
      m.auto = 0;
      streetLook.yaw = 0;
      streetLook.pitch = 0;
    }
    m.elapsed += Math.min(dt, 0.05);
    const fade = document.getElementById("street-view-curtain");
    const duration = reduced ? 0 : 0.7;
    if (!m.switched && m.elapsed >= duration / 2) {
      camera.position.fromArray(streetPoints[st.point]);
      m.switched = true;
      m.yaw = 0;
      m.pitch = 0;
    }
    if (fade)
      fade.style.opacity = String(
        duration
          ? Math.max(0, 1 - Math.abs((m.elapsed / duration) * 2 - 1))
          : 0,
      );
    const factor = reduced ? 1 : 1 - Math.exp(-12 * Math.min(dt, 0.05));
    m.yaw += (streetLook.yaw - m.yaw) * factor;
    m.pitch += (streetLook.pitch - m.pitch) * factor;
    // A stable horizon and bounded head tilt. Positions cannot leave verified samples.
    const heading = 1.19029 + m.yaw;
    m.target
      .set(
        Math.sin(heading) * Math.cos(m.pitch),
        Math.sin(m.pitch),
        -Math.cos(heading) * Math.cos(m.pitch),
      )
      .add(camera.position);
    camera.lookAt(m.target);
    if (st.playing && !st.info && !reduced) {
      m.auto += Math.min(dt, 0.05);
      if (m.auto > 9) {
        m.auto = 0;
        if (st.point < 3) streetPoint(st.point + 1);
        else updateStreet({ playing: false });
      }
    }
    if (dt > 0.05) streetMetrics.longFrames++;
    m.frames++;
    m.seconds += dt;
    if (m.seconds >= 1) {
      streetMetrics.fps = Math.round(m.frames / m.seconds);
      streetMetrics.drawCalls = gl.info.render.calls;
      streetMetrics.triangles = gl.info.render.triangles;
      m.slow = streetMetrics.fps < 38 ? m.slow + 1 : 0;
      if (m.slow === 3) setDpr(1);
      m.frames = 0;
      m.seconds = 0;
    }
  });
  return (
    <>
      {model && <primitive object={model} dispose={null} />}
      <ambientLight intensity={1} />
    </>
  );
}
