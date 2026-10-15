"""Create isolated, textured GLB derivative; never writes into source folders.
Keeps every triangle. Rebases double precision coordinates before float conversion.
"""
import io,json, pathlib,struct,sys
import numpy as np
from PIL import Image
root=pathlib.Path(sys.argv[1]); out=pathlib.Path(sys.argv[2]); out.mkdir(parents=True,exist_ok=True)
audit=json.loads(pathlib.Path(sys.argv[3]).read_text())
origin=[(audit['bounds_xyz'][0][i]+audit['bounds_xyz'][1][i])/2 for i in range(2)]+[0.0]
cell=256; pad=2; side=4096; cols=side//(cell+2*pad); capacity=cols*cols
materials={}; name=None
for line in (root/(root.name+'.mtl')).read_text().splitlines():
 a=line.split(maxsplit=1)
 if not a: continue
 if a[0]=='newmtl': name=a[1]
 if a[0]=='map_Kd': materials[name]=a[1]
names=list(materials); slots={n:i for i,n in enumerate(names)}; pages=(len(names)+capacity-1)//capacity
positions=np.empty((audit['counts']['v'],3),dtype=np.float32); uvs=np.empty((audit['counts']['vt'],2),dtype=np.float32)
buffers=[io.BytesIO() for _ in range(pages)]; iv=it=0; current=None; uvmin=1e9; uvmax=-1e9; repaired_uvs=0
with (root/(root.name+'.obj')).open() as f:
 for line in f:
  a=line.split()
  if not a: continue
  if a[0]=='v':
   x,y,z=map(float,a[1:4]); positions[iv]=(x-origin[0],z,-(y-origin[1])); iv+=1
  elif a[0]=='vt':
   uv=list(map(float,a[1:3]))
   if not np.isfinite(uv).all(): uv=[.5,.5]; repaired_uvs+=1
   uvs[it]=uv; it+=1
  elif a[0]=='usemtl': current=slots[a[1]]
  elif a[0]=='f':
   page=current//capacity; slot=current%capacity; ox=(slot%cols)*(cell+2*pad)+pad; oy=(slot//cols)*(cell+2*pad)+pad
   values=[]
   for ref in a[1:]:
    vi,ti,*_=map(int,ref.split('/')); u,v=uvs[ti-1]; uvmin=min(uvmin,float(u),float(v)); uvmax=max(uvmax,float(u),float(v))
    values.extend((*positions[vi-1],(ox+float(u)*cell)/side,(oy+(1-float(v))*cell)/side))
   buffers[page].write(struct.pack('<15f',*values))
print('Geometry rebased; atlas UV range',uvmin,uvmax,flush=True)
doc={'asset':{'version':'2.0','generator':'MELB isolated photomesh inspection'},'extensionsUsed':['KHR_materials_unlit'],'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'mesh':0,'name':root.name,'extras':{'sourceOrigin':origin,'transform':'x=E-E0,y=height,z=-(N-N0)','sourceCRS':'Unconfirmed projected CRS; source metadata required'}}],'meshes':[{'primitives':[]}],'materials':[],'textures':[],'images':[],'samplers':[{'magFilter':9729,'minFilter':9987,'wrapS':33071,'wrapT':33071}],'bufferViews':[],'accessors':[],'buffers':[{'byteLength':0}]}
binary=bytearray()
def view(data,**kw):
 while len(binary)%4: binary.append(0)
 idx=len(doc['bufferViews']); doc['bufferViews'].append({'buffer':0,'byteOffset':len(binary),'byteLength':len(data),**kw}); binary.extend(data); return idx
for page in range(pages):
 raw=buffers[page].getvalue(); arr=np.frombuffer(raw,dtype='<f4').reshape(-1,5); bv=view(raw,byteStride=20,target=34962); acc=len(doc['accessors'])
 doc['accessors'].extend([{'bufferView':bv,'byteOffset':0,'componentType':5126,'count':len(arr),'type':'VEC3','min':arr[:,:3].min(axis=0).tolist(),'max':arr[:,:3].max(axis=0).tolist()},{'bufferView':bv,'byteOffset':12,'componentType':5126,'count':len(arr),'type':'VEC2'}])
 atlas=Image.new('RGB',(side,side))
 for slot,name in enumerate(names[page*capacity:(page+1)*capacity]):
  with Image.open(root/materials[name]) as im: tile=im.convert('RGB').resize((cell,cell),Image.Resampling.LANCZOS)
  tile=Image.fromarray(np.pad(np.asarray(tile),((pad,pad),(pad,pad),(0,0)),mode='edge'))
  atlas.paste(tile,((slot%cols)*(cell+2*pad),(slot//cols)*(cell+2*pad)))
 data=io.BytesIO(); atlas.save(data,format='JPEG',quality=90); imageview=view(data.getvalue())
 doc['images'].append({'bufferView':imageview,'mimeType':'image/jpeg'}); doc['textures'].append({'sampler':0,'source':page})
 doc['materials'].append({'name':f'photography-{page}','extensions':{'KHR_materials_unlit':{}},'pbrMetallicRoughness':{'baseColorTexture':{'index':page},'metallicFactor':0,'roughnessFactor':1},'alphaMode':'OPAQUE','doubleSided':True})
 doc['meshes'][0]['primitives'].append({'attributes':{'POSITION':acc,'TEXCOORD_0':acc+1},'material':page})
 print('Atlas',page+1,'/',pages,flush=True)
doc['buffers'][0]['byteLength']=len(binary)
while len(binary)%4: binary.append(0)
j=json.dumps(doc,separators=(',',':')).encode(); j+=b' '*((-len(j))%4)
target=out/(root.name+'.glb')
with target.open('wb') as f: f.write(struct.pack('<III',0x46546c67,2,28+len(j)+len(binary))); f.write(struct.pack('<II',len(j),0x4e4f534a)); f.write(j); f.write(struct.pack('<II',len(binary),0x004e4942)); f.write(binary)
(out/'conversion.json').write_text(json.dumps({'source':str(root),'sourceOrigin':origin,'triangleCount':audit['counts']['triangles'],'atlasCount':pages,'atlasSize':side,'textureCell':cell,'bytes':target.stat().st_size,'uvRange':[uvmin,uvmax],'repairedNonfiniteUVs':repaired_uvs,'geometryBytes':sum(b.tell() for b in buffers),'estimatedTextureMipBytes':pages*side*side*4*4/3,'note':'Opaque photographed surface: CloudCompare Tr=1 overridden in derivative. Nonfinite source UVs replaced with material texture centre (approximation). CRS datum unverified. Full geometry retained; textures downsampled for inspection.'},indent=2))
print('Wrote',target,target.stat().st_size,flush=True)
