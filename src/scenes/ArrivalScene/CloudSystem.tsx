import { assetUrl } from "../../utils/assetUrl";
import { useMemo, useRef } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import {
  Group,
  Mesh,
  MeshBasicMaterial,
  TextureLoader,
  SRGBColorSpace,
} from "three";
import { journey, smooth, arrivalProgress } from "./journey";
const clouds = [
  [-14, 1, -5, 23, 10, 0],
  [-1, -1, -12, 24, 10, 1],
  [12, -2, -5, 20, 8, 2],
  [-12, 0, 8, 22, 9, 1],
  [6, -2, 10, 24, 9, 0],
  [20, 1, 4, 20, 8, 2],
  [-20, 5, -18, 28, 10, 1],
  [4, 5, -25, 30, 11, 0],
  [24, 3, -20, 27, 10, 2],
  [-5, 6, 15, 25, 10, 2],
  [18, 7, 20, 30, 10, 1],
  [-23, 4, 19, 26, 10, 0],
];
export function CloudSystem({
  mobile,
  reduced,
}: {
  mobile: boolean;
  reduced: boolean;
}) {
  const textures = useLoader(TextureLoader, [
    assetUrl("/assets/textures/cloud-0.webp"),
    assetUrl("/assets/textures/cloud-1.webp"),
    assetUrl("/assets/textures/cloud-2.webp"),
  ]);
  const group = useRef<Group>(null);
  const specs = useMemo(
    () => (mobile ? clouds.filter((_, i) => i % 2 === 0) : clouds),
    [mobile],
  );
  textures.forEach((t) => (t.colorSpace = SRGBColorSpace));
  useFrame(({ camera }) => {
    group.current?.children.forEach((obj, i) => {
      const mesh = obj as Mesh;
      const s = specs[i];
      mesh.quaternion.copy(camera.quaternion);
      mesh.position.x =
        s[0] +
        arrivalProgress() * (i % 2 ? -7 : 5) +
        (reduced ? 0 : Math.sin(arrivalProgress() * 2 + i) * 0.7);
      const exit = 0.48 + (i % 3) * 0.07;
      (mesh.material as MeshBasicMaterial).opacity =
        (1 - smooth(exit, exit + 0.19, arrivalProgress())) *
        (i > 7 ? 0.4 : 0.68) *
        (1 - smooth(0.4, 0.67, arrivalProgress()) * 0.65);
      mesh.visible = (mesh.material as MeshBasicMaterial).opacity > 0.005;
    });
  });
  return (
    <group ref={group}>
      {specs.map((c, i) => (
        <mesh
          key={i}
          position={[c[0], c[1], c[2]]}
          scale={[c[3], c[4], 1]}
          renderOrder={2 + i * 0.01}
        >
          <planeGeometry />
          <meshBasicMaterial
            map={textures[c[5]]}
            transparent
            depthWrite={false}
            opacity={0.8}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
