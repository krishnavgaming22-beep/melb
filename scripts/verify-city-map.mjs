import fs from 'node:fs';
import assert from 'node:assert/strict';
import {Vector3,PerspectiveCamera,Matrix4,Quaternion} from 'three';
import {NodeIO} from '../.photomesh-test/tooling/node_modules/@gltf-transform/core/dist/index.js';
import {ALL_EXTENSIONS} from '../.photomesh-test/tooling/node_modules/@gltf-transform/extensions/dist/index.js';
import {MeshoptDecoder} from '../.photomesh-test/tooling/node_modules/meshoptimizer/index.js';
import {cityTransition} from '../src/scenes/CityScene/cityTransition.ts';
import {mapView,panMap,zoomMap,resetMapView} from '../src/scenes/CityScene/mapView.ts';
const data=JSON.parse(fs.readFileSync('src/data/city-geography.json','utf8'));
await MeshoptDecoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
const started=performance.now();
const doc=await io.read('public/assets/models/melb-city-phase15.glb');
const decodeMs=performance.now()-started;
const nodes=doc.getRoot().listNodes();
for(const name of ['Ground_surface','Water_surface','Road_surface','Park_surface','Rail_surface'])assert(nodes.some(n=>n.getName()===name),name);
let triangles=0,geometryBytes=0,vertices=0,maxY=0;
const seen=new Set();
for(const node of nodes){
 const mass=node.getName().startsWith('Mass_'),t=node.getTranslation(),s=node.getScale(),q=new Quaternion(...node.getRotation());
 const base=new Matrix4().compose(new Vector3(...t),q,new Vector3(...s));
 const flat=new Matrix4().compose(new Vector3(t[0],mass?t[1]*.0002+.065:t[1],t[2]),q,new Vector3(s[0],mass?s[1]*.0002:s[1],s[2]));
 for(const primitive of node.getMesh()?.listPrimitives()??[]){
  const position=primitive.getAttribute('POSITION');triangles+=primitive.getIndices().getCount()/3;
  for(const accessor of [...primitive.listAttributes(),primitive.getIndices()])if(!seen.has(accessor)){seen.add(accessor);geometryBytes+=accessor.getArray().byteLength;}
  const value=[];
  for(let i=0;i<position.getCount();i++){
   position.getElement(i,value);assert(value.every(Number.isFinite));
   const original=new Vector3(...value).applyMatrix4(base),flattened=new Vector3(...value).applyMatrix4(flat);
   assert(Math.abs(original.x-flattened.x)<1e-9&&Math.abs(original.z-flattened.z)<1e-9,'Geographic drift during flatten');
   assert(original.y>=-.002&&original.y<4,'Unexpected geometry height');maxY=Math.max(maxY,original.y);vertices++;
   if(mass)assert(flattened.y>=.064&&flattened.y<.067,'Footprint layer collision');
  }
 }
}
assert(triangles<800000);
assert.equal(data.locations.length,12);
assert(data.locations.every(p=>p.enabled));
assert.equal(new Set(data.locations.map(p=>p.id)).size,12);
for(const place of data.locations){
 const p=data.projection,x=(place.lon-p.origin[0])*88000/120,z=-(place.lat-p.origin[1])*111000/120;
 assert(place.osmId&&Math.abs(x)<24&&Math.abs(z)<19);
 for(const aspect of [390/844,1440/900]){
  const camera=new PerspectiveCamera(28,aspect,.1,300);
  camera.position.set(0,Math.max(46,53/aspect)/(2*Math.tan(28*Math.PI/360)),0);
  camera.up.set(0,0,-1);camera.lookAt(0,0,0);camera.updateMatrixWorld();
  const pin=new Vector3(x,.09,z).project(camera);
  assert(Math.abs(pin.x)<.95&&Math.abs(pin.y)<.95,place.id+' clipped');
 }
}
for(const progress of [.67,.74,.78,.825,.86,.9025,.95,1]){
 const a=cityTransition(progress),b=cityTransition(progress);
 assert.deepEqual(a,b);assert(a.flatten>=0&&a.flatten<=1);
}
assert.equal(cityTransition(.74).flatten,0);assert.equal(cityTransition(.95).flatten,1);
panMap(1e6,-1e6);zoomMap(1e6);assert.equal(mapView.x,20);assert.equal(mapView.z,-17);assert.equal(mapView.zoom,3.5);
resetMapView();assert.equal(mapView.zoom,1);
const result={triangles,vertices,meshCount:nodes.length,decodedGeometryBytes:geometryBytes,maxHeightMetres:(maxY-.06)*120,nodeDecodeMs:Math.round(decodeMs),geographicDrift:0,landmarkCount:12,interactivePinCount:12,browserPerformance:'Not measured: localhost blocked by browser policy'};
fs.writeFileSync('docs/phase15/validation.json',JSON.stringify(result,null,2)+'\n');
console.log(result);
