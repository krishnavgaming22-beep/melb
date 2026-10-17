export const filmClips = [
  {
    id: "melbourne-aerial",
    location: "Melbourne / From above",
    author: "Nick English",
    source: "https://www.pexels.com/video/melbourne-city-17920530/",
    duration: 20,
  },
  {
    id: "flinders-night",
    location: "Flinders Street / After dark",
    author: "Peter Erb",
    source:
      "https://www.pexels.com/video/cars-driving-on-the-busy-road-8949648/",
    duration: 20,
  },
] as const;
export const filmChapters = [
  {
    title: "A city on the horizon.",
    text: "A real flight across Melbourne. Your scroll sets the pace.",
    kind: "MELBOURNE FROM ABOVE",
  },
  {
    title: "Follow the river.",
    text: "The skyline opens beyond the Yarra / Birrarung corridor.",
    kind: "A NEW PERSPECTIVE",
  },
  {
    title: "Closer to the city.",
    text: "Rail lines, parklands and towers share the frame.",
    kind: "THE CITY IN CONTEXT",
  },
  {
    title: "The light changes.",
    text: "An editorial cut takes us from the skyline to Flinders Street after dark.",
    kind: "FROM DAY TO NIGHT",
  },
  {
    title: "Beneath the dome.",
    text: "Flinders Street Station, filmed from across the intersection.",
    kind: "AT THE STATION",
  },
  {
    title: "Watch the city move.",
    text: "Trams and traffic pass the station. Scroll back to retrace the moment.",
    kind: "THE CITY’S RHYTHM",
  },
  {
    title: "Meet you here.",
    text: "The familiar corner, alive with Melbourne’s evening movement.",
    kind: "FLINDERS & SWANSTON",
  },
  {
    title: "Your story starts here.",
    text: "Hold a moment. Then discover a Melbourne of your own.",
    kind: "ONE LAST LOOK",
  },
] as const;
export const boundedProgress = (p: number) =>
  Number.isFinite(p) ? Math.max(0, Math.min(1, p)) : 0;
export function videoFrame(progress: number) {
  const p = boundedProgress(progress);
  const clip = p < 0.5 ? 0 : 1;
  const local = clip === 0 ? p * 2 : (p - 0.5) * 2;
  return {
    p,
    clip,
    local,
    time: Math.min(19.95, local * 20),
    chapter: Math.min(7, Math.floor(p * 8)),
  };
}
export function chapterFromTime(clip: number, time: number) {
  return Math.min(clip * 4 + 3, clip * 4 + Math.floor(Math.max(0, time) / 5));
}
