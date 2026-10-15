# Phase 3 — Landmark explorer

Implemented 13 October 2026. **Browser acceptance remains open.**

## Using the experience

Open the existing home page at `http://127.0.0.1:5173/`, reach Discover Melbourne, select The MCG, Flinders Street, Federation Square or The Shrine, then choose **Enter the 3D experience**. The existing arrival sequence and all twelve map destinations remain available.

Each flagship has Free Explore, six guided chapters, six feature targets, an illustrated story, sources, reset/zoom controls and landmark switching. Return to Melbourne restores the previous selection, filter, query, map target and zoom; it does not restart the arrival.

## Architecture and motion

- `src/scenes/LandmarkExperience/registry.ts`: four records, 24 shared chapter/hotspot descriptions, camera targets and references. The existing `places` registry remains the identity and geography source.
- `store.ts`: entering/exploring/exiting states, free/guided modes, story visibility, cancellation tokens and visited features. Late camera completions cannot overwrite a newer selection. A new scene cancels a pending exit.
- `LandmarkScene.tsx`: mounted inside the existing canvas, replacing the arrival scene's camera owner while active. No second canvas, RAF loop or ScrollTrigger is created. OrbitControls and the guided camera controller share the same camera and target.
- `cameraPath.ts`: eased spherical travel around the exterior envelope instead of a straight line through the building. Orbit pitch/distance and an outer-envelope constraint prevent entry into the main masses. This is conservative aerial exploration, not interior navigation.
- `assets.ts`: abortable loads, 25-second scene timeout, Meshopt decoding, a two-model LRU cache, and disposal on eviction. Models load only when entered. No four-model initial download.
- `LandmarkInterface.tsx`: modal focus handling, Escape, keyboard camera movement, direct chapter buttons, visible feature index, source links and image attribution. Touch orbit/pinch comes from OrbitControls; mobile guided chapters use explicit controls. Desktop wheel progression is throttled and reversible, with no queued chapter storm.
- `landmark.css`: MELB ivory/stone/blue-grey palette, editorial serif headings, compact mode switch, floating markers, responsive feature rail and bottom panel. Reduced motion removes decorative transitions and completes camera travel immediately.

Map selection performs the existing geographic focus. Entry then uses a short atmospheric mask before substituting the detailed local study; the camera settles over 1.8 seconds. Chapter movements take 1.15 seconds. These are separate architectural studies linked by the same landmark IDs, **not a seamless georeferenced zoom into a surveyed city mesh**. Returning restores the map camera target directly.

The Lenis instance pauses while the explorer is open. Rendering stops while the illustrated story is open or the document is hidden. Marker projection updates every frame; geometric occlusion checks are staggered to reduce CPU work. Slow frame windows reduce DPR to 1. Browser counters exist in `landmarkMetrics`; no observed browser FPS is reported here.

## Assets and fidelity

Blender sources: `assets/blender/landmarks/{mcg,flinders,federation,shrine}.blend`.
Web exports: `public/assets/landmarks/*.glb`.
Reproducible authoring: `scripts/build-landmarks.py`.
Compression: `scripts/optimise-landmarks.mjs` using the existing local glTF tooling under `.photomesh-test/tooling`.

These are original **reference-based architectural studies**, not scans, survey models or replicas of the Getty reference. Fine details, planting, materials and most heights are estimated. No fictional interiors or third-party proprietary models were used. Original uploaded photomesh folders were not modified.

- **MCG:** oval field, mowing bands, cricket pitch, three seating levels, stepped rows and aisles, split roof profiles, radial supports, concourse bands, six lighting towers and simplified park context. The stand façade and roof articulation remain simplified compared with the real stadium.
- **Flinders Street:** long brick/ochre façade, repeated arches and pilasters, corner dome and ribs, smaller cupolas, entrance clocks, clock tower, platforms, canopies and tracks. Sculptural ornament, the corner pavilion's exact angled plan and much of the side elevation remain simplified. It should not be described as a high-fidelity surveyed reconstruction.
- **Federation Square:** actual mapped footprints for ACMI, SBS, NGV Australia, Atrium, Birrarung Building, Crossbar, Deakin Edge and Zinc. Estimated heights, triangulated façade panels and simplified roof forms. The actual pinwheel façade and glazed structure are more intricate than this study.
- **Shrine:** plinths, steps, porticoes, fluted columns, pediments, block courses and stepped roof; simplified garden context. Figurative sculpture and interiors are deliberately omitted rather than invented.

The architectural detail is substantially greater than city-scale massing, but the supplied photorealistic/interior reference standard has **not** been achieved. Further artist refinement and in-browser composition review remain necessary for final visual acceptance.

### Measured asset complexity

| Model | Triangles | GLB bytes | Material batches | Decoded geometry bytes | Node decode ms |
|---|---:|---:|---:|---:|---:|
| MCG | 91,028 | 833,600 | 15 | 2,262,729 | 13 |
| Flinders Street | 51,965 | 563,352 | 12 | 1,507,755 | 5 |
| Federation Square | 17,570 | 214,692 | 9 | 432,381 | 2 |
| Shrine | 18,560 | 218,484 | 7 | 437,232 | 4 |

Meshopt compression and vertex quantisation preserve triangle counts. No decimation was needed at these budgets. Material batching keeps the model draw-call contribution low; shadow passes and the scene plane add calls at runtime. Models use material colours rather than bitmap textures (zero model texture bytes). Photographs load in the DOM story view. Decoded geometry is attribute/index payload, **not total GPU or application memory**. Node decode timing is a local CPU measurement, **not browser load time**.

Source metrics are in `public/assets/landmarks/manifest.json`.

## Sources and reuse

Photographs reuse the existing audited CC-licensed local photographs. Credits, source links, licence links and transformation notes are retained in the story. See `src/data/discovery-photos.json` for individual authors and licences.

Architectural and historical references:

- MCG: https://www.mcg.org.au/about/history
- MCG light towers: https://www.mcg.org.au/about/stadium-operations/light-towers
- Portable pitches: https://www.mcg.org.au/about/stadium-operations/portable-cricket-pitches
- Flinders Street heritage record: https://vhd-dr.heritage.vic.gov.au/places/64960/download-report
- University of Melbourne encyclopedia: https://www.emelbourne.net.au/biogs/EM00587b.htm
- Federation Square: https://fedsquare.com/history-design
- Shrine architecture: https://www.shrine.org.au/architecture-symbology-and-shrine
- Shrine roof: https://www.shrine.org.au/shrine-stories-roof
- Shrine architects: https://www.shrine.org.au/designing-remembrance-podcast
- Shrine history: https://www.shrine.org.au/history-shrine-remembrance

Federation Square footprint data: © OpenStreetMap contributors, ODbL 1.0, from the existing Phase 1.5 source. A downloadable GeoJSON source is included at `public/assets/landmarks/federation-footprints.geojson` and linked in the story. Its local origin is 144.9695° E, 37.8179° S, using the project's existing 88,000/111,000 metres-per-degree approximation. Blender exports at 20 metres per scene unit. This approximation must not be represented as a cadastral/survey transform.

## Verification

- `npm run build`: TypeScript and Vite passed. Existing large Three.js chunk warning remains.
- `npm test`: ten existing discovery test groups plus six new landmark groups passed. New coverage includes all 24 chapters, reverse navigation, mode handoff, zoom/reset commands, keyboard controls, stories/photos, source data, four entry buttons, return-state preservation, focus restoration, stale completions, interrupted exits and asset failure content.
- `npm run test:landmark-assets`: all four compressed GLBs decoded, finite positions/normals present, expected bounds and triangle budgets; 7,840 camera arc samples checked, and all chapter targets project centrally at three aspect ratios.
- Blender Cycles renders for all four models inspected. Inspection led to corrected linear colour handling, ring winding and replacement of Federation Square's initial approximate arrangement with actual OSM footprints. Renders are in `docs/phase3/models/`. These are **offline asset renders**, not browser screenshots.
- Dev server observed listening on `127.0.0.1:5173`.

### Still unverified / incomplete

Live WebGL rendering, actual browser FPS/load time/GPU usage, Safari/Chrome/Edge behaviour, mobile CSS composition, pinch interactions, marker occlusion quality and end-to-end camera/scroll continuity have not been visually tested. The browser tool's saved denial for `http://127.0.0.1:5173` remains unresolved; no alternate browser surface, raw CDP, headless browser or local HTTP workaround was used.

To enable the remaining checks, remove the saved denial for the exact origin in the app's browser permission settings or set its **Browsing** permission to **Always allow**, then confirm that access is cleared. Downloads permission is not required for local visual testing. After access is restored, inspect all four intro/hotspot/guided/story views at desktop, laptop, tablet and phone sizes; measure real runtime performance before final acceptance.

Final model fidelity also remains a visual acceptance item, particularly Flinders Street's corner façade and Federation Square's glazing/pinwheel cladding. The implementation is ready for review, **not declared fully tested or complete against every Phase 3 acceptance criterion**.

## Extending the remaining eight destinations

Add an appropriately sourced model and a registry record with bounded camera positions, local feature points and sourced copy. Add the ID to `flagshipIds`, supply Blender provenance/licensing, then run the DOM, geometry and live-browser checks. The shared entry, mode, story, loader and return systems require no separate canvas or landmark-specific controller.
