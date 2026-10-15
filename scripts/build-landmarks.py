"""Original reference-based exterior studies. Estimated detail, not survey geometry.
Run with Blender --background --python scripts/build-landmarks.py.
One mesh per material; positions in metres, exported at 1 unit = 20 metres.
Source photographs and official references are recorded in docs/PHASE_3.md.
"""
import bpy, math, random, os, json
from mathutils import Vector
from mathutils.geometry import tessellate_polygon
from collections import defaultdict
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(ROOT,'public/assets/landmarks'); os.makedirs(OUT,exist_ok=True)
BLEND=os.path.join(ROOT,'assets/blender/landmarks'); os.makedirs(BLEND,exist_ok=True)
RENDER=os.path.join(ROOT,'docs/phase3/models'); os.makedirs(RENDER,exist_ok=True)
random.seed(31)
palette={'stone':('#b5ae9d',.88),'lightstone':('#d7cdb6',.82),'darkstone':('#8d8272',.9),'brick':('#91533e',.92),'ochre':('#c6a06a',.86),'copper':('#647b68',.62),'glass':('#334d53',.3),'steel':('#9da6a6',.46),'roof':('#c5c9c3',.72),'darkroof':('#667373',.8),'seat':('#647f91',.75),'seat2':('#9cabaa',.8),'grass':('#738765',1),'field':('#537957',1),'stripe':('#638961',1),'path':('#c9c0ac',1),'water':('#647e80',.4),'bark':('#6b6557',1),'leaf':('#647e59',1),'white':('#e2dfd0',.8),'pitch':('#b4a680',1)}
data=defaultdict(lambda:[[],[]])
def mesh(mat,vs,fs):
    v,f=data[mat]; off=len(v); v.extend(vs); f.extend(tuple(off+i for i in face) for face in fs)
def box(mat,x,y,z,w,d,h):
    vs=[(x+a*w/2,y+b*d/2,z+c*h/2) for a,b,c in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]]
    mesh(mat,vs,[(3,2,1,0),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7),(4,5,6,7)])
def ring(mat,rx,ry,z,rx2,ry2,z2,n=128,start=0,end=math.tau):
    vs=[]
    for i in range(n+1):
        a=start+(end-start)*i/n
        vs.extend([(rx*math.cos(a),ry*math.sin(a),z),(rx2*math.cos(a),ry2*math.sin(a),z2)])
    mesh(mat,vs,[(2*i+1,2*i+3,2*i+2,2*i) for i in range(n)])
def cyl(mat,x,y,z,r,h,n=16,r2=None):
    r2=r if r2 is None else r2
    vs=[(x+rr*math.cos(i*math.tau/n),y+rr*math.sin(i*math.tau/n),zz) for zz,rr in [(z,r),(z+h,r2)] for i in range(n)]
    mesh(mat,vs,[tuple(reversed(range(n))),tuple(range(n,n*2))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)])
def beam(mat,a,b,r=.15,n=6):
    a,b=Vector(a),Vector(b); axis=(b-a).normalized(); u=axis.cross(Vector((0,0,1)))
    if u.length<.001:u=axis.cross(Vector((0,1,0)))
    u.normalize(); v=axis.cross(u)
    vs=[tuple(p+r*(u*math.cos(i*math.tau/n)+v*math.sin(i*math.tau/n))) for p in (a,b) for i in range(n)]
    mesh(mat,vs,[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)])
def tree(x,y,s=1):
    cyl('bark',x,y,0,.32*s,3*s,6)
    # A compact irregular canopy, kept low-poly at the perimeter.
    for dx,dy,dz,r in [(0,0,5,2.8),(1,0,6.8,2.2),(-1,1,5.9,2.3)]:
        for j in range(5):
            t0=math.pi*j/5;t1=math.pi*(j+1)/5
            vs=[]
            for t in [t0,t1]:
                for i in range(8):
                    a=i*math.tau/8;vs.append((x+s*(dx+r*math.sin(t)*math.cos(a)),y+s*(dy+r*math.sin(t)*math.sin(a)),s*(dz+r*math.cos(t))))
            mesh('leaf',vs,[(i,(i+1)%8,(i+1)%8+8,i+8) for i in range(8)])
def arch(x,y,z,w,h,mat='ochre'):
    # Recessed opening with a segmented masonry arch, facing negative Y.
    box('glass',x,y+.1,z+h/2,w,.22,h)
    for sign in [-1,1]:box(mat,x+sign*(w/2+.15),y,z+(h-w/2)/2,.3,.5,h-w/2)
    for i in range(14):
        a=i*math.pi/14;b=(i+1)*math.pi/14;r=w/2
        mesh(mat,[(x+rr*math.cos(t),yy,z+h-r+rr*math.sin(t)) for yy in [y-.25,y+.25] for rr,t in [(r,a),(r+.35,a),(r+.35,b),(r,b)]],[(0,1,2,3),(4,7,6,5),(0,4,5,1),(3,2,6,7)])
def dome(x,y,z,r,h):
    for j in range(16):
        t0=j*math.pi/32;t1=(j+1)*math.pi/32
        vs=[]
        for t in [t0,t1]:
            for i in range(64):
                a=i*math.tau/64;vs.append((x+r*math.cos(t)*math.cos(a),y+r*math.cos(t)*math.sin(a),z+h*math.sin(t)))
        mesh('copper',vs,[(i,(i+1)%64,(i+1)%64+64,i+64) for i in range(64)])
    for i in range(24):
        a=i*math.tau/24
        for j in range(12):
            ts=[j*math.pi/24,(j+1)*math.pi/24]
            beam('ochre',*[(x+(r+.05)*math.cos(t)*math.cos(a),y+(r+.05)*math.cos(t)*math.sin(a),z+(h+.08)*math.sin(t)) for t in ts],.07)
    cyl('copper',x,y,z+h,.6,3,16,r2=.15)
def clock(x,y,z,r):
    vs=[(x,y-.08,z)]+[(x+r*math.cos(i*math.tau/48),y-.08,z+r*math.sin(i*math.tau/48)) for i in range(48)]
    mesh('white',vs,[(0,i+1,(i+1)%48+1) for i in range(48)])
    for i in range(12):
        a=i*math.tau/12;beam('glass',(x+.8*r*math.cos(a),y-.1,z+.8*r*math.sin(a)),(x+.94*r*math.cos(a),y-.1,z+.94*r*math.sin(a)),.055)
    beam('glass',(x,y-.14,z),(x+.55*r,y-.14,z+.15*r),.06);beam('glass',(x,y-.14,z),(x,y-.14,z+.7*r),.06)
def mcg():
    cyl('grass',0,0,-.6,160,.55,128)
    ring('path',112,127,.02,126,142,.02)
    ring('field',0,0,.06,75,86,.06)
    for j in range(12):
        # Ellipse-clipped mowing stripes.
        y0=-84+j*14;y1=y0+14; vs=[]
        for y in [y0,y1]:
            xx=75*math.sqrt(max(0,1-(y/86)**2));vs.extend([(-xx,y,.075),(xx,y,.075)])
        if j%2==0:mesh('stripe',vs,[(0,1,3,2)])
    box('pitch',0,0,.1,3.1,20.12,.05)
    for y in [-10.06,10.06]:box('white',0,y,.15,3.6,.1,.035)
    for x in [-.12,0,.12]:
        for y in [-10.06,10.06]:beam('white',(x,y,.15),(x,y,.85),.025)
    ring('white',75,86,.09,75.25,86.25,.09)
    for base,rows,height in [(77,22,1.2),(89,15,12),(99,24,23)]:
        for j in range(rows):
            r=base+j*.48;h=height+j*.42
            ring('seat' if j%3 else 'seat2',r,r+11,h,r+.44,r+11.44,h)
            ring('darkroof',r+.44,r+11.44,h,r+.44,r+11.44,h+.24)
        # Stair aisles break up the tiers into recognisable seating blocks.
        for i in range(48):
            a=i*math.tau/48
            for j in range(rows):
                r=base+j*.48;box('lightstone',r*math.cos(a),(r+11)*math.sin(a),height+j*.42+.08,.8,.8,.16)
    for h in [11,22,34]:ring('lightstone',89+(h//11-1)*10,100+(h//11-1)*10,h,114,125,h)
    # Split roof profiles, an open oval and radial trussed canopies.
    for start,end,zh in [(0,math.pi,42),(math.pi,math.tau,35)]:
        ring('roof',99,110,zh-4,116,127,zh,96,start,end)
        ring('darkroof',115.8,126.8,zh,116,127,zh-1,96,start,end)
    for i in range(72):
        a=i*math.tau/72;zh=42 if a<math.pi else 35
        outer=(115*math.cos(a),126*math.sin(a),zh);inner=(99*math.cos(a),110*math.sin(a),zh-4)
        beam('steel',outer,inner,.24)
        beam('steel',(116*math.cos(a),127*math.sin(a),1),outer,.35)
        beam('steel',(113*math.cos(a),124*math.sin(a),zh-8),inner,.18)
        for h in [6,15,25]:
            aa=a+.06
            mesh('glass',[(114*math.cos(t),125*math.sin(t),zz) for t,zz in [(a,h),(aa,h),(aa,h+5),(a,h+5)]],[(0,1,2,3)])
    for i in range(6):
        a=.25+i*math.tau/6;x=130*math.cos(a);y=142*math.sin(a)
        cyl('lightstone',x,y,0,1.7,75,12,r2=.8)
        box('steel',x,y,80,13,2,10)
        for dx in range(-5,6,2):
            for h in range(77,85,2):box('white',x+dx,y-1.15,h,1.2,.3,1.1)
    for i in range(64):
        a=i*math.tau/64;r=150+random.uniform(-3,6);tree(r*math.cos(a),r*math.sin(a),random.uniform(.75,1.25))
def flinders():
    box('path',0,10,-.35,310,100,.7)
    box('darkroof',0,-23,.01,310,15,.08)
    for y in [-26,-23]:box('steel',0,y,.08,310,.1,.06)
    box('brick',-10,0,11,240,16,22)
    for z in [1,7,14,21,23]:box('ochre',-10,-8.2,z,242,.8,.55)
    box('darkroof',-10,0,23.5,242,17,1)
    for x in range(-127,108,5):
        box('ochre',x,-8.7,11.5,.6,1,23)
        for z in [1,8,15]:arch(x+2.5,-8.7,z,2.5,5.3)
        box('ochre',x,-8.8,24.2,.9,1.2,2)
    # Swanston Street corner pavilion and copper dome.
    box('ochre',112,0,13,28,27,26)
    arch(112,-13.6,0,16,17)
    for x in [101,123]:arch(x,-13.7,17,3,6)
    for z in [1,7,17,25]:box('ochre',112,-13.9,z,29,.7,.55)
    cyl('ochre',112,0,26,11,4,48)
    dome(112,0,30,11,13)
    for x in [98,126]:dome(x,0,27,3,4)
    # Pediment in front of the dome.
    mesh('ochre',[(98,-14,25),(126,-14,25),(112,-14,31)],[(0,1,2)])
    clock(112,-14.15,27.6,1.5)
    for i in range(9):clock(106+i*1.5,-14.05,8.3,.5)
    # Elizabeth Street clock tower.
    box('ochre',-78,0,28,10,18,13)
    box('ochre',-78,0,37,8,9,7)
    clock(-78,-4.6,37,2.4);dome(-78,0,41,4,4)
    for y in range(17,61,8):
        box('lightstone',-10,y,.35,245,5,.7)
        for x in range(-125,111,15):beam('steel',(x,y,1),(x,y,5),.13)
        box('roof',-10,y,5.2,245,5,.25)
        box('steel',-10,y+3.2,.15,270,.12,.08)
    for x in range(-130,121,22):tree(x,-37,.75)
def federation():
    box('path',0,24,-.5,205,170,1)
    box('water',0,-72,-.35,205,25,.2)
    source=json.load(open(os.path.join(ROOT,'assets/landmarks/federation-footprints.json')))
    heights={'ACMI':21,'SBS':23,'Ian Potter Centre: NGV Australia':25,'The Atrium':20,'Birrarung Building':18,'Crossbar':17,'Deakin Edge':18,'Zinc at Fed Square':12}
    for feature in source['features']:
        name=feature['properties'].get('name');h=heights.get(name)
        if not h:continue
        ring2=[((p[0]-144.9695)*88000,(p[1]+37.8179)*111000) for p in feature['geometry']['coordinates'][0][:-1]]
        # Preserve the real mapped footprint; heights and façade articulation remain estimates.
        top=[Vector((x,y,h+(i%3)*.9)) for i,(x,y) in enumerate(ring2)]
        for tri in tessellate_polygon([top]):mesh('glass' if name in ['The Atrium','Deakin Edge'] else 'darkroof',[tuple(top[p] if isinstance(p,int) else p) for p in tri],[(0,1,2)])
        for i,(x,y) in enumerate(ring2):
            xx,yy=ring2[(i+1)%len(ring2)];length=math.hypot(xx-x,yy-y);cols=max(1,round(length/4));rows=max(1,round(h/3.5))
            for col in range(cols):
                for row in range(rows):
                    t0=col/cols;t1=(col+1)/cols;z0=h*row/rows;z1=h*(row+1)/rows
                    a=(x+(xx-x)*t0,y+(yy-y)*t0,z0);b=(x+(xx-x)*t1,y+(yy-y)*t1,z0);c=(b[0],b[1],z1);d=(a[0],a[1],z1)
                    # Hierarchical triangle cladding and recessed seams, not a flat chequerboard texture.
                    for tri in [[a,b,c],[a,c,d]]:
                        center=tuple(sum(p[k] for p in tri)/3 for k in range(3))
                        inset=[tuple(center[k]+(p[k]-center[k])*.974 for k in range(3)) for p in tri]
                        mat='glass' if name in ['The Atrium','Deakin Edge'] else random.choice(['steel','steel','darkstone','lightstone','glass'])
                        mesh(mat,inset,[(0,1,2)])
                    if name in ['The Atrium','Deakin Edge']:
                        beam('steel',a,c,.085,4);beam('steel',a,b,.085,4)
            beam('steel',(x,y,0),(x,y,h),.12,6)
    # Plaza west of Crossbar and south of ACMI: the open area remains legible.
    for x in range(-86,-19,3):
        for y in range(-18,5,3):box('darkstone' if (x+y)%9==0 else 'path',x,y,.03,2.95,2.95,.035)
    for j in range(8):box('lightstone',-57,-23+j*.6,j*.12,58,.6,.25)
    for x,y in [(-95,-48),(-95,40),(92,100),(95,20),(75,-52),(-50,-54),(-20,-54)]:tree(x,y,1.3)
def shrine():
    box('grass',0,0,-.5,160,180,1)
    box('path',0,-50,.02,25,80,.07)
    box('path',0,0,.04,98,75,.08)
    for j in range(12):box('stone',0,0,j*.22+ .12,65-j*.9,60-j*.9,.24)
    box('stone',0,0,9.4,34,29,13)
    # Block courses and alternating joints on the side elevations.
    for side in [-1,1]:
        for row in range(13):
            for col in range(10):
                box('lightstone' if (row+col)%4==0 else 'stone',side*17.05,-13+col*2.8+(row%2)*.35,3.5+row,.07,2.72,.94)
    for yy in [-19,19]:
        for x in [-13,-9.3,-5.6,-1.86,1.86,5.6,9.3,13]:
            cyl('lightstone',x,yy,3.0,1.0,.5,20)
            cyl('stone',x,yy,3.5,.77,10.1,20,r2=.62)
            for i in range(16):
                a=i*math.tau/16;beam('darkstone',(x+.77*math.cos(a),yy+.77*math.sin(a),3.9),(x+.63*math.cos(a),yy+.63*math.sin(a),13.4),.028,4)
            box('lightstone',x,yy,13.9,2,2,.8)
        box('lightstone',0,yy,15.0,31,4,1.5)
        mesh('stone',[(-15.5,yy-2,15.75),(15.5,yy-2,15.75),(0,yy-2,20.7),(-15.5,yy+2,15.75),(15.5,yy+2,15.75),(0,yy+2,20.7)],[(0,1,2),(5,4,3),(0,3,4,1),(1,4,5,2),(2,5,3,0)])
        for x in range(-14,15,2):box('darkstone',x,yy-2.03,15,.55,.06,.65)
    for j in range(4):box('lightstone',0,0,16.3+j*.8,36-j*1.8,31-j*1.8,.8)
    # Characteristic stepped pyramidal roof, without invented sculptural relief.
    for j in range(22):box('darkstone',0,0,19.5+j*.37,27-j*.85,23-j*.7,.4)
    for side in [-1,1]:
        for j in range(18):box('stone',0,side*(31-j*.55),j*.155+.08,27,.56,.16)
        for x in [-19,19]:box('stone',x,side*25,1.7,4,10,3.4)
    for x in [-57,-44,44,57]:
        for y in range(-69,76,17):tree(x,y,1.25)
    for x in [-30,30]:box('grass',x,-53,.09,24,40,.1)

stats={}
for name,fn in [('mcg',mcg),('flinders',flinders),('federation',federation),('shrine',shrine)]:
    bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False);data.clear();fn()
    objects=[]
    for mat,(vs,fs) in data.items():
        me=bpy.data.meshes.new(mat);me.from_pydata([(x/20,y/20,z/20) for x,y,z in vs],[],fs);me.update()
        obj=bpy.data.objects.new(name+'_'+mat,me);bpy.context.collection.objects.link(obj);objects.append(obj)
        def linear(c):return c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4
        m=bpy.data.materials.new(mat);m.diffuse_color=tuple(linear(int(palette[mat][0][i:i+2],16)/255) for i in [1,3,5])+(1,);m.use_nodes=True
        bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=m.diffuse_color;bs.inputs['Roughness'].default_value=palette[mat][1]
        if mat in ['glass','steel','copper']:bs.inputs['Metallic'].default_value=.28
        obj.data.materials.append(m)
        # Export triangulation and normals explicitly; keep flat masonry and smooth cylinders readable.
        mod=obj.modifiers.new('Web triangulation','TRIANGULATE');bpy.context.view_layer.objects.active=obj;bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.select_set(True)
    path=os.path.join(OUT,name+'.glb')
    bpy.ops.export_scene.gltf(filepath=path,export_format='GLB',use_selection=True,export_yup=True,export_materials='EXPORT')
    stats[name]={'triangles':sum(len(o.data.polygons) for o in objects),'drawCalls':len(objects),'bytes':os.path.getsize(path),'textures':0,'scale':'1 unit = 20 metres','accuracy':'reference-based architectural study; estimated detail, not a survey'}
    world=bpy.data.worlds.new('Ivory atmosphere');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.72,.76,.75,1);world.node_tree.nodes['Background'].inputs[1].default_value=.5;bpy.context.scene.world=world
    bpy.ops.object.light_add(type='AREA',location=(-6,-9,17));bpy.context.object.data.energy=2600;bpy.context.object.data.shape='DISK';bpy.context.object.data.size=10
    bpy.ops.object.light_add(type='SUN',location=(0,0,15));bpy.context.object.rotation_euler=(.4,-.4,-.3);bpy.context.object.data.energy=2;bpy.context.object.data.angle=.1
    cams={'mcg':(13,-18,17),'flinders':(14,-17,12),'federation':(11,-14,13),'shrine':(9,-13,10)}
    bpy.ops.object.camera_add(location=cams[name]);cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,.5))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=23 if name in ['mcg','flinders'] else 14;bpy.context.scene.camera=cam
    scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=16;scene.render.resolution_x=1100;scene.render.resolution_y=850;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.render.filepath=os.path.join(RENDER,name+'.png')
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(BLEND,name+'.blend'));bpy.ops.render.render(write_still=True)
with open(os.path.join(OUT,'manifest.json'),'w') as f:json.dump(stats,f,indent=2)
