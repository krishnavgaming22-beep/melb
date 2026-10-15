"""Resolve Commons photographs and licence metadata; never assume a Wikipedia image is free."""
import json, subprocess, urllib.parse, pathlib, re, html, time
root=pathlib.Path(__file__).resolve().parents[1]
out=root/'public/assets/discovery'; out.mkdir(parents=True,exist_ok=True)
cache=root/'assets/discovery';cache.mkdir(parents=True,exist_ok=True)
pages={'mcg':'Melbourne Cricket Ground','flinders':'Flinders Street railway station','federation':'Federation Square','shrine':'Shrine of Remembrance','gardens':'Royal Botanic Gardens Victoria','market':'Queen Victoria Market','marvel':'Docklands Stadium','library':'State Library Victoria','eureka':'Eureka Tower','rod-laver':'Rod Laver Arena','exhibition':'Royal Exhibition Building','arts-centre':'Arts Centre Melbourne'}
def get(url):
 return subprocess.check_output(['curl','-fLsS','--max-time','45','-A','MELBDiscovery/1.0',url])
def api(domain,params):
 return json.loads(get('https://'+domain+'/w/api.php?'+urllib.parse.urlencode({'format':'json',**params})))
def plain(s):return html.unescape(re.sub('<[^>]+>','',s)).strip()
manifest=root/'src/data/discovery-photos.json'
records=json.loads(manifest.read_text()) if manifest.exists() else {}
for id,title in pages.items():
 if id in records:continue
 time.sleep(8)
 try:
  data=api('en.wikipedia.org',{'action':'query','titles':title,'prop':'pageimages','piprop':'name'})
  page=next(iter(data['query']['pages'].values())); name=page['pageimage']
  if id=='arts-centre':name='Arts Centre, Melbourne, north view 20230219 1.jpg'
  info=api('commons.wikimedia.org',{'action':'query','titles':'File:'+name,'prop':'imageinfo','iiprop':'url|extmetadata','iiurlwidth':1000})
  (cache/(id+'-metadata.json')).write_text(json.dumps(info,indent=2))
  image=next(iter(info['query']['pages'].values()))['imageinfo'][0];meta=image['extmetadata']
  license=plain(meta.get('LicenseShortName',{}).get('value',''))
  if not (license.startswith('CC BY') or license in ['CC0','Public domain']):raise ValueError('Unsupported licence: '+license)
  url=image.get('thumburl',image['url'])
  filename=id+pathlib.Path(urllib.parse.urlparse(url).path).suffix.lower()
  (out/filename).write_bytes(get(url))
  records[id]={'src':'/assets/discovery/'+filename,'alt':title,'credit':plain(meta.get('Artist',{}).get('value','Wikimedia Commons')),'license':license,'licenseUrl':meta.get('LicenseUrl',{}).get('value','https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia'),'source':image['descriptionurl'],'changes':'Displayed with a responsive crop; original colours retained.'}
  print(id,license,len((out/filename).read_bytes()),flush=True)
 except Exception as e:
  print(id,'FAILED',str(e),flush=True)
  if '429' in str(e):break
 manifest.write_text(json.dumps(records,indent=2))
(root/'src/data/discovery-photos.json').write_text(json.dumps(records,indent=2))
