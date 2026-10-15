"""Offline composition review, with actual path samples and existing landmark sources."""
import bpy,pathlib,json,math
from mathutils import Vector
root=pathlib.Path(__file__).resolve().parents[1]
paths=json.loads((root/'docs/phase4/tour-render-cameras.json').read_text())
out=root/'docs/phase4/tour-frames';out.mkdir(parents=True,exist_ok=True)
for id,samples in paths.items():
 bpy.ops.wm.open_mainfile(filepath=str(root/f'assets/blender/landmarks/{id}.blend'))
 scene=bpy.context.scene;camera=scene.camera
 scene.render.engine='CYCLES';scene.cycles.samples=4
 scene.render.resolution_x=640;scene.render.resolution_y=400;scene.render.resolution_percentage=100
 camera.data.type='PERSP';camera.data.sensor_fit='VERTICAL';camera.data.sensor_height=24
 camera.data.lens=12/math.tan(math.radians(39/2));camera.data.shift_x=.1
 for i,s in enumerate(samples):
  x,y,z=s['position'];tx,ty,tz=s['target'];camera.location=(x,-z,y)
  camera.rotation_euler=(Vector((tx,-tz,ty))-camera.location).to_track_quat('-Z','Y').to_euler()
  scene.render.filepath=str(out/f'{id}-{i:02}.png');bpy.ops.render.render(write_still=True)
 print('TOUR_REVIEW_RENDERED',id,flush=True)
