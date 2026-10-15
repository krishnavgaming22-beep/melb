import { assetUrl } from "../../utils/assetUrl";
import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, Material } from "three";
import { useModel } from "../../components/three/ModelLoader";
import { journey, smooth } from "./journey";
export function Aircraft({ mobile }: { mobile: boolean }) {
  const gltf = useModel(
    mobile
      ? assetUrl("/assets/models/melb-aircraft-mobile.glb")
      : assetUrl("/assets/models/melb-aircraft.glb"),
  );
  const {scene,materials} = useMemo(() => {
    const scene=gltf.scene.clone(true);const materials: Material[]=[];
    scene.traverse(object=>{
      if (!(object instanceof Mesh)) return;
      const clone=(m:Material)=>{const copy=m.clone();copy.transparent=true;materials.push(copy);return copy;};
      object.material=Array.isArray(object.material)?object.material.map(clone):clone(object.material);
    });
    return {scene,materials};
  }, [gltf]);
  useFrame(()=>{
    const opacity=1-smooth(.605,.645,journey.rendered);
    materials.forEach(m=>{m.opacity=opacity;m.depthWrite=opacity>.95;});
  });
  useEffect(()=>()=>materials.forEach(m=>m.dispose()),[materials]);
  useEffect(() => {
    journey.ready = true;
    window.dispatchEvent(new Event("melb:scene-ready"));
    return () => {
      journey.ready = false;
    };
  }, []);
  return <primitive object={scene} dispose={null} />;
}
