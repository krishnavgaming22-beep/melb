# Phase 4 audit — 13 October 2026

The Phase 4 request contains a written brief and Getty reference URL, but no new recording path. Earlier recordings and reference frames remain available; the reported Phase 3 visual defects are user observations, not new profiler findings.

Confirmed in source:

- Guided wheel input accumulates a threshold, waits for the previous movement to settle, then changes one chapter. This cannot provide continuous scroll-scrubbed motion.
- Every chapter command increments a request token and starts a fresh 1.15-second spherical interpolation. Repeated inputs therefore restart motion; these are separate transitions rather than a shared progress path.
- Paths orbit the world origin while camera targets move independently. The outer-envelope clamp uses a whole-scene radius and can prevent useful architectural close-ups, especially at the long Flinders Street façade.
- Mode entry currently reuses whichever feature was selected, but has no continuous tour progress to preserve.
- The home page ends immediately after discovery. Five editorial articles, a street explorer, final Visit/Study/Live resources and matching main navigation are absent.
- One canvas, one Lenis instance, cached landmark assets, geographic destination registry, audited CC photography, reduced-motion hooks and existing discovery tests are suitable foundations to retain.

Suspected, not profiled: triangle raycasting for hotspot occlusion, first material compilation and model decode may produce long frames. Browser FPS and GPU usage must be measured once access permits; animation timing defects are not evidence of GPU stalls.

Data inspection:

- Original extracted photomesh folders remain untouched. C4-22 has existing derived textured high/medium/far GLBs and audited MGA55 bounds, a 281 m square footprint, AHD heights and May 2020 capture.
- Official DataVic metadata states **7.5 cm** capture GSD, correcting the earlier user-provided ~2 cm note. Horizontal datum still is not explicitly identified by MGA55 alone.
- The official dataset is CC BY 4.0. It is aerial photogrammetry, so pedestrian views, holes and occlusion must be inspected before selecting a supported route.
- Google Photorealistic 3D Tiles requires API setup and billing; no account, paid resource or tile request will be enabled without the requested approval. It is not assumed superior at pedestrian height.

Execution: repair the tour controller first, add the connected editorial journey, then integrate only a supported and honestly labelled real-mesh street experiment. Preserve local source assets and existing successful systems.
