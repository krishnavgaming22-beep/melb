"""Keep downloaded Commons sources; create bounded local JPEG derivatives."""
import pathlib,json,subprocess,shutil
root=pathlib.Path(__file__).resolve().parents[1]
p=root/'src/data/discovery-photos.json'; data=json.loads(p.read_text())
raw=root/'assets/discovery/raw'; raw.mkdir(exist_ok=True)
for id,photo in data.items():
 src=root/('public'+photo['src']); backup=raw/src.name
 if id=='eureka' and (raw/'eureka.png').exists():backup=raw/'eureka.png'
 if not backup.exists():shutil.copy2(src,backup)
 dest=src.with_suffix('.jpg')
 subprocess.run(['sips','-Z','1000','-s','format','jpeg','-s','formatOptions','78',str(backup),'--out',str(dest)],check=True,stdout=subprocess.DEVNULL)
 photo['src']='/assets/discovery/'+dest.name
 photo['changes']='Resized and JPEG-compressed; responsive cropping where applicable. No colour edits.'
 if src!=dest:src.unlink()
p.write_text(json.dumps(data,indent=2))
