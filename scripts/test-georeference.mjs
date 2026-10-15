import assert from 'node:assert/strict';
import {C4_ORIGIN,C4_BOUNDS,mgaToLocal,localToMga,createGeoreference} from '../src/geo/melbourne.ts';
assert.throws(()=>createGeoreference(null),/Confirm/);
for(const datum of ['GDA94','GDA2020']){
 const ref=createGeoreference(datum);
 for(const point of [C4_BOUNDS.min,C4_BOUNDS.max,[C4_ORIGIN.easting,C4_ORIGIN.northing,20]]){
  const source={easting:point[0],northing:point[1],heightAhd:point[2]};
  const local=mgaToLocal(source);const inverse=localToMga(local);assert.deepEqual(source,inverse);
  const geo=ref.mgaToGeographic(source);const roundtrip=ref.geographicToMga(geo);
  assert.ok(Math.abs(source.easting-roundtrip.easting)<.001);
  assert.ok(Math.abs(source.northing-roundtrip.northing)<.001);
  assert.equal(source.heightAhd,roundtrip.heightAhd);
 }
 assert.throws(()=>ref.geographicToMga({lon:144.97,lat:-37.82,heightAhd:0,datum:'WGS84'}),/Datum mismatch/);
}
assert.deepEqual(mgaToLocal({...C4_ORIGIN,northing:C4_ORIGIN.northing+100,heightAhd:23}),[0,23,-100]);
console.log('Georeferencing: projected/local and geographic round trips passed; missing/mixed datums rejected.');
