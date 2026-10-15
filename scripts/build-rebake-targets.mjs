import fs from 'node:fs/promises';
import {Document,NodeIO} from '../.photomesh-test/tooling/node_modules/@gltf-transform/core/dist/index.js';
import {ALL_EXTENSIONS} from '../.photomesh-test/tooling/node_modules/@gltf-transform/extensions/dist/index.js';
import {compactPrimitive} from '../.photomesh-test/tooling/node_modules/@gltf-transform/functions/dist/index.js';
import {MeshoptSimplifier} from '../.photomesh-test/tooling/node_modules/meshoptimizer/index.js';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);const source=await io.read('.photomesh-test/C4-22.glb');
const arrays=source.getRoot().listMeshes().flatMap(m=>m.listPrimitives().map(p=>p.getAttribute('POSITION').getArray()));
const positions=new Float32Array(arrays.reduce((n,a)=>n+a.length,0));let offset=0;for(const a of arrays){positions.set(a,offset);offset+=a.length;}
await MeshoptSimplifier.ready;const remap=MeshoptSimplifier.generatePositionRemap(positions,3);
for(const [name,target,error] of [['medium',220000,.0015],['far',70000,.004]]){
 const [indices,achieved]=MeshoptSimplifier.simplify(remap,positions,3,target*3,error,['LockBorder','PreserveFolds','RegularizeLight','Sparse']);
 const doc=new Document();const buffer=doc.createBuffer();const p=doc.createPrimitive().setAttribute('POSITION',doc.createAccessor().setType('VEC3').setArray(positions).setBuffer(buffer)).setIndices(doc.createAccessor().setType('SCALAR').setArray(indices).setBuffer(buffer));
 compactPrimitive(p);doc.createScene().addChild(doc.createNode(name).setMesh(doc.createMesh().addPrimitive(p)));
 await io.write(`.photomesh-test/lods/${name}-rebake-target.glb`,doc);
 console.log(name,'triangles',indices.length/3,'error',achieved);
}
