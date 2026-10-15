# Phase 2.1 — reconstruction review

**Superseded on 12 October 2026:** [Phase 1.5 implementation and verification](PHASE_1_5_RECONSTRUCTION.md) now documents the active homepage. It uses real OpenStreetMap footprints and geographic layers rather than the schematic fallback or photomesh.

## Current direction — 5 October 2026

The latest user brief supersedes the photogrammetry-first strategy below. The main website now uses a continuous stylised central-Melbourne model, with a progressive camera rise, height flattening, flat-colour map and interactive landmark pins. Photogrammetry is preserved as separate research and is not loaded by the homepage. See [current implementation](PHASE_2_STYLISED_MAP.md). The historical inspection notes below are retained for reference, not as current development instructions.

Status: user-supplied C4-22 and C5-34 photomesh sources inspected; isolated C4-22 textured GLB and Blender render test created. See [inspection report](phase21-review/photomesh/INSPECTION.md). No photomesh has been integrated into the main scroll sequence. Browser validation remains blocked, and official CRS metadata/tile index are still needed. No Phase 2.1 replacement is claimed complete.

## Recording review

The supplied 9:42 recording is 7.932 seconds long and contains 270 decoded frames with variable presentation timestamps. Every frame was inspected in consecutive contact sheets. Selected frames are retained in `phase21-review/current-sequence.jpg`.

- 0–1.93 s: established opening and aircraft choreography. Preserve this sequence.
- 1.93–3.38 s: Australia overview and destination approach. Preserve the timing.
- 3.40–3.82 s: destination title and country-scale descent.
- 3.85–4.07 s: a small pale city slab replaces the geographic view. This is the main scale and realism break.
- 4.13–5.05 s: the editorial headline works, but the city is low contrast, visibly bounded and composed of repeated generic blocks.
- 5.08–5.38 s: the camera rotates upwards while mesh heights collapse. Spatial continuity exists only within the invented model.
- 5.40–5.93 s: the map is too sparse to explain Melbourne. The Gardens preview appears under the stationary pointer as the interface enters; hover should not automatically open a card during the reveal.
- 5.95–7.93 s: final map/footer; no reversal or viewport-resize evidence is present in this recording.

## Existing architecture

One R3F Canvas, one ScrollTrigger, and one mutable journey state drive the full arrival. The phase-one segment occupies progress 0–0.58. `CameraRig` currently combines the flight and city camera. `CityScene` loads a 392 KB GLB, scales it from a tiny model to full scene size, then compresses the Y scale of nodes named `Mass*` to 2.5%. The final map is this flattened asset, not independent cartographic data.

The existing shared landmark configuration is useful, but its manually entered coordinates have not been verified against authoritative records. Its approximate local projection must be replaced by the same documented CRS transform used by both the new mesh and cartographic data.

The new large city must not sit under the same loading Suspense boundary as the opening aircraft: currently either model can delay the entire scene. Separate loading readiness without duplicating the canvas or animation loop.

## Source comparison

| Source | Realism and coverage | Delivery/performance | Fit and constraints |
|---|---|---|---|
| Official City of Melbourne 2020 photomesh | Captured textured buildings, vegetation and terrain; municipal coverage | OBJ/MTL/JPG tiles with L13–L20 detail levels; index and origin metadata supplied | Preferred candidate. CC BY 4.0 according to catalogue. Inspect tile index, exact CRS, licence/disclaimer and coverage before acquisition. Raw byte sizes and landmark coverage are not yet verified. |
| Google Photorealistic 3D Tiles through Cesium or a compatible renderer | Photoreal geographic scene with streamed levels of detail | View-dependent tile loading, screen-space error and memory-budget controls | Alternative. Requires billing-enabled Map Tiles API access and a restricted API key, or configured Cesium ion access. No project credentials supplied. Attribution must remain visible; caching/extraction/offline restrictions apply. Do not export these tiles to Blender. |
| Official 2023 building footprints | Real boundaries with stacked forms for towers, podiums and setbacks | Bounded GeoJSON/vector processing is feasible | Useful map enrichment or accurate low-detail geometry, not a textured-city substitute. CC BY according to catalogue; cross-year differences against 2020 mesh need assessment. |
| OpenFreeMap / MapLibre vector cartography | Candidate for detailed roads, districts, parks, water and wider context | Tiled vector rendering and zoom-dependent styling | Candidate map source; inspect Melbourne coverage, attribution and endpoint behaviour before selection. Provider data must be projected into the same coordinates as the city. |

Sources:

- [Official 2020 photomesh catalogue](https://discover.data.vic.gov.au/en_AU/dataset/city-of-melbourne-3d-textured-mesh-photomesh-2020)
- [Google Photorealistic 3D Tiles setup](https://developers.google.com/maps/documentation/tile/3d-tiles)
- [Google Map Tiles policies](https://developers.google.com/maps/documentation/tile/policies)
- [Cesium tile memory and detail controls](https://cesium.com/learn/cesiumjs/ref-doc/Cesium3DTileset.html)
- [2023 building footprints catalogue](https://discover.data.vic.gov.au/dataset/2023-building-footprints)
- [OpenFreeMap quick start](https://openfreemap.org/quick_start/)
- [MapLibre shared-context Three.js / 3D Tiles example](https://maplibre.org/maplibre-gl-js/docs/examples/add-3d-tiles-using-threejs/)

## Preferred implementation, pending asset inspection

Use selected official photomesh tiles, retaining their texture and real dimensions. Blender's role is inspection, crop validation and optimisation—not city invention. Select the tile set from actual view frusta covering the CBD, Southbank and eastern landmark zone, with surrounding margin to keep cut edges outside the image. Check municipal coverage before promising all requested landmarks.

Keep the current R3F renderer if practical. Convert selected tiles to independently loadable GLBs with geographic bounding boxes, coarse-first LODs and device texture tiers. Keep the original files outside `public`. Only processed, budgeted delivery assets enter the website. Estimate download/GPU cost from an actual representative tile before choosing final budgets.

Use a single documented geospatial transform for mesh vertices, map features and landmark anchors. Read the photomesh origin and source CRS from metadata; do not infer GDA94 versus GDA2020 from “MGA55” alone. Validate alignment at at least five geographically separated anchors, including river bends and bridges.

Preserve the existing scroll value and flight interval. Replace only the city camera segment with an oblique aerial view followed by continuous camera ascent, progressive tilt towards nadir and a wider extent. Do not squash the photogrammetry. Introduce aligned map features only as the camera approaches overhead; reduce city prominence through distance, LOD and a restrained depth/opacity transition. Reverse all effects directly from the same progress value.

Preserve the editorial typography and progress UI. Use local legibility treatments over the real city rather than bleaching the city materials. Keep mandatory source attribution visible. The city should extend beyond the viewport, with no artificial slab.

For the final map, maintain strong water/land/park separation, real roads and bridges, zoom-dependent detail, and sparse landmark labels. Wider bay or airport context is conditional on the final geographic extent; do not force it into a CBD crop.

## Blocking conditions

The desktop browser tool reports saved user permission denials for the official Melbourne data domain and localhost. The 2020 DataVic catalogue was also rejected during this phase. No attempt was made to retrieve blocked assets through another tool or endpoint.

The plugin-permissions connector does not expose these desktop browser per-site rules: it reported the desktop Browser and Computer plugin identifiers as not installed in its ChatGPT scope. This is not evidence that the working desktop tools are absent; their per-site restrictions remain unresolved.

Required next input: clear the saved browser denials, or supply lawfully downloaded tiles together with their metadata, tile index, textures and licence. If choosing Google/Cesium instead, provide configured credentials through a local environment file and clarify the billing allowance; never paste secret credentials into a public source file.

## Completion gate still outstanding

Acquire and inspect real assets; verify coverage and coordinates; replace the rejected primary visual; implement aligned map detail; measure device-tier loading and rendering; test forward/fast/reverse scrolling, repeated entry and route cleanup; inspect resize/mobile/reduced-motion behaviour; capture four actual browser views (oblique, halfway, near-nadir, final map). Build success alone does not satisfy this gate.
