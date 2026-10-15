import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
const scene=new THREE.Scene(); scene.background=new THREE.Color('#e9e7e1');
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)); renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.NoToneMapping;
document.body.prepend(renderer.domElement);
const camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,0.5,3000);
const controls=new OrbitControls(camera,renderer.domElement); controls.target.set(0,25,0); controls.maxDistance=1000; controls.minDistance=15; controls.maxPolarAngle=Math.PI*.49;
function render(){renderer.render(scene,camera)}
controls.addEventListener('change',render);
function view(p,target=[0,25,0]){camera.position.set(...p);controls.target.set(...target);controls.update();render()}
view([310,260,330]);
document.querySelector('#oblique').onclick=()=>view([310,260,330]);
document.querySelector('#overhead').onclick=()=>view([0,480,0.1],[0,0,0]);
document.querySelector('#detail').onclick=()=>view([130,105,130],[0,30,0]);
const status=document.querySelector('#status');
new GLTFLoader().load('/.photomesh-test/C4-22.glb',g=>{
 scene.add(g.scene); render();
 status.textContent=`Loaded · ${renderer.info.render.triangles.toLocaleString()} triangles · ${renderer.info.render.calls} draw calls`;
 window.photomeshInspection={loaded:true,triangles:renderer.info.render.triangles,drawCalls:renderer.info.render.calls,bounds:new THREE.Box3().setFromObject(g.scene),sourceTransform:g.scene.children[0]?.userData};
},p=>{status.textContent=`Loading ${p.total?Math.round(100*p.loaded/p.total)+'%':(p.loaded/1e6).toFixed(1)+' MB'}…`},err=>{status.textContent='Load failed: '+err.message;console.error(err)});
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);render()});
window.addEventListener('pagehide',()=>{controls.dispose();scene.traverse(o=>{o.geometry?.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];for(const m of ms){m?.map?.dispose();m?.dispose()}});renderer.dispose()},{once:true});
