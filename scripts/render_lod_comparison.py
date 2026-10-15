"""Offline aerial comparison; not a browser performance benchmark."""
import bpy,pathlib,json,time,sys
from mathutils import Vector
root=pathlib.Path(__file__).resolve().parents[1];out=root/'.photomesh-test/lods/comparison';out.mkdir(parents=True,exist_ok=True)
times=[]
rebaked='--rebaked' in sys.argv
for name in (['medium-rebaked','far-rebaked'] if rebaked else ['raw','high','medium','far']):
 bpy.ops.wm.read_factory_settings(use_empty=True)
 path=root/'.photomesh-test/C4-22.glb' if name=='raw' else root/f'.photomesh-test/lods/{name if rebaked else name+"-inspection"}.glb'
 start=time.perf_counter();bpy.ops.import_scene.gltf(filepath=str(path));import_seconds=time.perf_counter()-start
 scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=4
 scene.render.resolution_x=960;scene.render.resolution_y=720;scene.render.resolution_percentage=100
 scene.world=bpy.data.worlds.new('Neutral');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.72,.72,.69,1)
 scene.view_settings.view_transform='Standard';bpy.ops.object.camera_add();cam=bpy.context.object;scene.camera=cam;cam.data.type='ORTHO'
 for angle,pos,scale in [('oblique',(320,-380,310),440),('higher',(200,-240,600),580),('top',(0,-.1,800),650)]:
  cam.location=pos;cam.rotation_euler=(Vector((0,0,25))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=scale
  scene.render.filepath=str(out/f'{name}-{angle}.png');start=time.perf_counter();bpy.ops.render.render(write_still=True)
  times.append({'version':name,'angle':angle,'blenderImportSeconds':import_seconds,'blenderRenderSeconds':time.perf_counter()-start});print('FINISHED',name,angle,flush=True)
(out/('rebake-times.json' if rebaked else 'blender-times.json')).write_text(json.dumps(times,indent=2))
