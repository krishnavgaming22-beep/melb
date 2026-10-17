"""Generate seek-friendly website derivatives. Never modifies source clips.
Usage: python3 scripts/prepare-street-video.py /absolute/path/to/ffmpeg
"""
import subprocess, sys, pathlib, json
ffmpeg=sys.argv[1]
out=pathlib.Path('public/assets/streets/video'); out.mkdir(parents=True,exist_ok=True)
for name,seconds in [('melbourne-aerial',20),('flinders-night',20)]:
    source=f'assets/streets/source/video/{name}.mp4'
    for width in [1280,1920]:
        subprocess.run([ffmpeg,'-v','error','-y','-ss','0.5','-i',source,'-t',str(seconds),'-an','-vf',f'scale={width}:-2,fps=24','-c:v','libx264','-preset','fast','-crf','21','-pix_fmt','yuv420p','-g','6','-keyint_min','6','-sc_threshold','0','-bf','0','-movflags','+faststart',str(out/f'{name}-{width}.mp4')],check=True)
    subprocess.run([ffmpeg,'-v','error','-y','-ss','0.5','-i',source,'-frames:v','1','-vf','scale=1920:-2',str(out/f'{name}-poster.webp')],check=True)
print(json.dumps({p.name:p.stat().st_size for p in out.iterdir()},indent=2))
