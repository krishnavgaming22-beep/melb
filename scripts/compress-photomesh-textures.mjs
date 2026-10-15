import fs from 'node:fs/promises';
import {promisify} from 'node:util';
import {execFile} from 'node:child_process';
import {NodeIO} from '../.photomesh-test/tooling/node_modules/@gltf-transform/core/dist/index.js';
import {ALL_EXTENSIONS,KHRTextureBasisu} from '../.photomesh-test/tooling/node_modules/@gltf-transform/extensions/dist/index.js';
import {MeshoptEncoder,MeshoptDecoder} from '../.photomesh-test/tooling/node_modules/meshoptimizer/index.js';
const run=promisify(execFile);await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
for(const name of (process.argv.slice(2).length?process.argv.slice(2):['high','medium','far'])){
 const dir=`.photomesh-test/lods/${name}-textures`;const doc=await io.read(`.photomesh-test/lods/${name}.glb`);
 doc.createExtension(KHRTextureBasisu).setRequired(true);
 for(const [i,t] of doc.getRoot().listTextures().entries()){
  const output=`${dir}/${i}.ktx2`;
  const input=`${dir}/${i}.${t.getMimeType()==='image/png'?'png':'jpg'}`;
  await run('.photomesh-test/basis-source/bin/basisu',['-ktx2','-q',name==='high'?'255':'200','-comp_level','1','-mipmap','-max_threads','2','-file',input,'-output_file',output],{maxBuffer:2e6});
  t.setImage(await fs.readFile(output)).setMimeType('image/ktx2');console.log(name,i+1);
 }
 const path=`.photomesh-test/lods/${name}-ktx2.glb`;await io.write(path,doc);
 const stats=JSON.parse(await fs.readFile(`.photomesh-test/lods/${name}.json`));stats.ktx2Bytes=(await fs.stat(path)).size;stats.textureCodec='ETC1S / KTX2, full mip chain';
 await fs.writeFile(`.photomesh-test/lods/${name}.json`,JSON.stringify(stats,null,2));console.log('DONE',name,stats.ktx2Bytes);
}
