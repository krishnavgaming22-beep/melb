import pathlib,json,subprocess,concurrent.futures
ff='.photomesh-test/video-tools/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1'
# (id, source ID, author, verified source URL, location, trim start, duration, portrait)
rows=[
('yarra-approach',10006427,'Tetrakis Sphericon','aerial-view-on-melbourne-from-suburbs-10006427','Yarra / Toward the skyline',5,12,False),
('shrine-gardens',20260837,'LayG Traveller','a-park-with-tall-buildings-in-the-background-20260837','Shrine Reserve / City gardens',.3,6.5,False),
('swanston-life',27818095,'Zane Jimenez','docklands-melbourne-city-victoria-27818095','Swanston Street / Cathedral precinct',1,12,False),
('shrine-stone',28122934,'HTJ Media Advertising','the-sun-is-shining-on-a-monument-with-a-city-in-the-background-28122934','Shrine of Remembrance',1,14,False),
('shrine-axis',28158985,'HTJ Media Advertising','shrine-of-remembrance-28158985','Shrine Reserve / Looking toward the city',.1,4,False),
('library-dome',35019145,'Joolsmagools ®️','majestic-dome-of-state-library-victoria-35019145','State Library Victoria / La Trobe Reading Room',1,10,True),
('hosier-lane',6547634,'Pat Whelen','hosier-lane-with-graffiti-arts-at-melbourne-australia-6547634','Hosier Lane / Street art',3,18,False),
('yarra-evening',8949504,'Peter Erb','buildings-in-melbourne-australia-8949504','Yarra / Southbank',.5,16,False),
('st-kilda',30331412,'Camilo Rodriguez','aerial-view-of-st-kilda-pier-with-crowds-30331412','St Kilda / The pier',2,14,False),
]
out=pathlib.Path('public/assets/streets/video');manifest=json.loads((out/'SOURCES.json').read_text())[:2]
def encode(row):
 name,num,author,slug,location,start,duration,portrait=row
 src=pathlib.Path(f'assets/streets/source/phase42/{num}.mp4')
 for w in [1280,1920]:
  vf=f'scale=-2:{720 if w==1280 else 1080},fps=24' if portrait else f'scale={w}:-2,fps=24'
  dest=out/f'{name}-{w}.mp4'
  subprocess.run([ff,'-v','error','-y','-ss',str(start),'-i',str(src),'-t',str(duration),'-an','-vf',vf,'-c:v','libx264','-preset','fast','-crf','23','-maxrate','12M' if w==1920 else '6M','-bufsize','24M' if w==1920 else '12M','-pix_fmt','yuv420p','-g','12','-keyint_min','12','-sc_threshold','0','-bf','0','-movflags','+faststart',str(dest)],check=True)
 subprocess.run([ff,'-v','error','-y','-ss',str(start),'-i',str(src),'-frames:v','1','-vf','scale=-2:1080' if portrait else 'scale=1920:-2',str(out/f'{name}-poster.webp')],check=True)
 print(name, 'ready',flush=True)
 return dict(id=name,author=author,source=f'https://www.pexels.com/video/{slug}/',download=f'https://www.pexels.com/download/video/{num}/',location=location,duration=duration,portrait=portrait,license='Pexels License',licenseUrl='https://www.pexels.com/license/',verified='2026-10-19',costINR=0,changes=f'Source {start}–{start+duration}s; silent 24fps H264, 12-frame GOP, constrained bitrate, no B frames, responsive 1080/720 variants, faststart. Portrait retained without stretching.' if portrait else f'Source {start}–{start+duration}s; silent 24fps H264, 12-frame GOP, constrained bitrate, no B frames, responsive 1080p/720p, faststart.',restrictions='No implied endorsement or resale as standalone stock. Original creators retain rights.',visualVerification='Frames inspected. Location label describes visible setting; title alone not accepted. Source 27818095 says Docklands but shows the St Paul’s/Swanston precinct; correctly relabelled.' if num==27818095 else 'Frames inspected; visible architecture/river/pier matches the stated setting.')
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
 manifest+=list(pool.map(encode,rows))
(out/'SOURCES.json').write_text(json.dumps(manifest,indent=2)+'\n')
