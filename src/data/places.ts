import geography from "./city-geography.json";
import { stories, discoveryPhotos, visitorUrls } from "./discovery";

export const locations = geography.locations.map((place) => ({
  ...place,
  ...stories[place.id],
  href: visitorUrls[place.id] ?? place.href,
  photo: discoveryPhotos[place.id],
  showPin: true,
  detailReady: true,
  futureExperience: null as string | null,
}));
export type Location = (typeof locations)[number];
export const places = locations.filter((place) => place.enabled);
/** Shared by the Blender builder, rendered city and projected HTML markers. */
export const cityPoint = (lon: number, lat: number) => {
  const p = geography.projection;
  return [
    ((lon - p.origin[0]) * p.metresPerLongitudeDegree) / p.metresPerUnit,
    0,
    (-(lat - p.origin[1]) * p.metresPerLatitudeDegree) / p.metresPerUnit,
  ] as const;
};
