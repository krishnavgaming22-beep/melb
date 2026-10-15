"""Read derived photomesh only. Render and measure; never fabricate street geometry."""
import bpy,json,pathlib,math,sys
from mathutils import Vector
from mathutils.bvhtree import BVHTree
root=pathlib.Path(__file__).resolve().parents[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(root/'.photomesh-test/lods/high-inspection.glb'))
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
verts=[];faces=[]
for o in meshes:
 offset=len(verts);verts.extend(o.matrix_world@v.co for v in o.data.vertices)
 faces.extend(tuple(offset+i for i in p.vertices) for p in o.data.polygons)
bvh=BVHTree.FromPolygons(verts,faces)
points=[]
# Preliminary within-datum inverse projection places the tile on Little Collins Street.
# These candidate positions are checked against actual mesh, not asserted as surveyed footpaths.
mall='--mall' in sys.argv
for x,z in ([(-100,-55),(-65,-69),(-30,-83),(5,-97)] if mall else [(-65,54),(-25,38),(15,22),(55,6)]):
 hit,normal,idx,dist=bvh.ray_cast(Vector((x,-z,110)),Vector((0,0,-1)))
 if hit is not None: points.append({'position':[x,round(hit.z+1.7,4),z],'ground':round(hit.z,4)})
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=12
scene.render.resolution_x=1280;scene.render.resolution_y=800;scene.render.resolution_percentage=100
scene.world=bpy.data.worlds.new('Inspection sky');scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.68,.77,.85,1)
scene.view_settings.view_transform='Standard'
bpy.ops.object.camera_add();cam=bpy.context.object;scene.camera=cam;cam.data.lens=24;cam.data.clip_start=.05
out=root/'docs/phase4';out.mkdir(exist_ok=True,parents=True)
for i,p in enumerate(points):
 x,y,z=p['position'];cam.location=(x,-z,y)
 target=Vector((x+35,-z+14,y+1));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler()
 scene.render.filepath=str(out/f'{"mall" if mall else "street"}-eye-{i}.png');bpy.ops.render.render(write_still=True)
cam.location=(260,-320,320);cam.rotation_euler=(Vector((0,0,25))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=45
scene.render.filepath=str(out/'street-overview.png');bpy.ops.render.render(write_still=True)
(out/('mall-inspection.json' if mall else 'street-inspection.json')).write_text(json.dumps({'points':points,'source':'C4-22 high derived GLB','eyeHeight':1.7,'horizontalDatum':'unknown; geographic identification approximate','axis':'X east, Y AHD height, Z south'},indent=2))
print('STREET_INSPECTION_COMPLETE',points,flush=True)
