import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Shape,
  ShapeGeometry,
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  Line as ThreeLine,
  Mesh,
} from "three";
import { terrainMaterial } from "./terrainMaterial";
import data from "../../data/australia.json";
import {
  geo,
  journey,
  smooth,
  arrivalProgress,
  MELBOURNE,
  flightPath,
  flightTime,
  clamp,
} from "./journey";
export function AustraliaMap() {
  const root = useRef<Group>(null);
  const terrain = useMemo(() => terrainMaterial(), []);
  const ring = useRef<Mesh>(null);
  const coastMaterial = useRef<LineBasicMaterial>(null);
  const { geometry, coasts, route } = useMemo(() => {
    const shapes: Shape[] = [];
    const edges: number[] = [];
    for (const polygon of data.coordinates) {
      const coords = polygon[0];
      const points = coords.map(([x, y]) => geo(x, y));
      const shape = new Shape();
      points.forEach((p, i) =>
        i ? shape.lineTo(p.x, -p.z) : shape.moveTo(p.x, -p.z),
      );
      shapes.push(shape);
      for (let i = 1; i < points.length; i++)
        edges.push(
          points[i - 1].x,
          -3.97,
          points[i - 1].z,
          points[i].x,
          -3.97,
          points[i].z,
        );
    }
    const geometry = new ShapeGeometry(shapes);
    const coasts = new BufferGeometry();
    coasts.setAttribute("position", new Float32BufferAttribute(edges, 3));
    const points = [];
    for (let i = 0; i <= 240; i++) {
      const p = flightPath.getPoint(0.15 + ((1 - 0.15) * i) / 240);
      points.push(p.x, -3.9, p.z);
    }
    const route = new BufferGeometry();
    route.setAttribute("position", new Float32BufferAttribute(points, 3));
    route.setDrawRange(0, 0);
    return { geometry, coasts, route };
  }, []);
  const line = useMemo(
    () =>
      new ThreeLine(
        route,
        new LineBasicMaterial({
          color: "#efe2c5",
          transparent: true,
          opacity: 0.85,
        }),
      ),
    [route],
  );
  useFrame(() => {
    const p = arrivalProgress();
    const alpha =
      smooth(0.43, 0.64, p) * (1 - smooth(0.56, 0.64, journey.rendered));
    if (root.current)
      root.current.visible = alpha > 0.001 && journey.rendered < 0.645;
    if (root.current) {
      const scale = 1 + smooth(0.54, 0.64, journey.rendered) * 8;
      root.current.scale.setScalar(scale);
      root.current.position.set(
        MELBOURNE.x * (1 - scale),
        -4 * (1 - scale),
        MELBOURNE.z * (1 - scale),
      );
    }
    terrain.uniforms.opacity.value = alpha;
    line.material.opacity = alpha * 0.85;
    if (coastMaterial.current) coastMaterial.current.opacity = alpha * 0.5;
    route.setDrawRange(
      0,
      Math.floor(clamp((flightTime(p) - 0.15) / (1 - 0.15)) * 240) + 1,
    );
    if (ring.current) {
      ring.current.scale.setScalar(1 + smooth(0.8, 0.9, p) * 0.5);
      ring.current.visible = p > 0.6;
    }
  });
  useEffect(
    () => () => {
      geometry.dispose();
      coasts.dispose();
      route.dispose();
      line.material.dispose();
      terrain.dispose();
    },
    [geometry, coasts, route, line, terrain],
  );
  return (
    <group ref={root}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -4, 0]}
        geometry={geometry}
      >
        <primitive object={terrain} attach="material" />
      </mesh>
      <lineSegments geometry={coasts}>
        <lineBasicMaterial
          ref={coastMaterial}
          color="#e4dac2"
          transparent
          opacity={0.5}
        />
      </lineSegments>
      <primitive object={line} />
      <group
        position={[MELBOURNE.x, -3.86, MELBOURNE.z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <mesh>
          <circleGeometry args={[0.065, 32]} />
          <meshBasicMaterial color="#f7eee0" />
        </mesh>
        <mesh ref={ring}>
          <ringGeometry args={[0.18, 0.195, 64]} />
          <meshBasicMaterial color="#f7eee0" transparent opacity={0.8} />
        </mesh>
      </group>
    </group>
  );
}
