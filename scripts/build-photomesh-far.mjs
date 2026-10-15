import fs from 'node:fs/promises';
import {Document,NodeIO} from '../.photomesh-test/tooling/node_modules/@gltf-transform/core/dist/index.js';
import {ALL_EXTENSIONS,KHRMaterialsUnlit} from '../.photomesh-test/tooling/node_modules/@gltf-transform/extensions/dist/index.js';
import {meshopt} from '../.photomesh-test/tooling/node_modules/@gltf-transform/functions/dist/index.js';
import {MeshoptEncoder} from '../.photomesh-test/tooling/node_modules/meshoptimizer/index.js';
const dir='.photomesh-test/lods';const h=JSON.parse(await fs.readFile(`${dir}/far-heights.json`));
const doc=new Document();const buffer=doc.createBuffer();const positions=[],uv=[],indices=[];const n=h.steps;
for(let row=0;row<=n;row++)for(let col=0;col<=n;col++){positions.push(-140.5+281*col/n,h.heights[row*(n+1)+col],-140.5+281*row/n);uv.push(col/n,row/n)}
for(let row=0;row<n;row++)for(let col=0;col<n;col++){
 const a=row*(n+1)+col,b=a+1,c=a+n+1,d=c+1;
 for(const tri of [[a,c,b],[b,c,d]])if(tri.every(i=>h.valid[i]))indices.push(...tri);
}
const pos=doc.createAccessor().setType('VEC3').setArray(new Float32Array(positions)).setBuffer(buffer);
const tex=doc.createAccessor().setType('VEC2').setArray(new Float32Array(uv)).setBuffer(buffer);
const idx=doc.createAccessor().setType('SCALAR').setArray(new Uint16Array(indices)).setBuffer(buffer);
const photo=doc.createTexture().setImage(await fs.readFile(`${dir}/far-orthophoto.png`)).setMimeType('image/png');
const material=doc.createMaterial().setBaseColorTexture(photo).setAlphaMode('MASK').setAlphaCutoff(.5).setDoubleSided(true).setExtension('KHR_materials_unlit',doc.createExtension(KHRMaterialsUnlit).createUnlit());
const primitive=doc.createPrimitive().setAttribute('POSITION',pos).setAttribute('TEXCOORD_0',tex).setIndices(idx).setMaterial(material);
const node=doc.createNode('C4-22-source-derived-nadir').setMesh(doc.createMesh().addPrimitive(primitive)).setExtras({sourceOrigin:[320877.49072265625,5812809.471992493,0],projection:'MGA55 horizontal datum unresolved',verticalDatum:'AHD',onlyNearNadir:true});
doc.createScene().addChild(node);await MeshoptEncoder.ready;const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder});
await io.write(`${dir}/far-inspection.glb`,doc);
await doc.transform(meshopt({encoder:MeshoptEncoder,level:'high',quantizePosition:16,quantizeTexcoord:16}));await io.write(`${dir}/far.glb`,doc);
await fs.mkdir(`${dir}/far-textures`,{recursive:true});await fs.copyFile(`${dir}/far-orthophoto.png`,`${dir}/far-textures/0.png`);
let geom=0;for(const a of doc.getRoot().listAccessors())geom+=a.getArray().byteLength;
const stats={name:'far',method:h.method,onlyNearNadir:true,texture:2048,triangles:indices.length/3,bytes:(await fs.stat(`${dir}/far.glb`)).size,decodedGeometryBytes:geom,drawCalls:1,atlasCount:1,rgbaTextureMipBytes:Math.round(2048**2*4*4/3),expectedKtxBC1MipBytes:Math.round(2048**2*4/3),expectedKtxASTC4x4MipBytes:Math.round(2048**2*4/3),note:'RGBA requires BC3/ETC2 RGBA or equivalent; BC1 estimate field uses 8 bpp here. Source-derived 2.5D; disallowed for oblique/near views.'};
await fs.writeFile(`${dir}/far.json`,JSON.stringify(stats,null,2));console.log(stats);
