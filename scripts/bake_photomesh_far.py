"""Bake a real orthographic colour + depth reference for the near-nadir LOD."""
import bpy,pathlib,json
from mathutils import Vector
root=pathlib.Path(__file__).resolve().parents[1];out=root/'.photomesh-test/lods';bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(root/'.photomesh-test/C4-22.glb'))
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=1
s.render.resolution_x=2048;s.render.resolution_y=2048;s.render.resolution_percentage=100
s.render.film_transparent=True;s.view_layers[0].use_pass_z=True;s.view_settings.view_transform='Standard'
bpy.ops.object.camera_add(location=(0,0,400));c=bpy.context.object;c.rotation_euler=(Vector((0,0,0))-c.location).to_track_quat('-Z','Y').to_euler();c.data.type='ORTHO';c.data.ortho_scale=281;s.camera=c
s.render.image_settings.media_type='MULTI_LAYER_IMAGE';s.render.image_settings.file_format='OPEN_EXR_MULTILAYER';s.render.filepath=str(out/'far-source.exr');bpy.ops.render.render(write_still=True)
s.render.image_settings.media_type='IMAGE';s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA';bpy.data.images['Render Result'].save_render(str(out/'far-orthophoto.png'),scene=s)
deps=bpy.context.evaluated_depsgraph_get();heights=[];valid=[];steps=128
for row in range(steps+1):
 for col in range(steps+1):
  east=-140.5+281*col/steps;north=140.5-281*row/steps
  hit,position,*_=s.ray_cast(deps,Vector((max(-140.49,min(140.49,east)),max(-140.49,min(140.49,north)),400)),Vector((0,0,-1)))
  heights.append(position.z if hit else 0);valid.append(bool(hit))
(out/'far-heights.json').write_text(json.dumps({'steps':steps,'heights':heights,'valid':valid,'method':'Vertical raycast of full source geometry; source-derived 2.5D near-nadir LOD'}))
