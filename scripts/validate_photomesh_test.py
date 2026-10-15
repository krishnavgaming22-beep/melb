import hashlib,io,json,pathlib,struct
import numpy as np
from PIL import Image
root=pathlib.Path(__file__).resolve().parents[1]
p=root/'.photomesh-test/C4-22.glb';data=p.read_bytes()
magic,version,length=struct.unpack_from('<III',data); assert magic==0x46546c67 and version==2 and length==len(data)
jl,jt=struct.unpack_from('<II',data,12);doc=json.loads(data[20:20+jl]);bl,bt=struct.unpack_from('<II',data,20+jl);binary=memoryview(data)[28+jl:]
assert len(binary)==bl and jt==0x4e4f534a and bt==0x004e4942
triangles=0;lo=np.full(3,np.inf);hi=-lo;uvok=True
for prim in doc['meshes'][0]['primitives']:
 a=doc['accessors'][prim['attributes']['POSITION']];v=doc['bufferViews'][a['bufferView']]
 arr=np.frombuffer(binary[v['byteOffset']:v['byteOffset']+v['byteLength']],dtype='<f4').reshape(-1,5)
 assert np.isfinite(arr).all();triangles+=len(arr)//3;lo=np.minimum(lo,arr[:,:3].min(axis=0));hi=np.maximum(hi,arr[:,:3].max(axis=0));uvok &= bool(((arr[:,3:]>=0)&(arr[:,3:]<=1)).all())
for im in doc['images']:
 v=doc['bufferViews'][im['bufferView']]
 with Image.open(io.BytesIO(binary[v['byteOffset']:v['byteOffset']+v['byteLength']])) as pic:pic.load();assert pic.size==(4096,4096)
unchanged={}
for tile in ['C4-22','C5-34']:
 manifest=json.loads((root/f'docs/phase21-review/photomesh/{tile}-source-manifest.json').read_text());changed=[]
 for name,expected in manifest.items():
  path=pathlib.Path('/Users/krishnavsewak/Downloads')/tile/name;h=hashlib.sha256()
  with path.open('rb') as f:
   for block in iter(lambda:f.read(1024*1024),b''):h.update(block)
  if h.hexdigest()!=expected['sha256']:changed.append(name)
 unchanged[tile]={'files_checked':len(manifest),'changed':changed}
audit=json.loads((root/'docs/phase21-review/photomesh/C4-22-audit.json').read_text());assert triangles==audit['counts']['triangles'] and uvok
origin=doc['nodes'][0]['extras']['sourceOrigin'];expected_lo=[audit['bounds_xyz'][0][0]-origin[0],audit['bounds_xyz'][0][2],-(audit['bounds_xyz'][1][1]-origin[1])];expected_hi=[audit['bounds_xyz'][1][0]-origin[0],audit['bounds_xyz'][1][2],-(audit['bounds_xyz'][0][1]-origin[1])]
result={'triangles':triangles,'atlas_images_decoded':len(doc['images']),'finite_positions':True,'uvs_in_range':uvok,'bounds_local':[lo.tolist(),hi.tolist()],'bounds_roundtrip_max_error_source_units':float(max(np.max(np.abs(lo-expected_lo)),np.max(np.abs(hi-expected_hi)))),'sources':unchanged,'browser_validation':'Blocked by saved browser policy; not claimed tested','blender_validation':'GLB imported and three textured views rendered successfully'}
(root/'docs/phase21-review/photomesh/validation.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
