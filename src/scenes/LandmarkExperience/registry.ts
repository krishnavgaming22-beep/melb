import { places } from "../../data/places";
export const flagshipIds = ["mcg", "flinders", "federation", "shrine"] as const;
export type LandmarkId = (typeof flagshipIds)[number];
export type Point = [number, number, number];
export type Feature = {
  title: string;
  text: string;
  point: Point;
  camera: Point;
  source: string;
};
export type Landmark = {
  id: LandmarkId;
  title: string;
  subtitle: string;
  radius: number;
  home: Point;
  target: Point;
  features: Feature[];
};
export const isFlagship = (id: string): id is LandmarkId =>
  flagshipIds.includes(id as LandmarkId);
const mcgSource = "https://www.mcg.org.au/about/history";
const fedSource = "https://fedsquare.com/history-design";
const shrineSource =
  "https://www.shrine.org.au/architecture-symbology-and-shrine";
const stationSource =
  "https://vhd-dr.heritage.vic.gov.au/places/64960/download-report";
// Model coordinates: X east on the architectural study, Y up, Z towards the viewer.
// These are independent local studies. Map positioning remains in city-geography.json.
export const landmarks: Record<LandmarkId, Landmark> = {
  mcg: {
    id: "mcg",
    title: "The MCG.",
    subtitle: "A city, gathered together.",
    radius: 8,
    home: [12, 13, 17],
    target: [0, 1, 0],
    features: [
      {
        title: "The great oval",
        text: "An open playing field at the heart of a great bowl of seating. Cricket and Australian rules football share this Melbourne gathering place.",
        point: [0, 0.12, 0],
        camera: [9, 15, 13],
        source: mcgSource,
      },
      {
        title: "A roof around the sky",
        text: "The stadium’s canopies frame the open arena. This architectural study separates the grandstand roof profiles, radial supports and external concourses.",
        point: [-4.6, 2.1, -2],
        camera: [-13, 10, 12],
        source: "https://www.mcg.org.au/about/stadium-operations",
      },
      {
        title: "A place in the stands",
        text: "From the terraces of earlier grounds to today’s tiered bowl, the spectator experience is central to the MCG. Follow the seating levels as they rise above the oval.",
        point: [4.5, 1.3, 1],
        camera: [12, 13, 11],
        source: mcgSource,
      },
      {
        title: "At the centre",
        text: "The MCG uses portable cricket pitches, prepared off-site and brought into the arena for the cricket season. The centre can then serve other sporting configurations.",
        point: [0, 0.14, 0.4],
        camera: [2, 15, 12],
        source:
          "https://www.mcg.org.au/about/stadium-operations/portable-cricket-pitches",
      },
      {
        title: "Light above the park",
        text: "Six light towers rise around the ground. Their towers are approximately 75 metres high, with head frames bringing the overall height to about 85 metres.",
        point: [6.3, 4.2, -1.75],
        camera: [14, 10, -12],
        source: "https://www.mcg.org.au/about/stadium-operations/light-towers",
      },
      {
        title: "Generations of Melbourne",
        text: "Established in 1853, the MCG hosted the first cricket Test in 1877 and the 1956 Olympic Games. Its setting in Yarra Park connects the stadium to the wider city.",
        point: [-5, 0.4, 5],
        camera: [-13, 14, 18],
        source: mcgSource,
      },
    ],
  },
  flinders: {
    id: "flinders",
    title: "Flinders Street.",
    subtitle: "Meet me under the clocks.",
    radius: 8,
    home: [13, 10, 18],
    target: [0, 0.7, 0],
    features: [
      {
        title: "The city’s front door",
        text: "Flinders Street Station forms a long edge to the city. The present main building was completed in 1910, beside the river and the crossing at Swanston Street.",
        point: [1, 1, 0],
        camera: [13, 10, 18],
        source: stationSource,
      },
      {
        title: "The copper dome",
        text: "The prominent dome marks the corner entrance. Its curved copper roof, ribs and lantern give the station a silhouette immediately recognisable from the street.",
        point: [5.6, 2.15, 0],
        camera: [12, 7, 14],
        source: stationSource,
      },
      {
        title: "Under the clocks",
        text: "The clocks above the main entrance are part of Melbourne’s shared public life. Look for the smaller clock faces beneath the entrance arch and the clock in the pediment.",
        point: [5.6, 0.45, 0.72],
        camera: [11, 6, 14],
        source: "https://www.emelbourne.net.au/biogs/EM00587b.htm",
      },
      {
        title: "A façade in rhythm",
        text: "Red brick, coloured cement detailing and repeated arched openings articulate the long façade. The study draws these elements separately rather than reducing the station to a single block.",
        point: [-1, 0.8, 0.45],
        camera: [-9, 7, 15],
        source: stationSource,
      },
      {
        title: "The working railway",
        text: "Behind the historic façade, platforms and canopies stretch along the railway. This is a working station, with movement and public life continuing around its heritage architecture.",
        point: [-2, 0.3, -2],
        camera: [-12, 12, -15],
        source: stationSource,
      },
      {
        title: "Back to the city",
        text: "The corner of Flinders and Swanston streets links the station, Federation Square and the river. Continue across the map to explore these neighbouring places.",
        point: [6, 0.1, 1.5],
        camera: [15, 12, 19],
        source: stationSource,
      },
    ],
  },
  federation: {
    id: "federation",
    title: "Federation Square.",
    subtitle: "Room for the unexpected.",
    radius: 5.1,
    home: [9, 10, 13],
    target: [0, 0.45, 0],
    features: [
      {
        title: "An open invitation",
        text: "Federation Square opened in 2002. Its public spaces and cultural institutions make it a meeting place at the southern edge of Melbourne’s city grid.",
        point: [-2.8, 0.1, 0.5],
        camera: [-9, 10, 13],
        source: fedSource,
      },
      {
        title: "The public square",
        text: "The open plaza gives people room to gather, pause and watch the city. Its ground plane is as important to the composition as the buildings surrounding it.",
        point: [-2.8, 0.15, 0.3],
        camera: [-8, 7, 10],
        source: fedSource,
      },
      {
        title: "A language of triangles",
        text: "The façades combine sandstone, zinc and glass in a geometric system. Repeated triangular patterns unify the architecture at different viewing distances.",
        point: [2.2, 1.25, -1.3],
        camera: [10, 6, 10],
        source: fedSource,
      },
      {
        title: "The Atrium",
        text: "The glazed Atrium provides a distinct architectural passage through the site. Its structure contrasts with the heavier, patterned envelopes of the surrounding buildings.",
        point: [0.3, 1.1, -2.9],
        camera: [-10, 8, 9],
        source: fedSource,
      },
      {
        title: "Culture in company",
        text: "ACMI and The Ian Potter Centre: NGV Australia are among the cultural destinations at Federation Square. Architecture and public programmes bring different audiences together.",
        point: [-1.38, 1.1, -2.2],
        camera: [-10, 9, -10],
        source: fedSource,
      },
      {
        title: "Between city and river",
        text: "The precinct sits beside Flinders Street Station and the Birrarung. Its riverside edge connects the square to Melbourne’s network of walking routes.",
        point: [0, 0.1, 3.6],
        camera: [-10, 12, 14],
        source: fedSource,
      },
    ],
  },
  shrine: {
    id: "shrine",
    title: "The Shrine.",
    subtitle: "A place to pause. A place to remember.",
    radius: 2.8,
    home: [5, 4.5, 7.5],
    target: [0, 0.65, 0],
    features: [
      {
        title: "An approach through the gardens",
        text: "The Shrine of Remembrance stands within a landscape of gardens and approaches. Its setting offers space for reflection before reaching the monument.",
        point: [0, 0.1, 2.7],
        camera: [5, 5, 8],
        source: shrineSource,
      },
      {
        title: "Steps towards remembrance",
        text: "The broad steps and raised platforms establish the monument’s presence above the grounds. The approach is presented here as a quiet exterior journey.",
        point: [0, 0.2, 1.4],
        camera: [2.8, 2.8, 5.5],
        source: shrineSource,
      },
      {
        title: "Columns and stone",
        text: "Classical forms shape the Shrine’s porticoes. The columns, pediments and stone surfaces are central to its architectural character.",
        point: [0, 0.55, 0.95],
        camera: [2.5, 2.3, 5],
        source: shrineSource,
      },
      {
        title: "A distinctive roof",
        text: "The stepped pyramidal roof completes the monument’s profile. Its design evolved during the planning of the Shrine, becoming a defining part of the building.",
        point: [0, 1.38, 0],
        camera: [-3, 4, 5],
        source: "https://www.shrine.org.au/shrine-stories-roof",
      },
      {
        title: "Designed for remembrance",
        text: "Architects Philip Hudson and James Wardrop designed the Shrine. Their own military service informed their thinking about a place of commemoration.",
        point: [-0.9, 0.7, 0],
        camera: [-4, 4, 6],
        source: "https://www.shrine.org.au/designing-remembrance-podcast",
      },
      {
        title: "A moment of reflection",
        text: "Opened in 1934, the Shrine commemorates service and sacrifice. Return to the wider grounds, and take a moment before continuing through Melbourne.",
        point: [2.3, 0.2, 2.8],
        camera: [6, 7, 10],
        source: "https://www.shrine.org.au/history-shrine-remembrance",
      },
    ],
  },
};
export const landmarkPlace = (id: LandmarkId) =>
  places.find((p) => p.id === id)!;
