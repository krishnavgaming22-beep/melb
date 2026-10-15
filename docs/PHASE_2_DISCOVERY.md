# Phase 2 — Interactive Melbourne discovery

Implementation: 12 October 2026. **Integrated; offline checks pass. Live visual, interaction and performance acceptance is pending browser permission.** This report does not certify Phase 2 as fully tested.

## Audit and recording

Reviewed all twelve sampled frames of the supplied 8.90-second recording (`docs/phase2/recording`). It visibly shows the aircraft, Australia arrival, dense Melbourne hero and overhead city with eight numbered indicators. It does not demonstrate landmark selection, gesture handling, reverse scrolling or mobile behaviour. Those were not inferred to be broken from their absence.

Code confirmed eight exposed records, introductory placeholder detail copy, no functional search or themes, and camera focus that added only 20% of a landmark offset without a selection zoom. The phase 1.5 mesh and geographic alignment were already implemented. They were retained.

## Delivered in the main website

- One continuous aircraft → Australia → architectural Melbourne → overhead discovery journey, retaining the original typography, colours, headline and model.
- Revised ascent/compression timings using the existing GSAP timeline and pure shared `cityTransition` function. Camera ascends over 20–90% of the city transition; geometry compresses over 45–70%. UI reveals in a short stagger after the overhead view is established. Heights never become zero; X/Z remain unchanged.
- Twelve selectable destinations. Coordinates remain from the original shared geographic registry, not new estimates.
- One selection store with INTRO, MELBOURNE_3D, TRANSFORMING, MAP_EXPLORE, LANDMARK_FOCUS and LANDMARK_DETAILS modes. Gestures and selection are locked before exploration. No second canvas or camera controller.
- Name, partial-name, abbreviation and category search; Enter selects and Arrow Down reaches the results. Result lists support arrow/Home/End navigation and a clear no-results state.
- All / Culture / Education / Sport / Life filtering, multi-category membership, contextual editorial copy and two compact photographic features in themed lists. The four words in the city hero now lead into their theme.
- Camera focus through the existing camera rig, bounded pan and zoom, reset, context-preserving close and an explicit previous-view restoration action. Switching landmarks preserves the initial exploration context.
- Geographic marker collision suppression, with selected-marker priority. Suppressed markers are still available in the search/list; their positions are not displaced.
- Landmark panels with photographs, introductions, expandable stories, 2–3 sourced facts, why-visit copy, official visitor links and photo credits. No invented schedules/prices or inactive Phase 3 buttons.
- Desktop editorial column and mobile destination browser/bottom sheet. Pointer, keyboard, deliberate modifier-wheel zoom, touch mode and two-pointer pinch; normal wheel remains page scrolling.
- Escape closes expanded content first, then selection. Panel focus and return focus, visible keyboard outlines, lazy image loading, reduced-motion transitions and a skip-to-discovery control.
- Loading timeout/failure notice with access to the destination guide. Photo failures have a labelled fallback. An adaptive DPR reduction activates after three sustained low-FPS samples; its real device effectiveness remains unmeasured.

## Landmarks and content sources

All records have stable IDs, shared coordinates, categories, aliases, camera zoom, sources, photo metadata and nullable future-experience/model references.

| Destination | Main research source |
|---|---|
| MCG | https://www.mcg.org.au/about/history |
| Flinders Street Station | https://www.ptv.vic.gov.au/footer/about-ptv/improvements-and-projects/train-stations/flinders-street-station-upgrade/ |
| Federation Square | https://fedsquare.com/events/20th-anniversary |
| Shrine of Remembrance | https://www.shrine.org.au/history-shrine-remembrance |
| Royal Botanic Gardens | https://www.rbg.vic.gov.au/melbourne-gardens/ |
| Queen Victoria Market | https://qvm.com.au/history/ |
| Marvel Stadium | https://www.marvelstadium.com.au/history |
| State Library Victoria | https://www.slv.vic.gov.au/visit/our-magnificent-spaces/la-trobe-reading-room |
| Eureka Tower / Southbank | https://www.melbourneskydeck.com.au/wp-content/uploads/2024/10/Event-Guide.pdf |
| Rod Laver Arena / Melbourne Park | https://www.melbournepark.com.au/about/our-history/ |
| Royal Exhibition Building | https://museumsvictoria.com.au/reb/deep-dives/history/ |
| Arts Centre Melbourne | https://40.artscentremelbourne.com.au/ |

Additional supporting references are stored with each story and displayed in the panel. Editorial suggestions are distinguished from historical facts. Dates and facts were checked against venue, museum, heritage and transport sources; visitor details link to operators rather than copying changing hours or prices.

## Photography and licensing

All twelve photographs are relevant Commons images. Each was inspected visually. `src/data/discovery-photos.json` retains the author, file-description source, CC licence URL and modifications. The panel displays attribution and the licence. CC BY-SA derivatives retain their source licences. Original downloaded images and API metadata are retained in `assets/discovery`; the user's source assets were not changed. A GFDL-only initial Arts Centre candidate was rejected in favour of a CC BY-SA 4.0 photograph.

Local web derivatives total **2,707,987 bytes**, reduced from 5,078,620 bytes. Maximum image dimension is 1,000 px. Portraits use a contained view so the tower/spire remains recognisable. No stock placeholders, hotlinked image dependency or fabricated permissions.

The underlying OSM city remains ODbL, with visible contributor credit and the existing downloadable derived database. Height estimates and geographic limitations from Phase 1.5 still apply.

## Architecture and future use

- `src/data/places.ts`: authoritative combined registry, geographic projection and all twelve enabled destinations.
- `src/data/discovery.ts`: theme copy, facts, narrative, categories, aliases, visitor sources and camera settings.
- `src/data/discovery-photos.json`: licensed local imagery.
- `src/scenes/CityScene/discoveryStore.ts`: shared filtering, modes, selection and view restoration; React subscribes only to interaction changes.
- `src/scenes/CityScene/markerLayout.ts`: coordinate-preserving collision logic.
- `CameraRig.tsx`: sole owner of camera transforms. Frame interpolation does not rebuild geometry.
- `CityInterface.tsx` / `discovery.css`: editorial discovery UI and responsive detail presentation.

For Phase 3, extend a destination's model/future-experience reference and reuse its ID, coordinates, selection and information panel. No detailed landmark scenes were created in this phase.

## Verification and measured costs

`npm run build`: TypeScript and Vite production build pass. The existing Three.js chunk still triggers Vite's size advisory (~1.11 MB uncompressed / 309 kB gzip); it is not a build error.

`npm test`: nine groups of offline Node + jsdom checks pass. They exercise the real React interface and registry: all twelve panels, facts and links, search/Enter/no-results, five filters and pin visibility, repeated selections, previous view restoration, reset, zoom, keyboard panning, pointer drag, pinch, normal-wheel behaviour and gesture lock. This is DOM simulation, not a browser or WebGL render. Results: `docs/phase2/offline-tests.json`.

`node --experimental-strip-types scripts/verify-city-map.mjs`: decodes the actual GLB and checks all 1,287,611 vertices, geographic invariance under the height morph, layer clearance, bounds and portrait/desktop pin projection. Geometry remains **578,259 triangles / 115 mesh batches / 5,873,788-byte GLB / 15,911,133 decoded buffer bytes**. These are geometry costs, not complete GPU memory or draw-call measurements.

No actual Phase 2 browser FPS, load-time, console-error or visual-layout claims are made. The local server was confirmed listening on 127.0.0.1:5173, but the browser tool rejected access due to a saved user denial. The requested retry also failed. No alternate browser, raw HTTP, CDP or other workaround was used for that denied target.

## Required live acceptance pass

After clearing the exact localhost Browsing denial in the browser permissions table, verify:

1. Full journey and partial forward/reverse scrolls at desktop and mobile sizes; one canvas and no console/network errors.
2. Every landmark pin/result, all categories, abbreviations, no-results recovery, image loading, expanded stories and official links.
3. Rapid selection changes, selection during animation, reset and previous view restoration; camera targets remain aligned.
4. Drag, wheel, modifier-wheel, keyboard controls, touch pan/pinch and scrolling past the sticky section.
5. Collision behaviour, control/panel overlap, all keyboard focus paths and reduced motion.
6. Screenshots of hero, mid-transition, overhead, MCG details, each theme and mobile sheet.
7. Measured FPS, calls and loading on the current machine, plus Chrome/Safari/Edge only where actually available.

Current limitation: **implementation is available locally, but final visual acceptance and performance tuning remain pending this access.** No Phase 2 screenshot has been substituted with a mockup or earlier recording.
