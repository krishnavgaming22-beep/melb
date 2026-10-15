import { assetUrl } from "../../utils/assetUrl";
import {useEffect,useMemo,useRef} from "react";
import {useFrame,useThree} from "@react-three/fiber";
import {Group,Mesh,MeshBasicMaterial,Vector3} from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import {KTX2Loader} from "three/examples/jsm/loaders/KTX2Loader.js";
import {MeshoptDecoder} from "three/examples/jsm/libs/meshopt_decoder.module.js";
import {journey,MELBOURNE,smooth} from "../ArrivalScene/journey";

type Level="high"|"medium"|"far";
/** One resident tile plus one replacement in flight; no global asset cache.
 * Source-derived 3D LODs preserve real dimensions and photographic colour.
 * This component is the partial-coverage integration proof, not the final city.
 */
export function PhotomeshCity(){
 const group=useRef<Group>(null);const gl=useThree(s=>s.gl);
 const state=useMemo(()=>({generation:0,alive:true,pending:false,level:null as Level|null,wanted:"far" as Level,scene:null as Group|null,materials:[] as MeshBasicMaterial[],target:new Vector3(MELBOURNE.x,-3.94,MELBOURNE.z),error:false}),[]);
 const load=useRef<((level:Level)=>void)|null>(null);
 useEffect(()=>{
  state.alive=true;
  const generation=++state.generation;state.pending=false;state.error=false;
  const ktx=new KTX2Loader().setTranscoderPath(assetUrl('/decoders/basis/')).setWorkerLimit(2).detectSupport(gl);
  const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).setKTX2Loader(ktx);
  const dispose=(scene:Group)=>{const materials=new Set<MeshBasicMaterial>();scene.traverse(o=>{if(o instanceof Mesh){o.geometry.dispose();for(const m of(Array.isArray(o.material)?o.material:[o.material]))materials.add(m)}});materials.forEach(m=>{m.map?.dispose();m.dispose()})};
  load.current=(level)=>{
   if(state.pending||state.error)return;state.pending=true;
   loader.load(assetUrl(`/assets/photomesh/C4-22/${level}.glb`),gltf=>{
    if(!state.alive||generation!==state.generation){dispose(gltf.scene);return;}
    state.pending=false;
    const previous=state.scene;state.scene=gltf.scene;state.level=level;state.materials=[];
    gltf.scene.traverse(o=>{if(o instanceof Mesh){o.frustumCulled=true;for(const m of(Array.isArray(o.material)?o.material:[o.material])){
      m.transparent=true;m.depthWrite=false;m.fog=true;
      m.onBeforeCompile=(shader:Parameters<MeshBasicMaterial['onBeforeCompile']>[0])=>{
       shader.vertexShader='varying vec3 vTileWorld;\n'+shader.vertexShader;
       shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvTileWorld=(modelMatrix*vec4(transformed,1.0)).xyz;');
       shader.fragmentShader='varying vec3 vTileWorld;\n'+shader.fragmentShader;
       shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`float edgeDistance=min(140.5-abs((vTileWorld.x-${MELBOURNE.x.toFixed(8)})*120.0),140.5-abs((vTileWorld.z-${MELBOURNE.z.toFixed(8)})*120.0));\ndiffuseColor.a*=smoothstep(0.0,12.0,edgeDistance);\n#include <opaque_fragment>`);
      };
      state.materials.push(m);
    }}});
    group.current?.add(gltf.scene);if(previous){group.current?.remove(previous);dispose(previous);}
   },undefined,error=>{if(generation!==state.generation)return;state.pending=false;if(state.alive){state.error=true;console.error('Photomesh preview load failed',error)}});
  };
  load.current('far');
  return()=>{state.alive=false;load.current=null;ktx.dispose();if(state.scene){group.current?.remove(state.scene);dispose(state.scene);state.scene=null;}state.level=null;state.materials=[];};
 },[gl,state]);
 useFrame(({camera,size})=>{
  const p=journey.rendered;const distance=camera.position.distanceTo(state.target);
  const pixels=(281/120)*size.height/(2*Math.tan(42*Math.PI/360)*distance);
  const farAllowed=pixels<(state.level==='far'?470:400);
  const near=state.level==='high'?pixels>650:pixels>780;
  const mobile=size.width<700||journey.lowPower;
  state.wanted=p<.51?'far':farAllowed?'far':near&&!mobile?'high':'medium';
  if(state.wanted!==state.level&&!state.pending&&!state.error)load.current?.(state.wanted);
  if(group.current)group.current.visible=p>.555;
  const opacity=smooth(.565,.66,p);
  state.materials.forEach(m=>{m.opacity=opacity;m.depthWrite=opacity>.98;});
 });
 return <group ref={group} position={[MELBOURNE.x,-3.94,MELBOURNE.z]} scale={1/120}/>;
}
