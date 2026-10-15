// Reproducible proof pipeline. All writes stay in .photomesh-test/lods.
import {NodeIO} from '../.photomesh-test/tooling/node_modules/@gltf-transform/core/dist/index.js';
import {ALL_EXTENSIONS} from '../.photomesh-test/tooling/node_modules/@gltf-transform/extensions/dist/index.js';
import {weld,compactPrimitive,prune,meshopt} from '../.photomesh-test/tooling/node_modules/@gltf-transform/functions/dist/index.js';
import {MeshoptEncoder,MeshoptDecoder,MeshoptSimplifier} from '../.photomesh-test/tooling/node_modules/meshoptimizer/index.js';
import {createRequire} from 'node:module';
const require=createRequire(new URL('../.photomesh-test/tooling/package.json',import.meta.url));
const sharp=require('sharp');
import fs from 'node:fs/promises';
const out='.photomesh-test/lods'; await fs.mkdir(out,{recursive:true});
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready,MeshoptSimplifier.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const configs=[{name:'high',ratio:.22,error:.0005,texture:2048},{name:'medium',ratio:.07,error:.0015,texture:1024},{name:'far',ratio:.015,error:.005,texture:512}];
for(const config of configs){
 const start=performance.now(); console.log('START',config.name);
 const doc=await io.read('.photomesh-test/C4-22.glb');
 await doc.transform(weld());
 const errors=[];
 for(const mesh of doc.getRoot().listMeshes())for(const p of mesh.listPrimitives()){
  const pos=p.getAttribute('POSITION').getArray();const uv=p.getAttribute('TEXCOORD_0').getArray();
  const indices=new Uint32Array(p.getIndices().getArray());const locks=new Uint8Array(pos.length/3);
  for(let i=0;i<locks.length;i++)if(Math.abs(Math.abs(pos[i*3])-140.5)<.03||Math.abs(Math.abs(pos[i*3+2])-140.5)<.03)locks[i]=1;
  const [result,error]=MeshoptSimplifier.simplifyWithAttributes(indices,pos,3,uv,2,[1,1],locks,Math.floor(indices.length*config.ratio/3)*3,config.error,['PreserveFolds','RegularizeLight']);
  errors.push(error);p.getIndices().setArray(result);compactPrimitive(p);
 }
 await doc.transform(prune());
 // One spatially bounded node per existing atlas strip, enabling ordinary frustum culling.
 const root=doc.getRoot();const parent=root.listNodes()[0];const mesh=parent.getMesh();
 for(const [i,p] of mesh.listPrimitives().entries()){
  const chunk=doc.createMesh(`atlas-strip-${i}`).addPrimitive(p);
  parent.addChild(doc.createNode(`chunk-${i}`).setMesh(chunk));
 }
 parent.setMesh(null);mesh.dispose();
 let triangles=0,geometryBytes=0;
 for(const m of root.listMeshes())for(const p of m.listPrimitives())triangles+=p.getIndices().getCount()/3;
 for(const a of root.listAccessors())geometryBytes+=a.getArray().byteLength;
 let texturePixels=0;
 for(const [i,t] of root.listTextures().entries()){
  const bytes=await sharp(t.getImage()).resize(config.texture,config.texture).jpeg({quality:90}).toBuffer();
  t.setImage(bytes).setMimeType('image/jpeg');texturePixels+=config.texture**2;
  await fs.mkdir(`${out}/${config.name}-textures`,{recursive:true});
  await fs.writeFile(`${out}/${config.name}-textures/${i}.jpg`,bytes);
 }
 // Uncompressed geometry companion supports Blender quality inspection.
 await io.write(`${out}/${config.name}-inspection.glb`,doc);
 await doc.transform(meshopt({encoder:MeshoptEncoder,level:'high',quantizePosition:16,quantizeTexcoord:16}),prune());
 await io.write(`${out}/${config.name}.glb`,doc);
 const decoded=await io.read(`${out}/${config.name}.glb`);
 let gpuGeometry=0;for(const a of decoded.getRoot().listAccessors())gpuGeometry+=a.getArray().byteLength;
 const stats={...config,triangles,bytes:(await fs.stat(`${out}/${config.name}.glb`)).size,geometryBytesBeforeQuantization:geometryBytes,decodedGeometryBytes:gpuGeometry,drawCalls:root.listMeshes().length,atlasCount:root.listTextures().length,rgbaTextureMipBytes:Math.round(texturePixels*4*4/3),expectedKtxBC1MipBytes:Math.round(texturePixels*.5*4/3),expectedKtxASTC4x4MipBytes:Math.round(texturePixels*4/3),buildSeconds:(performance.now()-start)/1000};
 stats.simplifierErrors=errors;
 await fs.writeFile(`${out}/${config.name}.json`,JSON.stringify(stats,null,2));console.log(JSON.stringify(stats));
}
