import json, math
src=json.load(open('/private/tmp/melb-countries.geojson'))
a=next(f for f in src['features'] if f['properties']['ADMIN']=='Australia')
polys=a['geometry']['coordinates']
# Exclude remote territories; retain mainland, Tasmania and coastal islands.
polys=[p for p in polys if all(110<x<155 and -45<y<-9 for x,y in p[0])]
json.dump({'type':'MultiPolygon','coordinates':polys},open('src/data/australia.json','w'),separators=(',',':'))
print('Australia rings:',len(polys),'points:',sum(len(p[0]) for p in polys))
