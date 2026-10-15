# MELB Phase 4 — implementation and verification report

13 October 2026. Main development server: http://127.0.0.1:5173/

## Status

The main-site implementation is integrated. Production build and offline regression checks pass. **Phase 4 is not fully accepted or browser-tested.** Two material limits remain: the browser URL security policy rejects the local preview, and the available aerial photomesh is unsuitable for a polished, continuous pedestrian walk.

| Area | Status |
| --- | --- |
| Existing arrival, city and discovery | Preserved; existing offline regression checks pass |
| Four continuous guided landmark tours | Implemented; mathematical paths and offline compositions inspected |
| Five interactive editorial articles | Implemented in the home-page scroll; DOM interactions checked |
| Navigation and Visit / Study / Live conclusion | Implemented; official resources linked; legacy routes redirected |
| Real textured street environment | Partial: explicitly labelled four-view Bourke Street experiment |
| Unrestricted Free Walk / continuous pedestrian route | Not delivered: captured surfaces fail pedestrian-quality inspection |
| Responsive CSS, WebGL appearance, frame timing, console errors | Implemented/instrumented but live verification blocked |
| Production-quality / 60 FPS claim | Not made |

## Audit and guided-tour repair

The written brief described inconsistent model scale, Flinders Street becoming small, and discontinuity around Federation Square. No new recording file accompanied the Phase 4 message. Those descriptions were treated as user observations, not newly measured browser evidence. The source audit is in `PHASE_4_AUDIT.md`.

Confirmed causes were chapter-threshold wheel input, a 950 ms waiting gate, and a fresh 1.15-second camera interpolation for every chapter command. Each movement restarted independently. Model framing also inherited targets intended for individual hotspots, including inappropriate targets for final wide views.

Changes:

- Precomputed centripetal Catmull–Rom position and target paths for all four landmarks, each with six anchors.
- One bounded progress target per tour. Wheel, touch-accessible range control, direct chapter selection, keyboard and previous/next controls address that same target.
- Damped rendered progress supports continuous forward/reverse movement. No chapter-owned tween or scene remount. Only mode entry blends from the current free camera into the tour.
- Requested chapter and displayed story are separate, so rapid commands do not get overwritten by intermediate camera progress.
- Story copy remains readable during movement; the waiting-message replacement has been removed.
- Free orbit controls are disabled while guided movement owns the camera.
- Desktop framing reserves space for the right story panel; mobile framing raises the subject above the lower panel. Duplicate feature navigation is hidden in Guided mode.
- Hotspot occlusion raycasts run only in Free Explore while the story overlay is closed.

Offline rendering exposed off-centre final shots. The paths were revised to retain architectural context, and the complete render set was repeated. All 44 final frames were inspected as contact sheets: 24 anchor views plus 20 intermediate views. These are Blender renders of the existing landmark assets with the new camera samples, **not screenshots of the browser UI**. They do not prove mobile CSS composition or WebGL lighting parity.

Evidence: `phase4/mcg-camera-review.jpg`, `flinders-camera-review.jpg`, `federation-camera-review.jpg`, `shrine-camera-review.jpg`; individual frames and camera values are in `phase4/tour-frames/` and `phase4/tour-render-cameras.json`.

## Editorial journey and interface

The home page continues from the existing discovery scene into “More than a destination”, then five articles:

1. **Sport — Where passion lives.** MCG, Melbourne Park / Rod Laver Arena and Marvel venue selection, licensed photographs, official guides, map links and MCG 3D entry.
2. **Culture — A city of stories.** Federation Square, Flinders Street, Arts Centre and Royal Exhibition Building selector, contextual copy and connected map/3D actions.
3. **Education — A place for ideas.** A correctly identified State Library photograph, library map action, University of Melbourne / RMIT / Monash comparison, course/campus context and official study links. No rankings or admissions promises.
4. **Lifestyle — Find your rhythm.** Market, garden and cultural-space selector with practical everyday context and destination connections.
5. **Quality of life — More room to belong.** Housing, budgeting, healthcare and employment/relocation topics. Benefits are balanced with costs, commuting and eligibility considerations.

Photographic frames and headings use reversible ScrollTrigger effects with scoped cleanup. Content stays readable without animation and respects reduced motion. Images have explicit dimensions, lazy loading, credits, source links and licence links. They reuse the audited local discovery photography; no Getty imagery or models were copied.

A sticky story index provides map return, article navigation, street-view entry and the final invitation. Menu destinations now follow the actual narrative. Previous standalone routes resolve into the corresponding main-page sections instead of placeholder pages. The final Visit, Study and Live pathways link to useful official resources.

Responsive grids collapse intentionally to one column; controls use existing MELB colours and serif typography. Modal explorers retain keyboard exits and focus restoration. Live overlap, touch and horizontal-overflow checks remain outstanding.

## Getty reference

[Persepolis Reimagined](https://persepolis.getty.edu/) was opened and inspected with the computer/browser tool, including its opening approach and Gate of All Nations chapter. The relevant design principles are architectural scale, a stable horizon, restrained navigation and stories tied to spatial positions. MELB retains its own colours, identity and content. Getty’s handcrafted reconstruction is not evidence that Melbourne’s aerial data supports the same pedestrian fidelity.

## Real captured city experiment

Source: [City of Melbourne 3D textured mesh / photomesh 2020, DataVic](https://discover.data.vic.gov.au/en_AU/dataset/city-of-melbourne-3d-textured-mesh-photomesh-2020), licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

Official metadata states May 2020 capture, MGA Zone 55, AHD and approximately **7.5 cm GSD**. The derived application metadata now reflects this, correcting the earlier user-provided 2 cm note. MGA55 alone still does not establish GDA94 versus GDA2020; that uncertainty is retained.

Only existing derived C4-22 assets are used. Original Downloads OBJ/MTL/JPG/ZIP files were not edited. No additional tiles were downloaded and no handmade street geometry was created.

Inspection:

- Four candidate Little Collins Street eye-height views revealed severe distorted lower façades and road surfaces. That corridor was rejected for the visitor prototype.
- Four Bourke Street Mall views retain a legible street corridor but still show fragmented awnings, distorted trees and gaps. They are usable for a clearly identified data experiment, not a claim of convincing unrestricted walking.
- Candidate street positions were located using the existing OSM geometry projected into the tile’s metre system, with the horizontal-datum uncertainty disclosed. Heights were sampled from the actual high-detail mesh with downward BVH rays, then raised 1.7 metres.
- The prototype covers four fixed positions over approximately 113 metres within the 281 × 281 metre C4-22 tile, in the Bourke Street Mall portion of central Melbourne. This is not a navigable 113-metre pedestrian route; transitions fade between inspected samples, including positions near the tram corridor.
- Fixed positions prevent moving into buildings or unsupported terrain. Free look supports drag, turning buttons and a bounded head tilt. Guided viewpoints support play/pause and previous/next; automatic play is disabled with reduced motion. A small story control provides context at each point.

The interface explicitly states “experimental connected viewpoints”, May 2020, surface gaps and no continuous walk. It uses an actual textured GLB, not a panorama or silent static-image replacement. Dataset and OSM attribution remain visible.

Implementation uses the existing single R3F canvas with a lazy scene, Meshopt geometry and KTX2/Basis textures. One selected detail level is fetched only when opened. Fetches abort on exit/switch; geometries, materials, textures and decoder workers are released on cleanup. Errors leave quality retry and exit available.

| Existing derived asset | Triangles | Transfer bytes | Mesh draw batches | Estimated GPU geometry + textures |
| --- | ---: | ---: | ---: | ---: |
| High | 1,138,007 | 23,060,376 | 17 | 74.5 MB BC / 122.1 MB ASTC 4×4 |
| Light / medium | 218,801 | 5,290,728 | 1 | 16.7 MB BC / 27.9 MB ASTC 4×4 |

These are existing asset measurements/estimates from the photomesh manifest, **not measured browser GPU allocation, draw-call benchmarks or new FPS results**. Light detail further reduces fidelity; pedestrian camera clearance against that LOD remains a browser acceptance check.

Evidence: `phase4/street-eye-*.png`, `phase4/mall-eye-*.png`, `phase4/street-inspection.json`, `phase4/mall-inspection.json`. The inspection script loads a previously derived GLB into Blender for rendering and measurement only; it does not fabricate or edit the source city.

[Google Photorealistic 3D Tiles documentation](https://developers.google.com/maps/documentation/tile/3d-tiles) was evaluated as an alternative delivery route. It requires API setup/billing and attribution, and does not by itself guarantee pedestrian-quality façades. No API account, key, paid request or subscription was enabled. A final street walk needs a licensed ground-level capture with suitable surface coverage, or a separately approved source whose pedestrian quality is actually demonstrated.

## Research and photography

Existing photo authors, licence URLs, Commons source pages and transformations remain in `src/data/discovery-photos.json` and are visible beside the images. All are previously audited local CC photographs, not illustrations mislabelled as campus photography.

Official planning resources reviewed/linked:

- [University of Melbourne international applications](https://study.unimelb.edu.au/how-to-apply/undergraduate-study/international-applications)
- [RMIT international students](https://www.rmit.edu.au/study-with-us/international-students)
- [Monash locations](https://www.monash.edu/study/why-choose-monash/our-locations)
- [Study Melbourne living guide](https://studymelbourne.vic.gov.au/living-here)
- [Live in Melbourne housing](https://liveinmelbourne.vic.gov.au/live/housing-and-property) and [healthcare](https://liveinmelbourne.vic.gov.au/live/healthcare-and-wellbeing)
- [Visit Melbourne](https://www.visitmelbourne.com/), [Study Melbourne](https://studymelbourne.vic.gov.au/) and [Live in Melbourne](https://liveinmelbourne.vic.gov.au/)
- [Melbourne Visitor Booth](https://whatson.melbourne.vic.gov.au/things-to-do/melbourne-visitor-booth) and [official shopping context](https://whatson.melbourne.vic.gov.au/things-to-do/melbourne-shopping-centres)
- [Australian immigration information](https://immi.homeaffairs.gov.au/) for current eligibility, rather than site-authored visa advice.

Sport, architecture and destination claims retain the existing official/source links in the discovery and landmark registries. No dated cost figures, rankings or guaranteed outcomes were added.

## Tests and performance

- `npm run build`: TypeScript and Vite production build passed. The existing large Three.js chunk warning remains (~1.11 MB raw / 309 KB gzip); it is not concealed.
- `npm test`: 21 groups passed — 10 discovery, 6 landmark, 5 Phase 4.
- Guided path tests check 8,008 forward/reverse position samples, continuous chapter tangents, finite targets, minimum height/distance, clamping and rapid input using the same progress target.
- DOM tests cover all four tours and 24 chapter stories, map return-state preservation, article selectors and official links, street mode/point controls, reduced motion, quality retry, keyboard exit and restored focus.
- `npm run test:landmark-assets`: four actual compressed landmark assets decoded successfully; 7,840 existing free-camera arc samples checked. This is distinct from the new guided-path sampling.
- 44 final landmark path frames and eight pedestrian candidate views were rendered offline and inspected. Framing defects found in the first pass were corrected.
- Dev server was observed listening on 127.0.0.1:5173. That observation does not prove browser page rendering.

Performance changes: no per-chapter tween creation, no scene replacement during guided progress, precomputed paths, limited state updates, guided-mode raycasts removed, lazy street scene and geometry, explicit disposal, one active camera controller, offscreen canvas suspension retained, dynamic DPR fallback retained. No new full-city download was added.

A developer performance export is available at `/?bench=1`. After exercising the site, “Save performance report” downloads the most recent 600 rendered frame intervals per scene/mode, average FPS, p50/p95 intervals, long frames, draw/triangle counts, asset-load timing, viewport, canvas count and ScrollTrigger count. These are render intervals, not isolated GPU timestamps. No browser report was collected because access is blocked.

## Outstanding acceptance work

The browser tool rejected the exact localhost URL under its URL security policy. No alternative browser, raw CDP, headless browser, file URL, proxy, screenshot workaround or local HTTP request was used to bypass it. The user’s browser can still display the project independently, but that is not agent verification.

Needed to finish browser QA: restore allowed access to the exact `http://127.0.0.1:5173` origin in the app’s browser/tool permissions. The most recent rejection is a protocol/URL-policy error despite an HTTP URL, so removing an old saved denial alone may not resolve the tool configuration. Once it works, test desktop/laptop/tablet/phone screenshots, full arrival-to-conclusion navigation, all forward/reverse tours, touch interaction, console errors, horizontal overflow, reduced-motion layouts and measured performance. Safari/Chrome/Edge are not claimed tested.

Needed for final street fidelity: a licensed pedestrian-quality capture with a supported route and confirmed horizontal datum. The included bounded experiment is intentionally partial. No payment approval is currently needed to use it; any new paid data/API route would require a concrete proposal and approval.
