/** Reproducible OSM → clipped, spatially batched architectural glTF.
 * No random footprints, roads or landmarks. Height estimates are recorded per feature.
 */
import fs from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import osmtogeojson from '../.photomesh-test/tooling/node_modules/osmtogeojson/index.js';
import clipping from '../.photomesh-test/tooling/node_modules/polygon-clipping/dist/polygon-clipping.esm.js';
import {ShapeUtils,Vector2,Color} from 'three';
import {Document,NodeIO} from '../.photomesh-test/tooling/node_modules/@gltf-transform/core/dist/index.js';
import {ALL_EXTENSIONS} from '../.photomesh-test/tooling/node_modules/@gltf-transform/extensions/dist/index.js';
import {weld,meshopt} from '../.photomesh-test/tooling/node_modules/@gltf-transform/functions/dist/index.js';
import {MeshoptEncoder} from '../.photomesh-test/tooling/node_modules/meshoptimizer/index.js';

const dir='assets/geography/phase15';
const source=JSON.parse(await fs.readFile(`${dir}/osm-source.json`,'utf8'));
if(source.remark)throw new Error(source.remark);
const geojson=osmtogeojson(source,{flatProperties:true});
const projection={origin:[144.967,-37.8175],metresPerLongitudeDegree:88000,metresPerLatitudeDegree:111000,metresPerUnit:120};
const bbox=[144.935,-37.8375,144.999,-37.7975];
const project=([lon,lat])=>[(lon-projection.origin[0])*88000/120,-(lat-projection.origin[1])*111000/120];
const sw=project([bbox[0],bbox[1]]),ne=project([bbox[2],bbox[3]]);
const boundary=[[[sw[0],ne[1]],[ne[0],ne[1]],[ne[0],sw[1]],[sw[0],sw[1]],[sw[0],ne[1]]]];
const stats={sourceTimestamp:source.osm3s.timestamp_osm_base,sourceFeatures:geojson.features.length,buildings:0,parts:0,roads:0,railways:0,waterFeatures:0,parkFeatures:0,roofShapes:0,skippedInvalid:0,heightSources:{},projection,bbox,license:'ODbL 1.0',attribution:'© OpenStreetMap contributors'};
const buckets=new Map(),audit=[];
const palette={Ground:'#e5e1d8',Water:'#789aab',Park:'#a4b79b',Pitch:'#91a58a',Road:'#b8b7b0',RoadMajor:'#a5aaa6',Path:'#d3cebd',Rail:'#9f9682',Ivory:'#dedbd1',Stone:'#c7cac7',Light:'#eee9df',Landmark:'#b99e83'};
function bucket(name,key='surface') {const id=`${name}_${key}`;if(!buckets.has(id))buckets.set(id,{name,id,positions:[],normals:[],triangles:0});return buckets.get(id);}
function triangle(b,a,c,d){
 const u=c.map((v,i)=>v-a[i]),v=d.map((x,i)=>x-a[i]);let n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];const l=Math.hypot(...n);if(l<1e-12)return;n=n.map(x=>x/l);
 b.positions.push(...a,...c,...d);b.normals.push(...n,...n,...n);b.triangles++;
}
function ringArea(r){let a=0;for(let i=0;i<r.length;i++){const q=r[(i+1)%r.length];a+=r[i][0]*q[1]-q[0]*r[i][1];}return a/2;}
function cleanRing(r,tolerance=.0025){
 let pts=r.filter((p,i)=>!i||Math.hypot(p[0]-r[i-1][0],p[1]-r[i-1][1])>1e-7);
 if(pts.length>1&&Math.hypot(pts[0][0]-pts.at(-1)[0],pts[0][1]-pts.at(-1)[1])<1e-7)pts.pop();
 // Remove only near-collinear vertices; retain corners and holes.
 return pts.filter((p,i)=>{const a=pts[(i+pts.length-1)%pts.length],b=pts[(i+1)%pts.length];const length=Math.hypot(b[0]-a[0],b[1]-a[1]);return length<1e-8||Math.abs((p[0]-a[0])*(b[1]-a[1])-(p[1]-a[1])*(b[0]-a[0]))/length>tolerance;});
}
function surface(b,poly,y){
 const rings=poly.map(r=>cleanRing(r)).filter(r=>r.length>=3);if(!rings.length)return;
 const vectors=rings.map(r=>r.map(p=>new Vector2(...p)));const faces=ShapeUtils.triangulateShape(vectors[0],vectors.slice(1));const all=rings.flat();
 for(const f of faces){const [a,c,d]=f.map(i=>[all[i][0],y,all[i][1]]);if((c[2]-a[2])*(d[0]-a[0])-(c[0]-a[0])*(d[2]-a[2])<0)triangle(b,a,d,c);else triangle(b,a,c,d);}
}
function polygons(f){
 const g=f.geometry;if(!['Polygon','MultiPolygon'].includes(g.type))return [];
 const polys=(g.type==='Polygon'?[g.coordinates]:g.coordinates).map(p=>p.map(r=>r.map(project)));
 try{return clipping.intersection(polys,boundary);}catch{stats.skippedInvalid++;return [];}
}
function centre(poly){const r=poly[0];return r.reduce((a,p)=>[a[0]+p[0]/r.length,a[1]+p[1]/r.length],[0,0]);}
function contains(point,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>point[1])!==(b[1]>point[1])&&point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
function metres(v){if(v==null)return null;const s=String(v),n=parseFloat(s);return Number.isFinite(n)&&n>=0?(s.includes('ft')||s.includes("'")?n*.3048:n):null;}
function height(t){
 const exact=metres(t.height??t['building:height']);if(exact!==null&&exact>0)return [Math.min(exact,400),'osm-height'];
 const levels=metres(t['building:levels']);if(levels!==null&&levels>0)return [Math.min(levels*3.2,350),'levels-times-3.2m'];
 const type=t.building||t['building:part'];const defaults={house:7,detached:7,terrace:7,apartments:16,residential:10,office:18,commercial:12,retail:7,industrial:9,warehouse:9,garage:3,garages:3,shed:3,roof:4,grandstand:20,train_station:14,church:16,school:10,hospital:18};
 return [defaults[type]??8,`type-estimate:${type||'unknown'}`];
}
const features=geojson.features;
const waters=[],parks=[],pitches=[],buildings=[];
for(const f of features){
 const t=f.properties;
 if(t.building==='no'||t.location==='underground'||t.tunnel==='yes')continue;
 const water=t.natural==='water'||t.waterway==='riverbank';
 const park=['park','garden','nature_reserve'].includes(t.leisure)||['forest','grass','recreation_ground','village_green'].includes(t.landuse)||t.natural==='wood';
 if(water||park||t.leisure==='pitch'){
  const p=polygons(f);if(!p.length)continue;
  if(water){waters.push(...p);stats.waterFeatures++;}else if(park){parks.push(...p);stats.parkFeatures++;}else pitches.push(...p);
 }
 if((t.building||t['building:part'])&&Number(t.layer??0)>=0){
  const p=polygons(f);if(!p.length)continue;
  const [h,method]=height(t);const minimum=metres(t.min_height)??((metres(t['building:min_level'])??0)*3.2);
  if(h<=minimum)continue;
  buildings.push({f,polys:p,h,min:minimum,method,part:!!t['building:part']});
 }
}
const waterUnion=waters.length?clipping.union(...waters):[];
const parkUnion=parks.length?clipping.union(...parks):[];
const visibleParks=waterUnion.length?clipping.difference(parkUnion,waterUnion):parkUnion;
surface(bucket('Ground'),boundary,0);
for(const p of visibleParks)surface(bucket('Park'),p,.018);
for(const p of waterUnion)surface(bucket('Water'),p,.027);
for(const p of pitches)surface(bucket('Pitch'),p,.03);

// Clip line segments against the same geographic boundary before making ribbons.
function clipSegment(a,b){let t0=0,t1=1;const dx=b[0]-a[0],dz=b[1]-a[1];for(const [p,q] of [[-dx,a[0]-sw[0]],[dx,ne[0]-a[0]],[-dz,a[1]-ne[1]],[dz,sw[1]-a[1]]]){if(p===0){if(q<0)return null;}else {const r=q/p;if(p<0)t0=Math.max(t0,r);else t1=Math.min(t1,r);if(t0>t1)return null;}}return [[a[0]+t0*dx,a[1]+t0*dz],[a[0]+t1*dx,a[1]+t1*dz]];}
function ribbon(points,width,y,name){const b=bucket(name);for(let i=1;i<points.length;i++){const segment=clipSegment(project(points[i-1]),project(points[i]));if(!segment)continue;const [a,c]=segment,dx=c[0]-a[0],dz=c[1]-a[1],len=Math.hypot(dx,dz);if(len<1e-6)continue;const nx=-dz/len*width/240,nz=dx/len*width/240;const v=[[a[0]-nx,y,a[1]-nz],[a[0]+nx,y,a[1]+nz],[c[0]+nx,y,c[1]+nz],[c[0]-nx,y,c[1]-nz]];triangle(b,v[0],v[1],v[2]);triangle(b,v[0],v[2],v[3]);}}
for(const f of features){
 const t=f.properties,g=f.geometry;if(!['LineString','MultiLineString'].includes(g.type)||t.tunnel==='yes'||Number(t.layer??0)<0||t.indoor==='yes'||t.level!==undefined)continue;
 const lines=g.type==='LineString'?[g.coordinates]:g.coordinates;
 if(t.highway&&!['construction','proposed','steps','corridor'].includes(t.highway)){
  const widths={motorway:12,trunk:11,primary:10,secondary:9,tertiary:8,residential:6,living_street:5,service:3.5,pedestrian:5,footway:2,cycleway:2,path:1.8,track:3};
  const width=metres(t.width)??(t.lanes?Math.min(20,Number(t.lanes)*3.1):widths[t.highway]??4);
  const major=['motorway','trunk','primary','secondary'].includes(t.highway);const path=['footway','path','cycleway'].includes(t.highway);
  const roadLayer=(major?.048:path?.04:.044)+(t.bridge&&t.bridge!=='no'?.07:0);
  for(const l of lines)ribbon(l,width,roadLayer,major?'RoadMajor':path?'Path':'Road');stats.roads++;
 } else if(['rail','light_rail','tram'].includes(t.railway)){
  for(const l of lines)ribbon(l,t.railway==='rail'?1.8:1.15,t.bridge&&t.bridge!=='no'?.125:.052,'Rail');stats.railways++;
 }
}

const parts=buildings.filter(b=>b.part);
for(const building of buildings){
 const {f,polys,h,min,method,part}=building,t=f.properties;
 const isLandmark=!!t.wikidata||t.building==='grandstand';
 const material=isLandmark?'Landmark':h>90?'Stone':h>25?'Light':'Ivory';
 for(const poly of polys){
  const c=centre(poly),key=`${Math.floor(c[0]/8)}_${Math.floor(c[1]/8)}`;
  const b=bucket(material,key),rings=poly.map(r=>cleanRing(r,.004)).filter(r=>r.length>=3);if(!rings.length)continue;
  const pyramid=t['roof:shape']==='pyramidal'&&rings.length===1;
  const roofHeight=pyramid?(metres(t['roof:height'])??Math.min(3,h*.2)):0;
  const base=.06+min/120,top=.06+(h-roofHeight)/120;
  for(let k=0;k<rings.length;k++){
   const r=rings[k];if((ringArea(r)>0)!==(k===0))r.reverse();
   for(let i=0;i<r.length;i++){const a=r[i],d=r[(i+1)%r.length];triangle(b,[a[0],base,a[1]],[a[0],top,a[1]],[d[0],top,d[1]]);triangle(b,[a[0],base,a[1]],[d[0],top,d[1]],[d[0],base,d[1]]);}
  }
  // Cut roof faces beneath taller mapped parts, avoiding coplanar overlapping roofs.
  let caps=[poly];const cutters=part?[]:parts.filter(p=>p.h>=h&&p.polys.some(q=>contains(centre(q),poly[0]))).flatMap(p=>p.polys);
  if(cutters.length){try{caps=clipping.difference([poly],...cutters);}catch{stats.skippedInvalid++;}}
  if(pyramid&&!cutters.length){
   const apex=[c[0],.06+h/120,c[1]],r=rings[0];
   for(let i=0;i<r.length;i++){const a=r[i],d=r[(i+1)%r.length];triangle(b,[a[0],top,a[1]],apex,[d[0],top,d[1]]);}
   stats.roofShapes++;
  }else for(const cap of caps)surface(b,cap,top);
 }
 stats.buildings++;if(part)stats.parts++;stats.heightSources[method]=(stats.heightSources[method]||0)+1;
 audit.push({id:f.id,name:t.name??null,heightMetres:h,minHeightMetres:min,heightMethod:method,roof:t['roof:shape']??'unspecified-flat-presentation'});
}

// Registry coordinates are centres of the selected mapped geometries, not eyeballed positions.
const specs=[
 ['mcg','Melbourne Cricket Ground','The MCG','SPORT','way/210337258',true],
 ['flinders','Flinders Street Station','Flinders Street','CULTURE','way/1418831738',true],
 ['federation','Federation Square','Federation Square','ART','way/1098427843',true],
 ['shrine','Shrine of Remembrance','The Shrine','REFLECTION','way/24590190',true],
 ['gardens','Royal Botanic Gardens','Botanic Gardens','NATURE','way/45422277',true],
 ['market','Queen Victoria Market','Queen Victoria Market','FOOD & CULTURE','way/113434071',true],
 ['marvel','Marvel Stadium','Marvel Stadium','SPORT','way/22971441',true],
 ['library','State Library Victoria','State Library','CULTURE','way/22820458',true],
 ['eureka','Eureka Tower','Eureka Tower','ARCHITECTURE','way/13307317',false],
 ['rod-laver','Rod Laver Arena','Rod Laver Arena','SPORT','way/45738964',false],
 ['exhibition','Royal Exhibition Building','Royal Exhibition Building','CULTURE','way/4817059',false],
 ['arts-centre','Arts Centre Melbourne','Arts Centre','ART','relation/6592679',false],
];
const descriptions={mcg:'The city’s great sporting ground, held within the green of Yarra Park.',flinders:'Under the clocks, beside the river. A familiar meeting place at the edge of the city grid.',federation:'Galleries, moving image and public life, gathered beside the Birrarung.',shrine:'A place of remembrance, with a long view back towards Melbourne.',gardens:'Winding paths, living collections and quiet corners on the southern bank.',market:'Historic market sheds and the everyday flavours of Melbourne.',marvel:'Docklands’ stadium, close to the waterfront and Southern Cross.',library:'Reading rooms, collections and a meeting place on Swanston Street.'};
const locations=specs.map(([id,name,short,category,osmId,showPin],i)=>{
 const f=features.find(f=>f.id===osmId);if(!f)throw new Error('Missing landmark '+osmId);
 const coords=f.geometry.coordinates.flat(f.geometry.type==='MultiPolygon'?2:1);
 const lon=(Math.min(...coords.map(p=>p[0]))+Math.max(...coords.map(p=>p[0])))/2;
 const lat=(Math.min(...coords.map(p=>p[1]))+Math.max(...coords.map(p=>p[1])))/2;
 return {id,number:String(i+1).padStart(2,'0'),name,short,category,lon,lat,coordinates:[lon,lat],description:descriptions[id]??name,shortDescription:descriptions[id]??name,detail:'A starting point for exploring the surrounding city. Detailed landmark experiences will follow.',previewImage:null,route:`/places/${id}`,modelAsset:null,enabled:true,showPin,detailReady:false,osmId,href:f.properties.website??`https://www.openstreetmap.org/${osmId}`,source:'OpenStreetMap geometry bounds centre'};
});
const doc=new Document(),buffer=doc.createBuffer();const scene=doc.createScene('Melbourne OSM architectural reconstruction');
for(const b of buckets.values()){
 if(!b.triangles)continue;
 const color=new Color(palette[b.name]);const material=doc.createMaterial(b.name).setBaseColorFactor([color.r,color.g,color.b,1]).setRoughnessFactor(.95).setMetallicFactor(0);
 const mass=['Ivory','Stone','Light','Landmark'].includes(b.name);
 const primitive=doc.createPrimitive().setAttribute('POSITION',doc.createAccessor().setType('VEC3').setArray(new Float32Array(b.positions)).setBuffer(buffer)).setAttribute('NORMAL',doc.createAccessor().setType('VEC3').setArray(new Float32Array(b.normals)).setBuffer(buffer)).setMaterial(material);
 scene.addChild(doc.createNode((mass?'Mass_':'')+b.id).setMesh(doc.createMesh().addPrimitive(primitive)).setExtras({layer:b.name,spatialChunk:b.id,flattenHeight:mass}));
}
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder});
await MeshoptEncoder.ready;
await doc.transform(weld());
await io.write(`${dir}/city-inspection.glb`,doc);
await doc.transform(meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16,quantizeNormal:8}));
await io.write('public/assets/models/melb-city-phase15.glb',doc);
stats.triangles=[...buckets.values()].reduce((s,b)=>s+b.triangles,0);stats.meshes=doc.getRoot().listMeshes().length;stats.bytes=(await fs.stat('public/assets/models/melb-city-phase15.glb')).size;
await fs.writeFile(`${dir}/height-audit.json`,JSON.stringify(audit));
await fs.writeFile('src/data/city-geography.json',JSON.stringify({projection,bbox,provenance:'OpenStreetMap, ODbL 1.0; mapped footprints. Heights tagged, floor-count derived or documented type estimates.',sourceTimestamp:stats.sourceTimestamp,locations},null,2)+'\n');
await fs.writeFile('docs/phase15/city-stats.json',JSON.stringify(stats,null,2)+'\n');
const auditById=new Map(audit.map(a=>[a.id,a]));
const database={type:'FeatureCollection',license:'ODbL 1.0',attribution:'© OpenStreetMap contributors',features:features.filter(f=>f.geometry.type!=='Point').map(f=>({...f,properties:{...f.properties,melbHeight:auditById.get(f.id)??null}}))};
await fs.writeFile(`${dir}/city-derived.geojson`,JSON.stringify(database));
await fs.mkdir('public/assets/data',{recursive:true});
await fs.writeFile('public/assets/data/melbourne-osm.geojson.gz',gzipSync(JSON.stringify(database)));
await fs.writeFile('public/assets/data/melbourne-data.json',JSON.stringify({attribution:stats.attribution,license:'https://opendatacommons.org/licenses/odbl/1-0/',source:'https://overpass-api.de/api/interpreter',timestamp:stats.sourceTimestamp,download:'/assets/data/melbourne-osm.geojson.gz',coordinateReferenceSystem:'WGS84 longitude/latitude; equirectangular local presentation, north up',projection,bbox,heightMethods:stats.heightSources,notes:['OSM height tags are community supplied, not independently surveyed here.','Floor counts use estimated 3.2 metres per floor. Unknown heights use documented building-type estimates, default 8 metres.','Tagged pyramidal roofs use roof:height where present, otherwise an estimated roof rise up to 3 metres. Other roofs use flat caps and mapped building parts.','Road width uses width, lanes or highway-class estimates. Flat terrain: no elevation dataset integrated.']},null,2)+'\n');
console.log(JSON.stringify(stats,null,2));
