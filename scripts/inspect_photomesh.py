"""Read-only source audit. Writes reports only to the supplied output directory."""
import collections, hashlib, json, math, pathlib, sys
from PIL import Image

out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
for folder in sys.argv[2:]:
    root = pathlib.Path(folder); counts = collections.Counter(); bounds = [[math.inf]*3, [-math.inf]*3]
    material_faces = collections.Counter(); current = None; used = set(); mtllib = []
    obj = root / (root.name + '.obj'); mtl = root / (root.name + '.mtl')
    hashes = {}
    for p in sorted(root.iterdir()):
        if p.is_file():
            h = hashlib.sha256()
            with p.open('rb') as f:
                for chunk in iter(lambda: f.read(1024*1024), b''): h.update(chunk)
            hashes[p.name] = {'sha256': h.hexdigest(), 'bytes': p.stat().st_size}
    with obj.open() as f:
        for line in f:
            a = line.split()
            if not a: continue
            key = a[0]
            if key in ('v','vt','vn','f'): counts[key] += 1
            if key in ('v','vt','vn') and not all(math.isfinite(float(v)) for v in a[1:]): counts['nonfinite_'+key] += 1
            if key == 'v':
                for i, v in enumerate(map(float,a[1:4])):
                    bounds[0][i] = min(bounds[0][i],v); bounds[1][i] = max(bounds[1][i],v)
            elif key == 'f':
                counts['triangles'] += len(a)-3; material_faces[current] += len(a)-3
                if len(a)!=4: counts['non_triangular_faces'] += 1
                for ref in a[1:]:
                    for i, v in enumerate(ref.split('/')):
                        if v and (int(v)==0 or int(v)>counts[['v','vt','vn'][i]]): counts['invalid_indices'] += 1
            elif key == 'usemtl': current = a[1]; used.add(current)
            elif key == 'mtllib': mtllib.append(' '.join(a[1:]))
    materials = {}; current = None
    for line in mtl.read_text().splitlines():
        a=line.split(maxsplit=1)
        if not a: continue
        if a[0]=='newmtl': current=a[1]; materials[current]={}
        elif current and len(a)==2: materials[current][a[0]]=a[1]
    dimensions=collections.Counter(); bad=[]; pixels=0; textures=[]
    for p in sorted(root.glob('*.jpg')):
        try:
            with Image.open(p) as im:
                im.load(); dimensions[f'{im.width}x{im.height}']+=1; pixels+=im.width*im.height
                textures.append({'file':p.name,'width':im.width,'height':im.height})
        except Exception as e: bad.append([p.name,str(e)])
    missing=[m['map_Kd'] for m in materials.values() if 'map_Kd' in m and not (root/m['map_Kd']).is_file()]
    report={'tile':root.name,'counts':dict(counts),'bounds_xyz':bounds,'extent_xyz':[bounds[1][i]-bounds[0][i] for i in range(3)],'mtllib':mtllib,'materials':len(materials),'used_materials':len(used),'undefined_materials':sorted(used-set(materials)),'missing_textures':missing,'bad_textures':bad,'texture_count':len(textures),'texture_dimensions':dict(dimensions),'texture_pixels':pixels,'texture_rgba_bytes':pixels*4,'texture_rgba_mip_bytes_estimate':round(pixels*4*4/3),'geometry_unindexed_position_normal_uv_bytes':counts['triangles']*3*32,'source_bytes':sum(x['bytes'] for x in hashes.values()),'obj_bytes':obj.stat().st_size,'jpg_bytes':sum(v['bytes'] for k,v in hashes.items() if k.endswith('.jpg')),'material_properties_example':next(iter(materials.values()))}
    (out/(root.name+'-audit.json')).write_text(json.dumps(report,indent=2))
    (out/(root.name+'-source-manifest.json')).write_text(json.dumps(hashes,indent=2))
    (out/(root.name+'-textures.json')).write_text(json.dumps(textures))
    print(json.dumps(report),flush=True)
