import fs from 'node:fs/promises';
const extra=JSON.parse(await fs.readFile('.photomesh-test/additional-bounds.json'));
const tiles=[];for(const tile of ['C4-22','C5-34']){const a=JSON.parse(await fs.readFile(`docs/phase21-review/photomesh/${tile}-audit.json`));tiles.push({tile,bounds:a.bounds_xyz})}tiles.push(...extra);
const west=319896.99072265625,north=5813789.972000122,step=280,size=281;
function predicted(id){const [,letter,group,number]=id.match(/^([A-Z])(\d+)-(\d+)$/);const k=Number(number)-1;const x=west+(Number(group)-4)*1680+(k%6)*step;const top=north-(letter.charCodeAt(0)-67)*1680-Math.floor(k/6)*step;return[[x,top-size],[x+size,top]]}
const checks=tiles.map(t=>{const b=predicted(t.tile);return{tile:t.tile,measured:t.bounds,predicted:b,maxResidual:Math.max(...[0,1].flatMap(r=>[0,1].map(c=>Math.abs(b[r][c]-t.bounds[r][c]))))}});
// The measured mesh cut is 281 m wide and repeated at 280 m spacing.
// A 1 m difference in lower northing arises because 'top-size' includes the
// boundary overlap; all supplied min/max bounds are checked below.
const neighbours=['C4-15','C4-16','C4-17','C4-21','C4-23','C4-27','C4-28','C4-29'].map(tile=>({tile,bounds:predicted(tile),status:'coordinate-fitted candidate; official index verification required'}));
const result={source:'Six supplied OBJ bounding boxes',horizontalDatum:'unknown',spacingMetres:step,footprintMetres:size,checks,c4NeighbourCandidates:neighbours,officialIndexMissing:'Tile_Index.kml (or official equivalent index containing dataset tile IDs and polygon footprints)',metadataMissing:'metadata.xml or official CRS declaration identifying GDA94 versus GDA2020'};
await fs.writeFile('docs/phase21-review/photomesh/coverage-plan.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({residuals:checks.map(x=>[x.tile,x.maxResidual]),neighbours},null,2));
const w=1000,h=650,scale=.18,minE=318900,maxN=5813250;
let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="#f2efe8"/><g font-family="Arial" fill="#233b40"><text x="30" y="38" font-size="24">MELB. — supplied photomesh coverage</text><text x="30" y="62" font-size="13">Measured MGA coordinate footprints · 281 m tiles · north up · no inferred buildings</text>`;
for(const t of [...neighbours.map(t=>({...t,candidate:true})),...tiles.map(t=>({...t,candidate:false}))]){const [[x,y],[xx,yy]]=t.bounds;const sx=70+(x-minE)*scale,sy=100+(maxN-yy)*scale;svg+=`<rect x="${sx}" y="${sy}" width="${(xx-x)*scale}" height="${(yy-y)*scale}" fill="${t.candidate?'none':'#496b70'}" stroke="#496b70" ${t.candidate?'stroke-dasharray="4 4"':''}/><text x="${sx+3}" y="${sy+25}" font-size="10" fill="${t.candidate?'#233b40':'white'}">${t.tile}</text>`;}
svg+='<text x="30" y="600" font-size="13">Filled: supplied tiles. Dashed: immediate C4-22 neighbour candidates fitted from measured grid.</text><text x="30" y="622" font-size="13">Only C5-33 / C5-34 are currently adjacent. The blank gaps are missing coverage, not water or parkland.</text></g></svg>';
await fs.writeFile('docs/phase21-review/photomesh/coverage.svg',svg);
