import { assetUrl } from "../../utils/assetUrl";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh, MeshStandardMaterial, Vector3 } from "three";
import { useModel } from "../../components/three/ModelLoader";
import { journey, smooth, MELBOURNE } from "../ArrivalScene/journey";
import { places, cityPoint } from "../../data/places";
import { cityAreas } from "../../data/cityAreas";
import { cityTransition } from "./cityTransition";
import { getDiscovery } from "./discoveryStore";
import { crowdedMarkers } from "./markerLayout";

/** The map IS the city: identical X/Z vertices throughout the height morph. */
export function CityScene({ reduced }: { reduced: boolean }) {
  const model = useModel(assetUrl("/assets/models/melb-city-phase15.glb"));
  const root = useRef<Group>(null);
  const { scene, surfaces, masses } = useMemo(() => {
    const scene = model.scene.clone(true);
    const surfaces: { material: MeshStandardMaterial; mesh: Mesh }[] = [];
    const masses: { mesh: Mesh; scaleY: number; positionY: number }[] = [];
    scene.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const material = (object.material as MeshStandardMaterial).clone();
      material.roughness = 1;
      material.envMapIntensity = 0.04;
      material.transparent = true;
      material.customProgramCacheKey = () =>
        object.name.startsWith("Mass_")
          ? "melb-building-map"
          : "melb-surface-map";
      // Fade lighting into flat editorial colour without exchanging geometry.
      material.onBeforeCompile = (shader) => {
        shader.uniforms.mapFlatten = { value: 0 };
        material.userData.flattenUniform = shader.uniforms.mapFlatten;
        shader.fragmentShader =
          "uniform float mapFlatten;\n" + shader.fragmentShader;
        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <opaque_fragment>",
          `outgoingLight = mix(outgoingLight, diffuseColor.rgb * ${object.name.startsWith("Mass_") ? ".84" : "1.0"}, mapFlatten);\n#include <opaque_fragment>`,
        );
      };
      object.material = material;
      object.frustumCulled = true;
      surfaces.push({ material, mesh: object });
      if (object.name.startsWith("Mass"))
        masses.push({
          mesh: object,
          scaleY: object.scale.y,
          positionY: object.position.y,
        });
    });
    return { scene, surfaces, masses };
  }, [model]);
  const point = useMemo(() => new Vector3(), []);
  useEffect(
    () => () => surfaces.forEach((s) => s.material.dispose()),
    [surfaces],
  );
  useFrame(({ camera, size }) => {
    const p = journey.rendered;
    const { flatten: flat, emerge } = cityTransition(p);
    if (!root.current) return;
    root.current.visible = p > 0.55;
    root.current.scale.setScalar(0.018 + 0.982 * emerge);
    root.current.updateMatrixWorld(true);
    for (const { mesh, scaleY, positionY } of masses) {
      const height = (0.08 + 0.92 * emerge) * (1 - flat * 0.9998);
      mesh.scale.y = scaleY * height;
      // Keep footprints above the river/park/road surface layers at full flattening.
      mesh.position.y = positionY * height + 0.065 * flat;
    }
    for (const { material, mesh } of surfaces) {
      material.opacity = smooth(0.555, 0.65, p);
      material.depthWrite = material.opacity > 0.95;
      if (material.userData.flattenUniform)
        material.userData.flattenUniform.value = flat;
      const shadows =
        !reduced && !journey.lowPower && size.width >= 700 && flat < 0.9;
      mesh.castShadow = shadows && mesh.name.startsWith("Mass");
      mesh.receiveShadow = shadows;
    }
    const projected = [];
    for (const place of places) {
      const marker = document.getElementById(`pin-${place.id}`);
      if (!marker) continue;
      const [x, , z] = cityPoint(...(place.coordinates as [number, number]));
      point
        .set(x, 0.09, z)
        .applyMatrix4(root.current.matrixWorld)
        .project(camera);
      marker.style.left = `${(point.x * 0.5 + 0.5) * size.width}px`;
      marker.style.top = `${(-point.y * 0.5 + 0.5) * size.height}px`;
      marker.style.visibility =
        Math.abs(point.x) < 1 && Math.abs(point.y) < 1 && point.z < 1
          ? ""
          : "hidden";
      projected.push({
        id: place.id,
        x: (point.x * 0.5 + 0.5) * size.width,
        y: (-point.y * 0.5 + 0.5) * size.height,
        active: !marker.hidden,
      });
    }
    const crowded = crowdedMarkers(
      projected,
      getDiscovery().selectedId,
      size.width < 760 ? 42 : 40,
    );
    for (const place of places) {
      const marker = document.getElementById(`pin-${place.id}`);
      if (marker) marker.dataset.crowded = String(crowded.has(place.id));
    }
    for (const area of cityAreas) {
      const label = document.getElementById(`area-${area.id}`);
      if (!label) continue;
      const [x, , z] = cityPoint(area.lon, area.lat);
      point
        .set(x, 0.1, z)
        .applyMatrix4(root.current.matrixWorld)
        .project(camera);
      label.style.left = `${(point.x * 0.5 + 0.5) * size.width}px`;
      label.style.top = `${(-point.y * 0.5 + 0.5) * size.height}px`;
    }
  });
  return (
    <group ref={root} position={[MELBOURNE.x, -3.94, MELBOURNE.z]}>
      <primitive object={scene} dispose={null} />
    </group>
  );
}
