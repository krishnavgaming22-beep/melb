/** Presentation only. Camera offsets never alter the geographic model or pin coordinates. */
export const mapView={x:0,z:0,zoom:1,unitsPerPixel:.05};
export function resetMapView(){mapView.x=0;mapView.z=0;mapView.zoom=1;}
export function zoomMap(factor:number){mapView.zoom=Math.max(1,Math.min(3.5,mapView.zoom*factor));}
export function panMap(dx:number,dz:number){mapView.x=Math.max(-20,Math.min(20,mapView.x+dx));mapView.z=Math.max(-17,Math.min(17,mapView.z+dz));}
