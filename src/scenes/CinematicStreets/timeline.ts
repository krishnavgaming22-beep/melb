export const streetShots = [
  {
    image: "flinders-aerial",
    street: "Flinders Street",
    title: "Where the city meets.",
    text: "The station, the river, the city beyond. A view from Eureka Tower.",
    kind: "THE APPROACH",
    position: "50% 42%",
    drift: -1,
  },
  {
    image: "flinders-frontage",
    street: "Flinders Street",
    title: "A familiar face.",
    text: "The station entrance at Flinders and Swanston streets.",
    kind: "AT STREET LEVEL",
    position: "50% 42%",
    drift: 1,
  },
  {
    image: "flinders-corner",
    street: "Flinders Street",
    title: "Look a little closer.",
    text: "The dome, the clock, the rhythm of the façade.",
    kind: "AN ARCHITECTURAL STUDY",
    position: "48% 32%",
    drift: 0,
  },
  {
    image: "flinders-corner",
    street: "Flinders Street",
    title: "Meet you here.",
    text: "One last look at the station. Our next chapter moves to Collins Street.",
    kind: "THE MEETING PLACE",
    position: "50% 50%",
    drift: -1,
  },
  {
    image: "collins-street",
    street: "Collins Street",
    title: "Another side of Melbourne.",
    text: "Trees, tram lines and the street ahead, beside the 101 Collins Street tram stop.",
    kind: "A NEW CHAPTER",
    position: "50% 50%",
    drift: 1,
  },
  {
    image: "collins-detail",
    street: "Collins Street",
    title: "Look above the everyday.",
    text: "The Olderfleet buildings: an architectural view captured in 2010.",
    kind: "HERITAGE IN VIEW",
    position: "50% 42%",
    drift: -1,
  },
  {
    image: "collins-heritage",
    street: "Collins Street",
    title: "A different rhythm.",
    text: "Arches and stonework at Treasury on Collins.",
    kind: "THE DETAILS",
    position: "50% 50%",
    drift: 0,
  },
  {
    image: "collins-tram",
    street: "Collins Street",
    title: "A street with character.",
    text: "A tram outside 538 Collins Street. Your next Melbourne chapter is yours to choose.",
    kind: "EVERYDAY MELBOURNE",
    position: "50% 48%",
    drift: 1,
  },
] as const;
export const clampProgress = (p: number) =>
  Number.isFinite(p) ? Math.max(0, Math.min(1, p)) : 0;
export function streetFrame(progress: number, reduced = false) {
  const p = clampProgress(progress),
    n = streetShots.length;
  const index = Math.min(n - 1, Math.floor(p * n));
  const local = p === 1 ? 1 : p * n - index;
  const transition =
    index === n - 1 || reduced ? 0 : Math.max(0, (local - 0.8) / 0.2);
  const blend = transition * transition * (3 - 2 * transition);
  return {
    index,
    next: Math.min(n - 1, index + 1),
    local,
    blend,
    scale: reduced ? 1 : 1 + 0.035 * Math.sin(Math.PI * local),
    x: reduced ? 0 : streetShots[index].drift * Math.sin(Math.PI * local) * 0.8,
    detail: index === 2 && !reduced ? 1 + 0.12 * Math.sin(Math.PI * local) : 1,
  };
}
