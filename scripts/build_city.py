"""Original editorial city massing. Geographic base can be replaced independently.
Blender axes: X east, Y north, Z up. 1 unit = 120 metres.
Buildings are suggestive massing, not surveyed building footprints.
"""
import bpy, math, random, os, json
from mathutils import Vector
OUT='/Users/krishnavsewak/Documents/ChatGPT/MELB'
random.seed(91)
geography=json.load(open(OUT+'/src/data/city-geography.json'))
projection=geography['projection']
locations={p['id']:p['coordinates'] for p in geography['locations']}
scene=bpy.data.scenes.new('MELB City Workshop');bpy.context.window.scene=scene
categories={}
def mat(name,c):
 m=bpy.data.materials.new(name);m.diffuse_color=(*c,1);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*c,1);p.inputs['Roughness'].default_value=.88
 return m
materials={
 'Ground':mat('Warm paper',(.71,.70,.64)),
 'Roads':mat('Street ivory',(.91,.89,.81)),
 'River':mat('Birrarung blue',(.27,.43,.46)),
 'Parks':mat('Eucalyptus parkland',(.39,.49,.37)),
 'Paths':mat('Garden paths',(.63,.64,.48)),
 'Rail':mat('Rail corridor',(.48,.49,.44)),
 'MassIvory':mat('Limestone',(.79,.77,.67)),
 'MassStone':mat('Sandstone',(.65,.64,.55)),
 'MassGlass':mat('Muted glass',(.36,.47,.45)),
 'MassLandmarks':mat('Landmark brass',(.58,.40,.25)),
 'MassTrees':mat('Tree canopy',(.30,.42,.32)),
}
def geo(lon,lat):return ((lon-projection['origin'][0])*projection['metresPerLongitudeDegree']/projection['metresPerUnit'],(lat-projection['origin'][1])*projection['metresPerLatitudeDegree']/projection['metresPerUnit'])
def mesh(name,verts,faces):
 vs,fs=categories.setdefault(name,([],[]));n=len(vs);vs.extend(verts);fs.extend([tuple(i+n for i in f) for f in faces])
def poly(name,pts,h):mesh(name,[(x,y,h) for x,y in pts],[tuple(range(len(pts)))])
def box(name,x,y,w,d,h,angle=0,z=.035):
 c,s=math.cos(angle),math.sin(angle);v=[]
 for zz in [z,z+h]:
  for xx,yy in [(-w/2,-d/2),(w/2,-d/2),(w/2,d/2),(-w/2,d/2)]:v.append((x+xx*c-yy*s,y+xx*s+yy*c,zz))
 mesh(name,v,[(0,3,2,1),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7),(4,5,6,7)])
def line(name,pts,width,h=.04):
 # Joined ribbon keeps all bends watertight and avoids coplanar overlap.
 if len(pts)<2:return
 v=[]
 for i,(x,y) in enumerate(pts):
  prev=pts[max(0,i-1)];nxt=pts[min(len(pts)-1,i+1)]
  dx=nxt[0]-prev[0];dy=nxt[1]-prev[1];l=max(.0001,math.hypot(dx,dy))
  nx=-dy/l*width/2;ny=dx/l*width/2
  v.extend([(x+nx,y+ny,h),(x-nx,y-ny,h)])
 mesh(name,v,[(i*2,i*2+1,i*2+3,i*2+2) for i in range(len(pts)-1)])
def soften(pts,steps=2,closed=False):
 for _ in range(steps):
  out=[] if closed else [pts[0]]
  for a,b in zip(pts,pts[1:]+([pts[0]] if closed else [])):
   out.extend([(.75*a[0]+.25*b[0],.75*a[1]+.25*b[1]),(.25*a[0]+.75*b[0],.25*a[1]+.75*b[1])])
  if not closed:out.append(pts[-1])
  pts=out
 return pts
def ellipse(name,x,y,rx,ry,h=.04,n=48):poly(name,[(x+rx*math.cos(i/n*math.tau),y+ry*math.sin(i/n*math.tau)) for i in range(n)],h)
def tree(x,y):
 # Single faceted octahedron canopy, no invisible trunks.
 r=random.uniform(.13,.22);z=.2
 mesh('MassTrees',[(x-r,y,z),(x,y-r,z),(x+r,y,z),(x,y+r,z),(x,y,z+r*2),(x,y,.04)],[(0,1,4),(1,2,4),(2,3,4),(3,0,4),(1,0,5),(2,1,5),(3,2,5),(0,3,5)])
# Carefully bounded floating city plate.
outline=[(-21,-13),(-20,-15),(16,-15),(20,-11),(20,15),(17,18),(-18,18),(-21,14)]
poly('Ground',outline,0)
# Curated river centreline fallback. Replaced by official clipped hydro geometry when supplied.
river=[(144.941,-37.819),(144.947,-37.822),(144.951,-37.825),(144.956,-37.8238),(144.960,-37.8208),(144.965,-37.820),(144.969,-37.8205),(144.974,-37.8215),(144.978,-37.8238),(144.982,-37.8265),(144.986,-37.8275),(144.990,-37.826),(144.9908,-37.822),(144.992,-37.818),(144.997,-37.815)]
basepath=OUT+'/assets/geography/city-base.json'
base=json.load(open(basepath)) if os.path.exists(basepath) else None
if base:
 for ring in base.get('water',[]):poly('River',[geo(*p) for p in ring],.025)
else:line('River',soften([geo(*p) for p in river],3),.65,.028)
# Large connected park silhouettes; deliberate simplification of boundaries.
parks=[
 [(144.975,-37.816),(144.980,-37.815),(144.989,-37.816),(144.989,-37.822),(144.985,-37.824),(144.978,-37.822)],
 [(144.973,-37.8245),(144.979,-37.825),(144.986,-37.828),(144.987,-37.833),(144.981,-37.835),(144.974,-37.8335),(144.970,-37.829)],
 [(144.976,-37.807),(144.984,-37.807),(144.984,-37.814),(144.978,-37.814)],
 [(144.967,-37.804),(144.973,-37.804),(144.973,-37.807),(144.968,-37.808)],
]
for coords in parks:poly('Parks',soften([geo(*p) for p in coords],1,True),.026)
# Hoddle grid, angled in geographic space; broad city massing within blocks.
angle=math.radians(24);cx,cy=geo(144.963,-37.8139)
def grid(x,y):return (cx+x*math.cos(angle)-y*math.sin(angle),cy+x*math.sin(angle)+y*math.cos(angle))
for y in [-4.2,-2.1,0,2.1,4.2]:line('Roads',[grid(-8.8,y),grid(8.8,y)],.17)
for x in [-8.4,-6.3,-4.2,-2.1,0,2.1,4.2,6.3,8.4]:line('Roads',[grid(x,-4.5),grid(x,4.6)],.16)
for col in range(8):
 for row in range(4):
  for a in range(3):
   for b in range(2):
    x=-8.4+col*2.1+.38+a*.63;y=-4.2+row*2.1+.48+b*.97
    xx,yy=grid(x,y);h=random.uniform(.18,.7)
    if random.random()<.38:h=random.uniform(.85,2.15)
    name=random.choices(['MassIvory','MassStone','MassGlass'],[6,3,1])[0]
    box(name,xx,yy,random.uniform(.40,.56),random.uniform(.62,.83),h,angle)
    if h>1.3:box(name,xx,yy,.28,.4,.18,angle,z=h+.035)
# Southbank: selected high-rise cluster, with clear river frontage.
for i in range(95):
 lon=random.uniform(144.953,144.969);lat=random.uniform(-37.829,-37.823)
 x,y=geo(lon,lat);box(random.choice(['MassIvory','MassStone','MassGlass']),x,y,random.uniform(.3,.65),random.uniform(.35,.65),random.uniform(.15,1.55),-.12)
# Two skyline anchors, simplified stepped silhouettes.
for lon,lat,h in [(144.9648,-37.8216,2.48),(144.9651,-37.8228,2.65)]:
 x,y=geo(lon,lat);box('MassGlass',x,y,.5,.5,h);box('MassLandmarks',x,y,.28,.3,.18,z=h)
# Essential connecting roads and bridges. No street labels or GIS controls.
roads=[[(144.963,-37.807),(144.9674,-37.818),(144.9696,-37.823),(144.974,-37.836)],[(144.957,-37.820),(144.977,-37.813)],[(144.975,-37.823),(144.99,-37.825)],[(144.971,-37.828),(144.987,-37.833)],[(144.977,-37.816),(144.99,-37.816)]]
if base:
 for road in base.get('roads',[]):line('Roads',[geo(*p) for p in road],.11,.042)
else:
 for road in roads:line('Roads',[geo(*p) for p in road],.15,.043)
# Broad landmark forms only; detailed experiences are Phase 3.
# East Melbourne neighbourhoods continue the city beyond the sporting precinct.
for row in range(9):
 for col in range(8):
  lon=144.986+col*.00125;lat=-37.807-row*.00095
  x,y=geo(lon,lat)
  box('MassStone' if (row+col)%4==0 else 'MassIvory',x,y,.42,.47,random.uniform(.10,.32),angle=.08)
for lat in [-37.807,-37.810,-37.813,-37.815]:
 line('Roads',[geo(144.985,lat),geo(144.997,lat)],.12)
for lon in [144.985,144.989,144.993,144.996]:
 line('Roads',[geo(lon,-37.807),geo(lon,-37.816)],.12)
# Low urban fringe north of the CBD, retaining a legible hierarchy of density.
for i in range(100):
 lon=random.uniform(144.944,144.963);lat=random.uniform(-37.809,-37.804)
 x,y=geo(lon,lat);box('MassStone',x,y,random.uniform(.3,.6),random.uniform(.3,.65),random.uniform(.12,.45),angle)
# Shared surface ribbons remain in place when building extrusions collapse.
rail=[(144.951,-37.817),(144.958,-37.8182),(144.966,-37.8189),(144.973,-37.8184),(144.979,-37.821),(144.985,-37.823),(144.994,-37.824)]
for offset in [-.075,.075]:
 line('Rail',[(x,y+offset) for x,y in [geo(*p) for p in rail]],.035,.046)
# Melbourne Park: broad arena silhouettes and tennis court footprints only.
for lon,lat,rx,ry in [(144.9785,-37.8217,.58,.48),(144.9812,-37.8225,.48,.4),(144.9764,-37.8201,.4,.34)]:
 x,y=geo(lon,lat);box('MassIvory',x,y,rx*2,ry*2,.22,angle=.12)
 ellipse('Paths',x,y,rx*.85,ry*.8,.27,n=24)
for col in range(4):
 for row in range(2):
  x,y=geo(144.980+col*.00055,-37.824-row*.00045)
  box('Parks',x,y,.23,.31,.008,z=.035)
x,y=geo(*locations['mcg'])
ellipse('Paths',x,y,1.20,1.05,.045)
ellipse('Parks',x,y,.79,.65,.052)
N=64;v=[]
for rx,ry,h in [(1.13,.98,.06),(1.13,.98,.39),(.84,.7,.32),(.78,.64,.07)]:
 for i in range(N):a=i/N*math.tau;v.append((x+rx*math.cos(a),y+ry*math.sin(a),h))
f=[]
for k in range(3):
 for i in range(N):j=(i+1)%N;f.append((k*N+i,k*N+j,(k+1)*N+j,(k+1)*N+i))
mesh('MassIvory',v,f)
for a in [0,math.pi/2,math.pi,3*math.pi/2]:box('MassLandmarks',x+1.1*math.cos(a),y+math.sin(a),.055,.055,.76)
x,y=geo(*locations['flinders']);box('MassLandmarks',x-.3,y,1.72,.29,.27,angle);box('MassLandmarks',x+.38,y+.25,.31,.36,.47,angle)
x,y=geo(*locations['federation'])
for dx,dy,w,d in [(-.2,0,.36,.48),(.3,.1,.35,.4),(0,-.4,.5,.35)]:box('MassLandmarks',x+dx,y+dy,w,d,.18,angle+.25)
x,y=geo(*locations['shrine'])
for size,z,h in [(1.04,.03,.06),(.8,.09,.1),(.59,.19,.26),(.40,.45,.12),(.23,.57,.09)]:box('MassLandmarks',x,y,size,size,h,z=z)
# Botanic lake and garden path loops.
x,y=geo(144.981,-37.8296);ellipse('River',x,y,.67,.42,.04)
for lon,lat,rx,ry in [(144.980,-37.8304,2.6,2.0),(144.9828,-37.8198,2.1,1.7),(144.980,-37.8107,1.8,2.2)]:
 x,y=geo(lon,lat)
 path=[(x+rx*math.cos(i/64*math.tau),y+ry*math.sin(i/64*math.tau)) for i in range(65)];line('Paths',path,.055,.048)
 for i in range(70):
  a=random.random()*math.tau;r=math.sqrt(random.random());tx=x+rx*r*math.cos(a);ty=y+ry*r*math.sin(a)
  if lon==144.9828 and r<.65:continue
  tree(tx,ty)
# Merge all elements into a handful of material draws; origin fixed for height morph.
objects=[]
for name,(v,f) in categories.items():
 d=bpy.data.meshes.new(name);d.from_pydata(v,[],f);d.update();o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);d.materials.append(materials[name]);objects.append(o)
 bpy.context.view_layer.objects.active=o;o.select_set(True)
 bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.normals_make_consistent(inside=False);bpy.ops.object.mode_set(mode='OBJECT');o.select_set(False)
world=bpy.data.worlds.new('MELB city light');scene.world=world;world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.78,.82,.79,1);world.node_tree.nodes['Background'].inputs[1].default_value=.7
ld=bpy.data.lights.new('Afternoon sun','AREA');ld.energy=5200;ld.size=8;lo=bpy.data.objects.new('Afternoon sun',ld);scene.collection.objects.link(lo);lo.location=(-15,-12,30)
cd=bpy.data.cameras.new('Overview');cam=bpy.data.objects.new('Overview',cd);scene.collection.objects.link(cam);cam.location=(26,-34,34);cam.rotation_euler=(Vector((0,1,0))-cam.location).to_track_quat('-Z','Y').to_euler();cd.type='ORTHO';cd.ortho_scale=52;scene.camera=cam
scene.render.engine='CYCLES';scene.cycles.samples=24;scene.render.resolution_x=1600;scene.render.resolution_y=1100;scene.render.resolution_percentage=100;scene.render.film_transparent=True
for o in objects:o.select_set(True)
os.makedirs(OUT+'/assets/blender',exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=OUT+'/assets/blender/melb-city.blend')
bpy.ops.export_scene.gltf(filepath=OUT+'/public/assets/models/melb-city.glb',export_format='GLB',use_selection=True,use_active_scene=True,export_yup=True,export_cameras=False,export_lights=False)
scene.render.filepath=OUT+'/docs/city-inspection.png';bpy.ops.render.render(write_still=True)
tris=0
for o in objects:o.data.calc_loop_triangles();tris+=len(o.data.loop_triangles)
result={'triangles':tris,'meshes':len(objects),'bytes':os.path.getsize(OUT+'/public/assets/models/melb-city.glb'),'geographic_base':'Vicmap' if base else 'Original schematic, approximate boundaries'}
open(OUT+'/docs/city-stats.json','w').write(json.dumps(result,indent=2))
