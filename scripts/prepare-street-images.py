"""Create credited web derivatives. Never change the downloaded originals."""
from PIL import Image, ImageOps
import json,pathlib
sources=json.load(open('assets/streets/sources.json'))
ids=['flinders-aerial','flinders-frontage','flinders-corner','collins-street','collins-detail','collins-heritage','collins-tram']
manifest=[]
for id in ids:
 a=next(a for a in sources if a['id']==id)
 im=ImageOps.exif_transpose(Image.open(a['path'])).convert('RGB')
 variants={}
 for size in [960,1920,3200]:
  out=im.copy();out.thumbnail((size,size));p=f'public/assets/streets/{id}-{size}.webp';out.save(p,'WEBP',quality=88,method=6)
  variants[str(size)]={'src':p.replace('public','',1),'width':out.width,'height':out.height,'bytes':pathlib.Path(p).stat().st_size}
 manifest.append({k:a[k] for k in ['id','title','source','author','license','licenseUrl','description','date']}|{'variants':variants,'changes':'Resized and encoded as WebP. Displayed with restrained scroll-linked framing; source geometry unaltered.'})
pathlib.Path('src/scenes/CinematicStreets/images.json').write_text(json.dumps(manifest,indent=2))
pathlib.Path('public/assets/streets/ATTRIBUTION.json').write_text(json.dumps(manifest,indent=2))
print(sum(v['bytes'] for a in manifest for v in a['variants'].values()),'bytes across all variants')
