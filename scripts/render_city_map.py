"""Inspect the same city asset in its flattened, north-up state (not browser QA)."""
import bpy, os
from mathutils import Vector
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bpy.ops.wm.open_mainfile(filepath=root+'/assets/blender/melb-city.blend')
scene=bpy.context.scene
for o in scene.objects:
 if o.type=='MESH':
  if o.name.startswith('Mass'):
   o.scale.z=.015;o.location.z=.065
  for m in o.data.materials:
   color=m.diffuse_color[:]
   nodes=m.node_tree.nodes;nodes.clear()
   emission=nodes.new('ShaderNodeEmission');emission.inputs[0].default_value=color
   output=nodes.new('ShaderNodeOutputMaterial');m.node_tree.links.new(emission.outputs[0],output.inputs[0])
cam=scene.camera;cam.location=(0,0,70);cam.rotation_euler=(Vector((0,0,0))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=48
scene.render.resolution_x=1400;scene.render.resolution_y=1200;scene.cycles.samples=8
scene.render.filepath=root+'/docs/city-map-inspection.png'
bpy.ops.render.render(write_still=True)
