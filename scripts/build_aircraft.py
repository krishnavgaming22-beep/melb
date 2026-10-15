import bpy, math, json, os
from mathutils import Vector
OUT='/Users/krishnavsewak/Documents/ChatGPT/MELB'
scene=bpy.data.scenes.new('MELB Aircraft Workshop')
bpy.context.window.scene=scene

def mat(name,color,metal=0,rough=.4):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
 return m
paint=mat('Warm ivory composite',(.82,.85,.83),.25,.32)
wingmat=mat('Wing aluminium',(.57,.64,.64),.48,.4)
accent=mat('Eucalyptus tail',(.16,.28,.27),.22,.35)
glass=mat('Smoked reflective glass',(.018,.035,.043),.5,.17)
metal=mat('Brushed engine lip',(.4,.45,.46),.82,.25)
dark=mat('Engine interior',(.024,.03,.032),.3,.48)
seam=mat('Control surface seams',(.25,.33,.34),.2,.55)
objects=[]
def mesh(name,v,f,m):
 data=bpy.data.meshes.new(name);data.from_pydata(v,[],f);data.update();o=bpy.data.objects.new(name,data);scene.collection.objects.link(o);o.data.materials.append(m);objects.append(o)
 for p in data.polygons:p.use_smooth=True
 return o
# Long-haul proportions: 66.8 m length / 64.75 m span; no airline-specific geometry or livery.
profile=[(-33.4,.03,-.45),(-33,.55,-.3),(-32,1.35,-.05),(-30.5,2.15,.08),(-28.5,2.7,.06),(-26,2.95,0),(-22,2.98,0),(-16,2.98,0),(-8,2.98,0),(0,2.98,0),(8,2.98,0),(16,2.91,.05),(21,2.62,.16),(25,2.02,.4),(29,1.13,.7),(32,.35,.92),(33.4,.02,1)]
# Interpolate many smooth radial sections via cubic profile.
def cat(a,b,c,d,t):return .5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t)
rings=[]
for i in range(len(profile)-1):
 for j in range(5):
  t=j/5; vals=[cat(profile[max(0,i-1)][k],profile[i][k],profile[i+1][k],profile[min(len(profile)-1,i+2)][k],t) for k in range(3)];rings.append(vals)
rings.append(profile[-1]);v=[];f=[];N=64
for y,r,z in rings:
 for j in range(N):
  a=j/N*math.tau;v.append((r*math.cos(a),y,z+r*math.sin(a)*1.01))
for i in range(len(rings)-1):
 for j in range(N):a=i*N+j;b=i*N+(j+1)%N;f.append((a,b,b+N,a+N))
f.extend([tuple(reversed(range(N))),tuple((len(rings)-1)*N+j for j in range(N))]);mesh('Sculpted pressure fuselage',v,f,paint)
# Airfoil wing loft. Airfoil profile has rounded leading edge and a crisp trailing edge.
def foil(name,sections,side,material):
 v=[];f=[];steps=24
 for x,lead,chord,z,thick in sections:
  for j in range(steps*2):
   a=j/(steps*2)*math.tau;t=(1-math.cos(a))/2
   yt=5*thick*(.2969*math.sqrt(t)-.126*t-.3516*t*t+.2843*t**3-.1036*t**4)
   v.append((side*x,lead+chord*t,z+(1 if j<steps else -1)*yt*chord+.025*chord*math.sin(t*math.pi)))
 for i in range(len(sections)-1):
  for j in range(steps*2):
   a=i*steps*2+j;b=i*steps*2+(j+1)%(steps*2);f.append((a,b,b+steps*2,a+steps*2))
 f.append(tuple(reversed(range(steps*2))));f.append(tuple((len(sections)-1)*steps*2+j for j in range(steps*2)))
 o=mesh(name,v,f,material);return o
for s in [-1,1]:
 foil('Swept dihedral wing',[(1.6,-7,15,-1.05,.11),(5,-5.7,12.4,-.95,.1),(11,-2.5,8.8,-.4,.09),(19,3,5.8,.5,.08),(27,8.7,3,1.45,.075),(31,11.8,1.4,2.2,.07),(32.375,13.3,.65,4,.065)],s,wingmat)
 foil('Horizontal stabiliser',[(1.1,21,9,.85,.095),(5,23.2,5.8,1.25,.09),(10.1,27.2,2,2,.08),(11.5,28.5,.6,2.2,.06)],s,paint)
 # Engine pylon and fairings.
 foil('Engine pylon',[(8.2,-7.8,6,-1.1,.11),(10.5,-7.4,5,-3.1,.12)],s,paint)
 # Engine lathe about longitudinal Y axis, open intake with inner wall.
 v=[];f=[];cx=s*10.5;cz=-3.6;cy=-7.4
 ep=[(-4,1.30),(-3.8,1.63),(-3.4,1.76),(-2.4,1.82),(0,1.7),(2,1.38),(3.1,1.1),(3.1,.88),(2,.98),(0,1.25),(-2.8,1.33),(-4,1.30)]
 for yy,r in ep:
  for j in range(64):a=j/64*math.tau;v.append((cx+r*math.cos(a),cy+yy,cz+r*math.sin(a)))
 for i in range(len(ep)-1):
  for j in range(64):a=i*64+j;b=i*64+(j+1)%64;f.append((a,b,b+64,a+64))
 engine=mesh('High bypass nacelle',v,f,paint);engine.data.materials.append(metal);engine.data.materials.append(dark)
 for poly in engine.data.polygons:
  r=poly.index//64
  if r in [0,1]:poly.material_index=1
  if r>=7:poly.material_index=2
 # Fans behind the lip, true geometry with twisting tapered blades.
 for j in range(24):
  a=j/24*math.tau;vv=[]
  for rad,angle,y in [(.3,a,cy-2.7),(1.28,a+.13,cy-2.65),(1.28,a+.3,cy-2.45),(.3,a+.34,cy-2.58)]:vv.append((cx+rad*math.cos(angle),y,cz+rad*math.sin(angle)))
  mesh('Turbofan blade',vv,[(0,1,2,3)],metal)
 # Spinner and black rear core.
 def spindle(name,cx,cy,cz,rad,length,material):
  vv=[];ff=[]
  for k,(yy,r) in enumerate([(0,.02),(.22*length,.7*rad),(length,rad)]):
   for j in range(32):a=j/32*math.tau;vv.append((cx+r*math.cos(a),cy+yy,cz+r*math.sin(a)))
  for k in range(2):
   for j in range(32):a=k*32+j;b=k*32+(j+1)%32;ff.append((a,b,b+32,a+32))
  mesh(name,vv,ff,material)
 spindle('Fan spinner',cx,cy-3.2,cz,.37,.8,dark)
 spindle('Exhaust core',cx,cy+3.7,cz,.55,-1.8,metal)
 # Cabin windows mapped to fuselage; individually rounded, three cabin segments.
 for j in range(69):
  yy=-25+j*.68
  if any(abs(yy-door)<.62 for door in [-22,-5,11,20]):continue
  r=2.98 if yy<16 else 2.98-(yy-16)*.045
  zz=.9;xx=s*math.sqrt(r*r-zz*zz);vv=[]
  for k in range(16):
   a=k/16*math.tau;dy=.18*math.cos(a);dz=.26*math.sin(a);z=zz+dz;x=s*(math.sqrt(max(.1,r*r-z*z))+.022);vv.append((x,yy+dy,z))
  mesh('Cabin window',vv,[tuple(range(16))],glass)
 # Door outlines follow fuselage surface, subtle and exterior only.
 for yy in [-22,-5,11,20]:
  r=2.98 if yy<16 else 2.8; vv=[];ff=[]
  for k in range(32):
   a=k/32*math.tau;dy=.52*math.copysign(abs(math.cos(a))**.3,math.cos(a));z=.4+1.08*math.copysign(abs(math.sin(a))**.3,math.sin(a))
   for dd in [0,.025]:vv.append((s*(math.sqrt(max(.1,r*r-z*z))+.028),yy+dy+dd,z))
  for k in range(32):ff.append((2*k,2*k+1,2*((k+1)%32)+1,2*((k+1)%32)))
  mesh('Passenger door seam',vv,ff,seam)
 # Curved cockpit panels conform to the interpolated nose surface.
 for idx,(y0,y1) in enumerate([(-31.35,-30.35),(-30.23,-29.13),(-29.01,-27.85)]):
  vv=[];ff=[]
  for row in range(7):
   yy=y0+(y1-y0)*row/6
   rr=next((a[1]+(b[1]-a[1])*(yy-a[0])/(b[0]-a[0]) for a,b in zip(rings,rings[1:]) if a[0]<=yy<=b[0]),2.5)
   zc=next((a[2]+(b[2]-a[2])*(yy-a[0])/(b[0]-a[0]) for a,b in zip(rings,rings[1:]) if a[0]<=yy<=b[0]),0)
   for col in range(5):
    ang=.26+col/4*.42
    vv.append((s*(rr+.045)*math.cos(ang),yy,zc+(rr+.045)*math.sin(ang)*1.01))
  for row in range(6):
   for col in range(4):
    a=row*5+col;ff.append((a,a+1,a+6,a+5))
  mesh('Cockpit curved glazing',vv,ff,glass)
# Vertical fin loft (long swept stabilizer, not triangular toy fin).
v=[];f=[]
for z,lead,chord,half in [(1.7,18,13,.48),(4,20,10,.35),(9,24,6,.18),(12.2,26.3,3.1,.07)]:
 for j in range(32):
  a=j/32*math.tau;t=(1-math.cos(a))/2;v.append((math.sin(a)*half,lead+t*chord,z))
for i in range(3):
 for j in range(32):a=i*32+j;b=i*32+(j+1)%32;f.append((a,b,b+32,a+32))
f.append(tuple(96+j for j in range(32)));mesh('Eucalyptus vertical stabiliser',v,f,accent)
# Merge by material; fixed exterior geometry, no rig, no interior, no duplicate instances.
bpy.ops.object.select_all(action='DESELECT')
for o in objects:o.select_set(True)
bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();aircraft=bpy.context.object;aircraft.name='MELB_Longhaul_Exterior'
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
# Recalculate consistent normals.
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.normals_make_consistent(inside=False);bpy.ops.object.mode_set(mode='OBJECT')
aircraft.data.calc_loop_triangles();tris=len(aircraft.data.loop_triangles)
# Render setup retained in editable .blend.
world=bpy.data.worlds.new('Soft atmospheric sky');scene.world=world;world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.58,.7,.78,1);world.node_tree.nodes['Background'].inputs[1].default_value=.65
for name,location,power,size in [('Soft sun',(0,-25,45),17000,25),('Sky fill',(-35,10,20),10000,30)]:
 data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size;o=bpy.data.objects.new(name,data);scene.collection.objects.link(o);o.location=location;o.rotation_euler=(Vector((0,0,0))-o.location).to_track_quat('-Z','Y').to_euler()
camdata=bpy.data.cameras.new('Aircraft inspection camera');cam=bpy.data.objects.new('Aircraft inspection camera',camdata);scene.collection.objects.link(cam);cam.location=(65,-85,48);cam.rotation_euler=(Vector((0,0,0))-cam.location).to_track_quat('-Z','Y').to_euler();camdata.lens=48;scene.camera=cam
scene.render.engine='CYCLES';scene.cycles.samples=24;scene.render.resolution_x=1400;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
os.makedirs(OUT+'/public/assets/models',exist_ok=True);os.makedirs(OUT+'/assets/blender',exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=OUT+'/assets/blender/melb-aircraft.blend')
bpy.ops.export_scene.gltf(filepath=OUT+'/public/assets/models/melb-aircraft.glb',export_format='GLB',use_selection=True,use_active_scene=True,export_yup=True,export_cameras=False,export_lights=False)
# Mobile LOD kept as another export, 60% decimation while preserving silhouette.
mod=aircraft.modifiers.new('Mobile silhouette LOD','DECIMATE');mod.ratio=.6
bpy.ops.export_scene.gltf(filepath=OUT+'/public/assets/models/melb-aircraft-mobile.glb',export_format='GLB',use_selection=True,use_active_scene=True,export_yup=True,export_apply=True,export_cameras=False,export_lights=False)
aircraft.modifiers.remove(mod)
scene.render.filepath=OUT+'/docs/aircraft-inspection.png';bpy.ops.render.render(write_still=True)
result={'triangles':tris,'vertices':len(aircraft.data.vertices),'materials':len(aircraft.data.materials),'desktop_bytes':os.path.getsize(OUT+'/public/assets/models/melb-aircraft.glb'),'blend':OUT+'/assets/blender/melb-aircraft.blend'}
open(OUT+'/docs/aircraft-stats.json','w').write(json.dumps(result,indent=2))
