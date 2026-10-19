export const filmClips = [
  {
    id: "melbourne-aerial",
    location: "Melbourne / From above",
    author: "Nick English",
    source: "https://www.pexels.com/video/melbourne-city-17920530/",
    duration: 20,
    portrait: false,
  },
  {
    id: "yarra-approach",
    location: "Yarra / Toward the skyline",
    author: "Tetrakis Sphericon",
    source:
      "https://www.pexels.com/video/aerial-view-on-melbourne-from-suburbs-10006427/",
    duration: 12,
    portrait: false,
  },
  {
    id: "swanston-life",
    location: "Swanston Street / Cathedral precinct",
    author: "Zane Jimenez",
    source:
      "https://www.pexels.com/video/docklands-melbourne-city-victoria-27818095/",
    duration: 12,
    portrait: false,
  },
  {
    id: "hosier-lane",
    location: "Hosier Lane / Street art",
    author: "Pat Whelen",
    source:
      "https://www.pexels.com/video/hosier-lane-with-graffiti-arts-at-melbourne-australia-6547634/",
    duration: 18,
    portrait: false,
  },
  {
    id: "library-dome",
    location: "State Library Victoria / La Trobe Reading Room",
    author: "Joolsmagools ®️",
    source:
      "https://www.pexels.com/video/majestic-dome-of-state-library-victoria-35019145/",
    duration: 10,
    portrait: true,
  },
  {
    id: "shrine-stone",
    location: "Shrine of Remembrance",
    author: "HTJ Media Advertising",
    source:
      "https://www.pexels.com/video/the-sun-is-shining-on-a-monument-with-a-city-in-the-background-28122934/",
    duration: 14,
    portrait: false,
  },
  {
    id: "shrine-axis",
    location: "Shrine Reserve / Looking toward the city",
    author: "HTJ Media Advertising",
    source: "https://www.pexels.com/video/shrine-of-remembrance-28158985/",
    duration: 4,
    portrait: false,
  },
  {
    id: "shrine-gardens",
    location: "Shrine Reserve / City gardens",
    author: "LayG Traveller",
    source:
      "https://www.pexels.com/video/a-park-with-tall-buildings-in-the-background-20260837/",
    duration: 6.5,
    portrait: false,
  },
  {
    id: "st-kilda",
    location: "St Kilda / The pier",
    author: "Camilo Rodriguez",
    source:
      "https://www.pexels.com/video/aerial-view-of-st-kilda-pier-with-crowds-30331412/",
    duration: 14,
    portrait: false,
  },
  {
    id: "yarra-evening",
    location: "Yarra / Southbank",
    author: "Peter Erb",
    source:
      "https://www.pexels.com/video/buildings-in-melbourne-australia-8949504/",
    duration: 16,
    portrait: false,
  },
  {
    id: "flinders-night",
    location: "Flinders Street / After dark",
    author: "Peter Erb",
    source:
      "https://www.pexels.com/video/cars-driving-on-the-busy-road-8949648/",
    duration: 20,
    portrait: false,
  },
] as const;
// Each beat refers to a unique time range. Adjacent beats within a film are continuous.
export const filmChapters = [
  {
    clip: 0,
    start: 0,
    end: 8,
    title: "A city on the horizon.",
    text: "Melbourne opens beneath you. Your scroll sets the pace.",
    kind: "01 / ARRIVAL",
    style: "aperture",
  },
  {
    clip: 0,
    start: 8,
    end: 19.95,
    title: "A thousand possibilities.",
    text: "Towers, railway lines and parklands. One city, many beginnings.",
    kind: "02 / THE CBD",
    style: "drift",
  },
  {
    clip: 1,
    start: 0,
    end: 6,
    title: "Follow the Birrarung.",
    text: "The river draws a green passage toward the skyline.",
    kind: "03 / ALONG THE RIVER",
    style: "wide",
  },
  {
    clip: 1,
    start: 6,
    end: 11.95,
    title: "The city draws closer.",
    text: "A quieter approach. A different sense of Melbourne.",
    kind: "04 / A NEW PERSPECTIVE",
    style: "drift",
  },
  {
    clip: 2,
    start: 0,
    end: 6,
    title: "At the city’s heart.",
    text: "Along Swanston Street, beside St Paul’s Cathedral.",
    kind: "05 / STREET LIFE",
    style: "curtain",
  },
  {
    clip: 2,
    start: 6,
    end: 11.95,
    title: "Take the long way.",
    text: "Stay with the footsteps. Let the street reveal itself.",
    kind: "06 / SWANSTON STREET",
    style: "quiet",
  },
  {
    clip: 3,
    start: 0,
    end: 9,
    title: "Colour outside the lines.",
    text: "Hosier Lane. A city that keeps rewriting its walls.",
    kind: "07 / THE LANEWAYS",
    style: "curtain",
  },
  {
    clip: 3,
    start: 9,
    end: 17.95,
    title: "Look a little closer.",
    text: "Layers of paint, tiny details, and stories at walking pace.",
    kind: "08 / HOSIER LANE",
    style: "drift",
  },
  {
    clip: 4,
    start: 0,
    end: 5,
    title: "Room for curiosity.",
    text: "Inside the La Trobe Reading Room at State Library Victoria.",
    kind: "09 / THE READING ROOM",
    style: "portrait",
  },
  {
    clip: 4,
    start: 5,
    end: 9.95,
    title: "A world above the page.",
    text: "Look up. Light and geometry meet beneath the dome.",
    kind: "10 / STATE LIBRARY VICTORIA",
    style: "portrait",
  },
  {
    clip: 5,
    start: 0,
    end: 7,
    title: "A moment of quiet.",
    text: "The Shrine of Remembrance. Stone, light and reflection.",
    kind: "11 / REMEMBRANCE",
    style: "quiet",
  },
  {
    clip: 5,
    start: 7,
    end: 13.95,
    title: "Written in stone.",
    text: "Move gently along the Shrine’s monumental architecture.",
    kind: "12 / THE SHRINE",
    style: "quiet",
  },
  {
    clip: 6,
    start: 0,
    end: 3.95,
    title: "A city held in view.",
    text: "Looking back toward Melbourne from the Shrine Reserve.",
    kind: "13 / THE CITY AXIS",
    style: "wide",
  },
  {
    clip: 7,
    start: 0,
    end: 6.45,
    title: "Space to breathe.",
    text: "Open lawns and the skyline at the edge of the Shrine Reserve.",
    kind: "14 / CITY GARDENS",
    style: "wide",
  },
  {
    clip: 8,
    start: 0,
    end: 7,
    title: "Beyond the city edge.",
    text: "St Kilda Pier. The city gives way to Port Phillip Bay.",
    kind: "15 / BY THE WATER",
    style: "aperture",
  },
  {
    clip: 8,
    start: 7,
    end: 13.95,
    title: "Stay for the sea air.",
    text: "Trace the curve of the pier, with the bay stretching beyond.",
    kind: "16 / ST KILDA",
    style: "wide",
  },
  {
    clip: 9,
    start: 0,
    end: 8,
    title: "The light changes.",
    text: "Return to the Yarra, beside Southbank’s familiar skyline.",
    kind: "17 / BESIDE THE YARRA",
    style: "curtain",
  },
  {
    clip: 9,
    start: 8,
    end: 15.95,
    title: "Another side of the city.",
    text: "The river holds the last light while Melbourne keeps moving.",
    kind: "18 / SOUTHBANK",
    style: "drift",
  },
  {
    clip: 10,
    start: 0,
    end: 10,
    title: "Meet you under the clocks.",
    text: "Flinders Street Station. A familiar corner, alive after dark.",
    kind: "19 / FLINDERS STREET",
    style: "aperture",
  },
  {
    clip: 10,
    start: 10,
    end: 19.95,
    title: "Your story starts here.",
    text: "Trams, light, movement. A Melbourne to make your own.",
    kind: "20 / AFTER DARK",
    style: "quiet",
  },
] as const;
export const boundedProgress = (p: number) =>
  Number.isFinite(p) ? Math.max(0, Math.min(1, p)) : 0;
export function videoFrame(progress: number) {
  const p = boundedProgress(progress),
    chapter = Math.min(
      filmChapters.length - 1,
      Math.floor(p * filmChapters.length),
    );
  const local = Math.min(1, p * filmChapters.length - chapter),
    scene = filmChapters[chapter];
  return {
    p,
    clip: scene.clip,
    chapter,
    local,
    time: scene.start + local * (scene.end - scene.start),
  };
}
export function chapterFromTime(clip: number, time: number) {
  const matches = filmChapters
    .map((s, i) => ({ ...s, i }))
    .filter((s) => s.clip === clip);
  return (matches.find((s) => time < s.end) || matches.at(-1))?.i ?? 0;
}
/** At most three decoders: target, retained visible film, and a directional neighbour. */
export function nearbyClips(target: number, shown: number, direction: number) {
  const next = target + (direction < 0 ? -1 : 1);
  return [
    ...new Set([
      target,
      shown,
      next >= 0 && next < filmClips.length ? next : target,
    ]),
  ].sort((a, b) => a - b);
}
export function sceneTreatment(chapter: number, local: number) {
  const p = boundedProgress(local),
    style = filmChapters[chapter]?.style ?? "quiet";
  const reveal = Math.min(1, p / 0.22),
    exit = Math.max(0, (p - 0.85) / 0.15);
  const aperture =
    style === "aperture"
      ? 12 * (1 - reveal)
      : style === "wide"
        ? 5 * (1 - reveal)
        : 0;
  return {
    inset: aperture,
    side: style === "curtain" ? 10 * (1 - reveal) : aperture,
    scale: style === "drift" ? 1.035 - 0.035 * p : 1,
    y: style === "drift" ? 1.3 * (1 - p) : 0,
    titleY: 28 * (1 - reveal) - 8 * exit,
    captionOpacity: 0.7 + 0.3 * reveal,
  };
}
