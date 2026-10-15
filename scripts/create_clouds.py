from PIL import Image,ImageFilter
import numpy as np
from pathlib import Path
out=Path('public/assets/textures');out.mkdir(parents=True,exist_ok=True)
for seed in range(3):
 rng=np.random.default_rng(seed+71);w,h=1024,512
 Y,X=np.mgrid[0:h,0:w];x=X/w;y=Y/h
 density=np.zeros((h,w))
 for i in range(24):
  cx=rng.uniform(.12,.88);cy=rng.uniform(.35,.7);rx=rng.uniform(.08,.2);ry=rng.uniform(.08,.2)
  density=np.maximum(density,np.exp(-((x-cx)/rx)**2-((y-cy)/ry)**2)*rng.uniform(.7,1))
 noise=np.zeros((h,w))
 for n,amp in [(8,.40),(16,.25),(32,.17),(64,.1),(128,.08)]:
  a=Image.fromarray((rng.random((max(2,n//2),n))*255).astype('uint8')).resize((w,h),Image.Resampling.BICUBIC)
  noise+=np.asarray(a)/255*amp
 alpha=np.clip((density*(noise*.7+.55)-.12)*1.5,0,1)
 alpha*=np.clip(x*12,0,1)*np.clip((1-x)*12,0,1)*np.clip(y*10,0,1)*np.clip((1-y)*10,0,1)
 shade=np.clip(.78+noise*.22-(y-.5)*.15,0,1)
 rgba=np.zeros((h,w,4),dtype='uint8')
 for c,tint in enumerate([250,251,248]):rgba[:,:,c]=(shade*tint).astype('uint8')
 rgba[:,:,3]=(alpha*235).astype('uint8')
 Image.fromarray(rgba).save(out/f'cloud-{seed}.webp',quality=90)
