import proj4 from "proj4";

export type HorizontalDatum = "GDA94" | "GDA2020";
export type MGA = { easting: number; northing: number; heightAhd: number };
export type Geographic = { lon: number; lat: number; heightAhd: number; datum: HorizontalDatum };
export type Local = readonly [number, number, number];

/** Source evidence supplied by the user. MGA55 does not select a horizontal datum. */
export const photomeshMetadata = {
  projection: "MGA Zone 55",
  horizontalDatum: null as HorizontalDatum | null,
  verticalDatum: "AHD",
  capture: "2020-05",
  groundSampleDistanceMetres: 0.075,
  provenance: "DataVic City of Melbourne 3D textured mesh 2020 metadata, reviewed October 2026; horizontal datum unstated",
} as const;

export const C4_ORIGIN: MGA = {
  easting: 320877.49072265625,
  northing: 5812809.471992493,
  heightAhd: 0,
};
export const C4_BOUNDS = {
  min: [320736.99072265625, 5812668.971984863, 4.013884544373],
  max: [321017.99072265625, 5812949.972000122, 84.991104125977],
} as const;
const projected = "+proj=utm +zone=55 +south +ellps=GRS80 +units=m +no_defs";
const geographic = "+proj=longlat +ellps=GRS80 +no_defs";
const finite = (...values: number[]) => {
  if (!values.every(Number.isFinite)) throw new Error("Nonfinite geographic coordinate");
};

/** Right-handed, metre-scale world: +X east, +Y AHD height, -Z north.
 * Use one shared origin for every tile, vector feature and landmark.
 * This rigid operation is valid before the horizontal datum is known.
 */
export function mgaToLocal(p: MGA, origin: MGA = C4_ORIGIN): Local {
  finite(p.easting,p.northing,p.heightAhd,origin.easting,origin.northing,origin.heightAhd);
  return [p.easting-origin.easting,p.heightAhd-origin.heightAhd,-(p.northing-origin.northing)];
}
export function localToMga(p: Local, origin: MGA = C4_ORIGIN): MGA {
  finite(...p);
  return {easting:p[0]+origin.easting,northing:origin.northing-p[2],heightAhd:p[1]+origin.heightAhd};
}

/** Within-datum projection only. Never silently treat GDA coordinates as WGS84.
 * A map provider using WGS84 needs a verified datum/epoch conversion upstream.
 * AHD heights are carried through unchanged, not treated as ellipsoid heights.
 */
export function createGeoreference(datum: HorizontalDatum | null, origin: MGA = C4_ORIGIN) {
  if (datum !== "GDA94" && datum !== "GDA2020") {
    throw new Error("Confirm GDA94 or GDA2020 before aligning geographic map/landmark data");
  }
  const geographicToMga = (p: Geographic): MGA => {
    if (p.datum !== datum) throw new Error("Datum mismatch: explicit transformation required");
    finite(p.lon,p.lat,p.heightAhd);
    if (p.lon<144 || p.lon>150 || p.lat>=0 || p.lat< -90) throw new Error("Outside southern MGA55 bounds");
    const [easting,northing]=proj4(geographic,projected,[p.lon,p.lat]);
    return {easting,northing,heightAhd:p.heightAhd};
  };
  const mgaToGeographic = (p: MGA): Geographic => {
    finite(p.easting,p.northing,p.heightAhd);
    const [lon,lat]=proj4(projected,geographic,[p.easting,p.northing]);
    return {lon,lat,heightAhd:p.heightAhd,datum};
  };
  return {
    datum, origin,
    projectedEpsg: datum === "GDA94" ? 28355 : 7855,
    geographicEpsg: datum === "GDA94" ? 4283 : 7844,
    geographicToMga, mgaToGeographic,
    geographicToLocal:(p: Geographic)=>mgaToLocal(geographicToMga(p),origin),
    localToGeographic:(p: Local)=>mgaToGeographic(localToMga(p,origin)),
  };
}
