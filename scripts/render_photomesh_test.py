"""Blender inspection of the derived local GLB; source files remain read-only."""
import bpy, math, pathlib, json
from mathutils import Vector
root=pathlib.Path(__file__).resolve().parents[1]; out=root/'.photomesh-test'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(out/'C4-22.glb'))
scene=bpy.context.scene
scene.render.engine='CYCLES'; scene.cycles.samples=8
scene.render.resolution_x=1400;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
scene.world=bpy.data.worlds.new('Neutral inspection background'); scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.72,.72,.69,1)
scene.view_settings.view_transform='Standard'
bpy.ops.object.camera_add();camera=bpy.context.object;scene.camera=camera;camera.data.type='ORTHO';camera.data.ortho_scale=440
def shot(name,position,target):
 camera.location=position;camera.rotation_euler=(Vector(target)-camera.location).to_track_quat('-Z','Y').to_euler()
 scene.render.filepath=str(out/name);bpy.ops.render.render(write_still=True)
# glTF importer restores Blender's Z-up coordinates: east, north, height.
shot('C4-22-oblique.png',(320,-380,310),(0,0,25))
shot('C4-22-overhead.png',(0,0,500),(0,0,0))
camera.data.ortho_scale=230
shot('C4-22-detail.png',(170,-180,160),(0,0,30))
camera.data.ortho_scale=440;camera.location=(320,-380,310);camera.rotation_euler=(Vector((0,0,25))-camera.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.wm.save_as_mainfile(filepath=str(out/'C4-22-inspection.blend'))
print('PHOTOMESH_RENDER_COMPLETE',flush=True)
