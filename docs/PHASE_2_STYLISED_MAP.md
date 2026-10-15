# Phase 2 — continuous city to exploration map

Historical 5 October implementation. Replaced on 12 October by [Phase 1.5](PHASE_1_5_RECONSTRUCTION.md), using downloaded OSM geography, 22,768 building/part features and eight interactive pins. The schematic generator and earlier assets remain as research.

Implemented on the main homepage, with no query parameter required. This revision follows the user's 5 October change of direction. Photogrammetry conversion scripts, source inspections, LODs and comparison page remain intact; no additional tiles were acquired.

## Experience

- The existing centred typography, single aircraft fly-by and Melbourne destination hold remain. No audio was added.
- Progress 0.55–0.70: the continuous city grows at the Melbourne anchor while its building heights emerge. Camera motion remains in the original arrival canvas.
- 0.67–0.785: cinematic overview and original MELB. editorial headline.
- 0.775–0.92: camera rises and pitches to an exactly vertical, north-up view. Perspective reduces to 28°; this is still a perspective camera viewing a nearly planar surface, not a camera swap.
- 0.805–0.92: building/tree height reduces to 1.5%, lifted slightly above surface layers to keep footprints visible. The material shader progressively removes lighting; cast/received shadows switch off near the end.
- From 0.89: geographic area labels and five landmark pins appear. Hover reveals names, focus/tap opens the preview, Explore expands the introductory information. Escape closes the card. Detailed landmark scenes are not built.

The map uses the **same mesh and X/Z coordinates** as the 3D city. No alternate map image is substituted. Existing scroll reversal naturally reverses these transformations. Marker positions use the actual camera projection each frame.

## Geography and data

This is the explicitly authorised schematic fallback. River/park boundaries, street ribbons, building footprints and heights are approximate. They must not be described as downloaded OSM or surveyed data. Existing landmark coordinates and visitor-reference links were retained; they have not been independently reverified during this revision because browser access remains blocked.

Coverage includes CBD, Southbank, East Melbourne, Melbourne Park, MCG/Yarra Park, Federation Square, Flinders Street, Kings Domain, Shrine and Botanic Gardens, with northern urban fringe and connecting road/rail ribbons. Arena and memorial forms are broad silhouettes only.

`src/data/city-geography.json` owns the local geographic projection and location records. Blender and TypeScript consume its same origin/scales; a local equirectangular approximation is appropriate for this schematic area and is not the photomesh MGA/AHD conversion. Location records include ID, name, category, coordinates, short description, optional preview image, future route, optional model asset, enabled status and detail readiness. Optional image/model values are null until real assets exist; no broken placeholder requests are made. Area label anchors live in `src/data/cityAreas.ts`.

## Verification

- Exported city: **9,240 triangles, 11 merged meshes, 523,068 bytes**, no textures.
- `node scripts/verify-city-map.mjs`: required surface layers, finite bounds, triangle budget, unique location IDs, all locations within city footprint, and all five projected pins within both 390×844 and 1440×900 overhead frames pass.
- TypeScript and production Vite build pass, with the existing large Three.js chunk warning.
- Blender overview and flattened north-up renders were inspected: `docs/city-inspection.png` and `docs/city-map-inspection.png`. These verify exported geometry appearance, not the browser shader or DOM layout.
- The saved localhost browser permission still blocks live browser inspection. Scroll/reversal appearance, console, keyboard/touch behaviour, overlay collisions and FPS remain **unverified in the browser**. Do not report a measured FPS or claim full visual acceptance.

The main scene uses one Canvas and the existing ScrollTrigger timeline. Geometry is shared from the loader cache; route-owned cloned materials are disposed on cleanup. DPR remains capped at 1.5 desktop / 1.25 mobile. No photomesh scene, tile decoder workload or secondary renderer is active on the homepage.
