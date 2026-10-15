import { assetUrl } from "../utils/assetUrl";
import photos from "./discovery-photos.json";
export type Theme = "All" | "Culture" | "Education" | "Sport" | "Life";
export const themes: Record<Theme, { title: string; description: string }> = {
  All: {
    title: "Every street has a story.",
    description: "Twelve places. A thousand ways to make the city yours.",
  },
  Culture: {
    title: "Stories written across the city.",
    description:
      "Read Melbourne through its architecture, stages and shared places.",
  },
  Education: {
    title: "A city of ideas and discovery.",
    description:
      "Follow your curiosity into libraries, living collections and places of memory.",
  },
  Sport: {
    title: "Where the city comes alive.",
    description:
      "From the cricket oval to centre court, discover the places that bring a crowd together.",
  },
  Life: {
    title: "Find your own Melbourne.",
    description:
      "Make time for a garden path, a market morning and a different view of the river.",
  },
};
type Story = {
  categories: Exclude<Theme, "All">[];
  aliases: string[];
  intro: string;
  story: string;
  facts: string[];
  whyVisit: string;
  visit: string;
  sources: string[];
  zoom: number;
};
export const stories: Record<string, Story> = {
  mcg: {
    categories: ["Sport", "Culture"],
    aliases: ["MCG", "cricket", "football", "the G"],
    intro:
      "A gathering place on a grand scale. The MCG holds generations of Melbourne’s sporting memories.",
    story:
      "Cricket and Australian rules football share this ground with a much wider sporting history. Its great oval sits within Yarra Park, connecting the city’s skyline to an open landscape of trees and pedestrian paths.",
    facts: [
      "Established in 1853.",
      "Hosted the 1956 Olympic Games and the first cricket Test in 1877.",
    ],
    whyVisit:
      "See the stadium in the context of Yarra Park, or plan a match-day visit to experience its atmosphere.",
    visit:
      "Check the official website for fixtures, stadium tours and entry arrangements.",
    sources: [
      "https://www.mcg.org.au/about/history",
      "https://www.dcceew.gov.au/parks-heritage/heritage/organisations/australian-heritage-council/national-heritage-assessments/mcg",
    ],
    zoom: 2.5,
  },
  flinders: {
    categories: ["Culture", "Life"],
    aliases: ["Flinders", "station", "trains"],
    intro:
      "A familiar meeting point at the edge of the city, where railway life meets the river.",
    story:
      "Flinders Street Station anchors the corner of Flinders and Swanston streets. Its long railway footprint follows the northern bank of the Birrarung, opposite Southbank and beside Federation Square.",
    facts: [
      "The present station building was completed in 1910.",
      "Its restored exterior returns to the original 1910 colour scheme.",
    ],
    whyVisit:
      "Study the façade and clocks, then use the surrounding river crossings to explore both sides of Melbourne.",
    visit:
      "This is a working railway station. Consult the transport operator for services and accessible travel information.",
    sources: [
      "https://vhd-dr.heritage.vic.gov.au/places/752/download-report",
      "https://www.ptv.vic.gov.au/footer/about-ptv/improvements-and-projects/train-stations/flinders-street-station-upgrade/",
    ],
    zoom: 3,
  },
  federation: {
    categories: ["Culture", "Life", "Education"],
    aliases: ["Fed Square", "Federation", "ACMI", "NGV"],
    intro:
      "Melbourne’s public living room: an angular meeting place for art, ideas and everyday city life.",
    story:
      "Fed Square brings cultural institutions and an open civic space together beside the Birrarung. Its contemporary architecture creates a sharp contrast with the station across the road, making this a rewarding place to pause and look around.",
    facts: [
      "Opened to the public on 26 October 2002.",
      "The precinct includes ACMI, the Ian Potter Centre: NGV Australia and Koorie Heritage Trust.",
    ],
    whyVisit:
      "Combine a public-space visit with art, screen culture or an exhibition, using the square as your starting point.",
    visit:
      "Consult Fed Square and individual institutions for current exhibitions and access details.",
    sources: [
      "https://fedsquare.com/events/20th-anniversary",
      "https://fedsquare.com/media-centre",
    ],
    zoom: 3,
  },
  shrine: {
    categories: ["Culture", "Education"],
    aliases: ["Shrine", "war memorial", "remembrance"],
    intro:
      "A place to pause, remember and understand the human stories behind Victoria’s memorial.",
    story:
      "The Shrine was created in the aftermath of the First World War as a place of collective remembrance. Its position in the Domain gives the monument space and a deliberate relationship to the city beyond.",
    facts: [
      "Dedicated on 11 November 1934.",
      "Originally built to remember Victorians killed in the First World War.",
    ],
    whyVisit:
      "Take time for the memorial’s architecture and the history it asks visitors to reflect on.",
    visit:
      "This is a commemorative place. Check the official programme and visitor guidance before arriving.",
    sources: [
      "https://www.shrine.org.au/place-peace",
      "https://www.shrine.org.au/history-shrine-remembrance",
    ],
    zoom: 2.8,
  },
  gardens: {
    categories: ["Life", "Education"],
    aliases: ["Botanic", "Botanical", "gardens", "nature"],
    intro:
      "A slower Melbourne, shaped by garden paths, lakes and living plant collections.",
    story:
      "The Melbourne Gardens form a green counterpoint to the nearby city skyline. Wander with time to notice changes in planting, light and scale rather than treating the gardens as a route to rush through.",
    facts: [
      "The Melbourne Gardens site was founded in 1846.",
      "The gardens cover approximately 38 hectares.",
    ],
    whyVisit:
      "Choose a gentle walk and discover how a botanic garden brings plants, landscape and learning together.",
    visit:
      "Check official visitor information for current access, guided walks and garden conditions.",
    sources: [
      "https://www.rbg.vic.gov.au/melbourne-gardens/",
      "https://rbgvupgradestorage.blob.core.windows.net/media/xk3k0fz1/rbg251-living-collections-plan-fa-r2.pdf",
    ],
    zoom: 2.2,
  },
  market: {
    categories: ["Life", "Culture"],
    aliases: ["QVM", "Queen Vic", "market", "food"],
    intro:
      "A city tradition built around the pleasure of browsing, shopping and meeting people.",
    story:
      "Queen Victoria Market connects Melbourne’s present-day food and shopping culture to a long market history. Explore its sheds and surrounding streets as part of the northern city, leaving room for an unhurried visit.",
    facts: [
      "Officially opened on 20 March 1878.",
      "Markets had operated on the site in different forms before that opening.",
    ],
    whyVisit:
      "Explore Melbourne through its produce, traders and market architecture.",
    visit:
      "Trading days and event schedules vary. Check the market’s official website before planning your visit.",
    sources: ["https://qvm.com.au/history/"],
    zoom: 2.7,
  },
  marvel: {
    categories: ["Sport", "Life"],
    aliases: ["Docklands stadium", "Etihad", "Marvel"],
    intro:
      "A stadium woven into Docklands, bringing major events close to the waterfront.",
    story:
      "Marvel Stadium adds an event-day rhythm to Melbourne’s western edge. Its compact urban setting puts a major sporting venue beside Docklands streets, rail connections and the harbour precinct.",
    facts: [
      "The first event was an AFL match on 9 March 2000.",
      "The stadium has a retractable roof.",
    ],
    whyVisit:
      "Experience an event or explore how the stadium connects the city to Docklands.",
    visit:
      "Consult the venue for events, ticketing, transport and conditions of entry.",
    sources: [
      "https://www.marvelstadium.com.au/history",
      "https://www.marvelstadium.com.au/about-the-stadium",
    ],
    zoom: 2.5,
  },
  library: {
    categories: ["Education", "Culture"],
    aliases: ["SLV", "library", "books", "La Trobe", "dome"],
    intro:
      "A civic home for reading and discovery, with one of Melbourne’s most memorable interiors.",
    story:
      "State Library Victoria offers a different kind of city encounter: a place to look closely, read and learn. The La Trobe Reading Room’s radiating desks and high dome give study an extraordinary architectural setting.",
    facts: [
      "The library opened in 1856.",
      "The octagonal La Trobe Reading Room opened in 1913.",
    ],
    whyVisit:
      "Make time for the library’s architecture and collections, with respect for people using its quiet study spaces.",
    visit:
      "Check current gallery, reading-room and exhibition access on the library website.",
    sources: [
      "https://blogs.slv.vic.gov.au/our-stories/ask-a-librarian/dome-to-catacomb/",
      "https://www.slv.vic.gov.au/visit/our-magnificent-spaces/la-trobe-reading-room",
    ],
    zoom: 3,
  },
  eureka: {
    categories: ["Life", "Culture"],
    aliases: ["Eureka", "Skydeck", "Southbank", "skyline"],
    intro:
      "A vertical perspective on the river and the city, rising above Southbank.",
    story:
      "Eureka Tower is a prominent part of the Southbank skyline. Seeing the tower from the river and looking out from its observation level offer two very different readings of the same Melbourne geography.",
    facts: [
      "Melbourne Skydeck is on Eureka Tower’s 88th floor.",
      "The observation experience offers a 360-degree view of Melbourne.",
    ],
    whyVisit:
      "Connect the streets you have explored with a much wider city panorama.",
    visit:
      "Skydeck is a ticketed attraction. Consult the operator for current booking and access information.",
    sources: [
      "https://www.melbourneskydeck.com.au/wp-content/uploads/2024/10/Event-Guide.pdf",
    ],
    zoom: 3,
  },
  "rod-laver": {
    categories: ["Sport", "Culture"],
    aliases: ["Rod Laver", "Melbourne Park", "tennis", "Australian Open"],
    intro:
      "Centre court energy, in a precinct that changes with the sporting and concert calendar.",
    story:
      "Rod Laver Arena sits within Melbourne Park, east of the city and close to the MCG. Tennis is central to its identity, but the arena also welcomes music and other events throughout the year.",
    facts: [
      "Opened in 1988, originally as Centre Court.",
      "The Australian Open moved from Kooyong to Melbourne Park in 1988.",
    ],
    whyVisit:
      "Discover the relationship between Melbourne’s tennis and cricket precincts, or plan a visit around an event.",
    visit:
      "Event access varies. Check the official arena and Melbourne Park visitor information.",
    sources: [
      "https://www.melbournepark.com.au/about/our-history/",
      "https://ausopen.com/articles/news/concert-tennis-mode-transformation-rod-laver-arena",
    ],
    zoom: 2.7,
  },
  exhibition: {
    categories: ["Culture", "Education"],
    aliases: ["Royal Exhibition", "Carlton", "UNESCO", "exhibition"],
    intro:
      "A monumental reminder of Melbourne’s international ambitions, set within Carlton Gardens.",
    story:
      "The Royal Exhibition Building was created for the great exhibitions that brought ideas, industries and visitors together. Its surviving architecture and garden setting make it a distinct chapter in Melbourne’s civic history.",
    facts: [
      "Built for the 1880 Melbourne International Exhibition.",
      "Hosted the opening of Australia’s first Federal Parliament in 1901.",
      "The building and Carlton Gardens entered the World Heritage List in 2004.",
    ],
    whyVisit:
      "View the building in its garden setting and discover its connection to exhibitions and Australian federation.",
    visit:
      "Check Museums Victoria for tours and current public access; events can affect entry.",
    sources: [
      "https://museumsvictoria.com.au/reb/deep-dives/history/",
      "https://museumsvictoria.com.au/reb/",
    ],
    zoom: 2.7,
  },
  "arts-centre": {
    categories: ["Culture", "Life"],
    aliases: ["Arts Centre", "spire", "theatre", "performance"],
    intro:
      "Beneath the spire, Melbourne’s performing arts find a distinctive architectural home.",
    story:
      "Arts Centre Melbourne’s Theatres Building is a defining presence in the arts precinct. Its spire provides an unmistakable point of orientation near the river, while the venue’s programme connects the building to live performance.",
    facts: [
      "The Theatres Building opened in 1984.",
      "The spire first rose from the site in 1984.",
    ],
    whyVisit:
      "Look at the architecture from the riverside precinct or plan an evening around a performance.",
    visit:
      "Check the official programme and current building access before visiting.",
    sources: [
      "https://40.artscentremelbourne.com.au/",
      "https://www.artscentremelbourne.com.au/-/media/acm/files/about-us/media-centre/media-releases/2024/241001arts-centre-melbournes-theatres-building-celebrates-40-years--media-release.pdf",
    ],
    zoom: 3,
  },
};
export type DiscoveryPhoto = {
  src: string;
  alt: string;
  credit: string;
  license: string;
  licenseUrl: string;
  source: string;
  changes: string;
};
export const discoveryPhotos = Object.fromEntries(Object.entries(photos).map(([id, photo]) => [id, { ...photo, src: assetUrl(photo.src) }])) as Record<string, DiscoveryPhoto>;
export const visitorUrls: Record<string, string> = {
  flinders: "https://www.ptv.vic.gov.au/",
  shrine: "https://www.shrine.org.au/",
  eureka: "https://www.melbourneskydeck.com.au/",
};
