"""Headless visual QA of real geographic geometry; source files remain untouched."""
import bpy,os,math
from mathutils import Vector
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=root+'/assets/geography/phase15/city-inspection.glb')
scene=bpy.context.scene
world=bpy.data.worlds.new('Ivory studio');scene.world=world;world.use_nodes=True
world.node_tree.nodes['Background'].inputs[0].default_value=(.78,.80,.78,1)
world.node_tree.nodes['Background'].inputs[1].default_value=.65
light=bpy.data.lights.new('Soft sunlight','AREA');light.energy=7000;light.size=14
obj=bpy.data.objects.new('Soft sunlight',light);scene.collection.objects.link(obj);obj.location=(-15,-25,40)
camera=bpy.data.objects.new('City camera',bpy.data.cameras.new('City camera'));scene.collection.objects.link(camera);scene.camera=camera
camera.data.type='ORTHO';camera.data.ortho_scale=48;camera.location=(25,-36,35);camera.rotation_euler=(Vector((0,0,0))-camera.location).to_track_quat('-Z','Y').to_euler()
scene.render.engine='CYCLES';scene.cycles.samples=24
scene.render.resolution_x=1600;scene.render.resolution_y=1200;scene.render.resolution_percentage=100
scene.render.film_transparent=True
scene.view_settings.view_transform='Standard';scene.view_settings.look='None'
bpy.ops.wm.save_as_mainfile(filepath=root+'/assets/blender/melb-phase15.blend')
scene.render.filepath=root+'/docs/phase15/overview.png';bpy.ops.render.render(write_still=True)
for o in scene.objects:
 if o.type=='MESH':
  if o.name.startswith('Mass_'):o.scale.z*=.0002;o.location.z=o.location.z*.0002+.065
  for m in o.data.materials:
   base=m.node_tree.nodes.get('Principled BSDF')
   if not base:continue
   color=list(base.inputs['Base Color'].default_value)
   if o.name.startswith('Mass_'):color[:3]=[c*.84 for c in color[:3]]
   nodes=m.node_tree.nodes;nodes.clear();em=nodes.new('ShaderNodeEmission');em.inputs[0].default_value=color
   out=nodes.new('ShaderNodeOutputMaterial');m.node_tree.links.new(em.outputs[0],out.inputs[0])
camera.location=(0,0,75);camera.rotation_euler=(0,0,0);camera.data.ortho_scale=51
scene.render.filepath=root+'/docs/phase15/overhead.png';bpy.ops.render.render(write_still=True)
