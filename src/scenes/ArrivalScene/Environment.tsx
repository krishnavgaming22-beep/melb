import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { journey, smooth } from "./journey";
import { cityTransition } from "../CityScene/cityTransition";
import {
  Color,
  PMREMGenerator,
  Scene,
  HemisphereLight,
  Mesh,
  SphereGeometry,
  MeshBasicMaterial,
  BackSide,
  DirectionalLight,
} from "three";
/** Original neutral reflection environment, generated locally; no remote HDR dependency. */
export function Environment() {
  const { gl, scene } = useThree();
  const sun=useRef<DirectionalLight>(null),fill=useRef<DirectionalLight>(null),ambient=useRef<HemisphereLight>(null);
  useFrame(()=>{
    const city=smooth(.55,.68,journey.rendered),flat=cityTransition(journey.rendered).flatten;
    if(sun.current){sun.current.intensity=2.1-city*1.05;sun.current.castShadow=flat<.9;sun.current.shadow.intensity=1-flat;}
    if(fill.current)fill.current.intensity=1.2-city*.95;
    if(ambient.current)ambient.current.intensity=1.5-city*.8;
  });
  useEffect(() => {
    const sky = new Scene();
    sky.background = new Color("#b6c7ca");
    sky.add(new HemisphereLight("#f6f3e8", "#596a70", 2));
    const dome = new Mesh(
      new SphereGeometry(30, 24, 16),
      new MeshBasicMaterial({ color: "#d6e1e0", side: BackSide }),
    );
    sky.add(dome);
    const gen = new PMREMGenerator(gl);
    const target = gen.fromScene(sky, 0);
    scene.environment = target.texture;
    return () => {
      scene.environment = null;
      target.dispose();
      gen.dispose();
      dome.geometry.dispose();
      dome.material.dispose();
    };
  }, [gl, scene]);
  return (
    <>
      <hemisphereLight ref={ambient} args={["#edf4f3", "#53656c", 1.5]} />
      <directionalLight
        ref={sun}
        position={[-12, 25, 15]}
        color="#fff4df"
        intensity={2.1}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-32}
        shadow-camera-right={32}
        shadow-camera-top={32}
        shadow-camera-bottom={-32}
        shadow-camera-far={85}
        shadow-normalBias={0.007}
        shadow-radius={3}
        shadow-bias={-0.0002}
      />
      <directionalLight
        ref={fill}
        position={[8, 3, -10]}
        color="#a9c4d4"
        intensity={1.2}
      />
    </>
  );
}
