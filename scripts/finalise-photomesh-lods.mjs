import fs from 'node:fs/promises';
import {NodeIO} from '../.photomesh-test/tooling/node_modules/@gltf-transform/core/dist/index.js';
import {ALL_EXTENSIONS,KHRMaterialsUnlit} from '../.photomesh-test/tooling/node_modules/@gltf-transform/extensions/dist/index.js';
import {meshopt,prune,weld,getBounds} from '../.photomesh-test/tooling/node_modules/@gltf-transform/functions/dist/index.js';
import {MeshoptEncoder} from '../.photomesh-test/tooling/node_modules/meshoptimizer/index.js';
await MeshoptEncoder.ready;const dir='.photomesh-test/lods';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder});
if(!await fs.stat(`${dir}/nadir-ktx2.glb`).catch(()=>null))for(const suffix of ['.glb','-ktx2.glb','-inspection.glb','.json'])await fs.copyFile(`${dir}/far${suffix}`,`${dir}/nadir${suffix}`);
for(const name of ['medium','far']){
 const doc=await io.read(`${dir}/${name}-rebaked.glb`);const root=doc.getRoot();const unlit=doc.createExtension(KHRMaterialsUnlit);
 for(const m of root.listMaterials()){
  const texture=m.getEmissiveTexture()||m.getBaseColorTexture();
  m.setBaseColorTexture(texture).setBaseColorFactor([1,1,1,1]).setEmissiveTexture(null).setEmissiveFactor([0,0,0]).setMetallicFactor(0).setRoughnessFactor(1).setDoubleSided(true).setExtension('KHR_materials_unlit',unlit.createUnlit());
 }
 let triangles=0;for(const m of root.listMeshes())for(const p of m.listPrimitives()){p.setAttribute('NORMAL',null);p.setAttribute('TANGENT',null);triangles+=p.getIndices().getCount()/3;}
 root.listNodes()[0].setExtras({sourceOrigin:[320877.49072265625,5812809.471992493,0],projection:'MGA55 horizontal datum unresolved',verticalDatum:'AHD',method:'Photography rebaked from full source geometry'});
 await doc.transform(weld(),prune());
 for(const [i,t] of root.listTextures().entries())await fs.writeFile(`${dir}/${name}-textures/${i}.png`,t.getImage());
 const bounds=getBounds(root.listScenes()[0]);await io.write(`${dir}/${name}-inspection.glb`,doc);
 await doc.transform(meshopt({encoder:MeshoptEncoder,level:'high',quantizePosition:16,quantizeTexcoord:16}),prune());await io.write(`${dir}/${name}.glb`,doc);
 let geometryBytes=0;for(const a of root.listAccessors())geometryBytes+=a.getArray().byteLength;
 const size=name==='medium'?4096:2048;
 const stats={name,method:'Source geometry simplification and UV photography rebake',triangles,texture:size,atlasCount:1,drawCalls:1,bytes:(await fs.stat(`${dir}/${name}.glb`)).size,decodedGeometryBytes:geometryBytes,rgbaTextureMipBytes:Math.round(size**2*4*4/3),expectedKtxBC1MipBytes:Math.round(size**2*.5*4/3),expectedKtxASTC4x4MipBytes:Math.round(size**2*4/3),bounds,nearNadirOnly:false};
 await fs.writeFile(`${dir}/${name}.json`,JSON.stringify(stats,null,2));console.log(stats);
}
