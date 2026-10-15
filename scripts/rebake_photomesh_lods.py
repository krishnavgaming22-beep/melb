"""Reproject original photography onto source-derived simplified 3D geometry."""
import bpy,pathlib,time,json
root=pathlib.Path(__file__).resolve().parents[1];out=root/'.photomesh-test/lods'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(root/'.photomesh-test/C4-22.glb'))
sources=[o for o in bpy.context.scene.objects if o.type=='MESH']
for name,size in [('medium',4096),('far',2048)]:
 bpy.ops.object.select_all(action='DESELECT')
 bpy.ops.import_scene.gltf(filepath=str(out/f'{name}-rebake-target.glb'))
 targets=[o for o in bpy.context.selected_objects if o.type=='MESH'];assert len(targets)==1;target=targets[0]
 bpy.context.view_layer.objects.active=target
 bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
 bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT')
 bpy.ops.uv.smart_project(angle_limit=1.151917,island_margin=.0004,margin_method='FRACTION')
 bpy.ops.object.mode_set(mode='OBJECT');print('UNWRAPPED',name,len(target.data.polygons),flush=True)
 image=bpy.data.images.new(f'{name}-baked',width=size,height=size,alpha=False)
 mat=bpy.data.materials.new(f'{name}-photography');mat.use_nodes=True;nodes=mat.node_tree.nodes;nodes.clear()
 texture=nodes.new('ShaderNodeTexImage');texture.image=image;nodes.active=texture;texture.select=True
 emission=nodes.new('ShaderNodeEmission');output=nodes.new('ShaderNodeOutputMaterial')
 mat.node_tree.links.new(emission.outputs[0],output.inputs[0]);target.data.materials.clear();target.data.materials.append(mat)
 scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=1
 scene.render.bake.use_selected_to_active=True;scene.render.bake.cage_extrusion=2;scene.render.bake.max_ray_distance=5;scene.render.bake.margin=8
 bpy.ops.object.select_all(action='DESELECT')
 for source in sources:source.select_set(True)
 target.select_set(True);bpy.context.view_layer.objects.active=target
 start=time.perf_counter();bpy.ops.object.bake(type='EMIT');print('BAKED',name,time.perf_counter()-start,flush=True)
 mat.node_tree.links.new(texture.outputs['Color'],emission.inputs['Color'])
 image.filepath_raw=str(out/f'{name}-rebaked.png');image.file_format='PNG';image.save()
 bpy.ops.object.select_all(action='DESELECT');target.select_set(True)
 bpy.ops.export_scene.gltf(filepath=str(out/f'{name}-rebaked.glb'),export_format='GLB',use_selection=True,export_yup=True,export_animations=False)
 bpy.data.objects.remove(target,do_unlink=True)
