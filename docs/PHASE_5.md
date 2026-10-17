# MELB Phase 5 — motion and moving photography

## Scope and design contract

Work began from published commit `2c608aa`. Existing fonts, colours, article order, content, desktop grids, gutters, header and cards are retained. The intended exceptions are street-film content, motion states and camera controls. Before screenshots at 1440×900 and 1920×1080 are in `docs/phase5/before-*-{home,sport}.jpg` (local evidence; not shipped).

React 19 / TypeScript / Vite; GSAP + ScrollTrigger; one Lenis instance; existing R3F canvas for arrival, map and landmarks. No second WebGL scene manager was introduced. Original OBJ/source photographs remain untouched.

## Reference audit

- https://lenis.dev/ and https://github.com/darkroomengineering/lenis: retained documented Lenis scroll → ScrollTrigger.update and GSAP ticker → Lenis.raf integration. Native touch inertia remains enabled; no second scrolling loop.
- https://studentos.me/: observed its opening, story-chapter controls and landing content through the browser. A subsequent interaction timed out; no assumptions about its internal technology.
- Local Cryptex `dist/premiumMotion.js`: inspected masked lines, shared GSAP ownership, reversible clipping, card staging and reduced-motion cleanup. Reused those principles; no financial visual design or content.
- Requested YouTube Bks6RkYWyw4 was inaccessible through the research tool. Used the written camera/motion requirements. No YouTube footage downloaded or redistributed.
- Previous Phase 4.1 evidence already established that aerial photomesh is unsuitable at pedestrian height. No new route through damaged facades.
- The two October 17 recordings were named in the brief but no paths were supplied or found in the project search. They were not claimed as reviewed.

## Motion architecture

`useEditorialMotion.ts` owns reusable maskedHeadline, imageReveal and animatedCaption primitives. GSAP SplitText supplies accessible line masks, word staggering, automatic font/width reflow and restoration. Every resting transform resolves to the original geometry. Paragraphs move as groups. Articles, photo masks, captions and final cards use reversible scrubbed progress. Desktop includes restrained magnetic links; compact viewports reduce travel and omit section clipping. Reduced motion bypasses the splitting/timelines entirely. Existing arrival master timeline now also owns its child typography.

Single Lenis instance, stable scroll context, menu/landmark scroll locks, context-managed GSAP cleanup. Cursor keeps the native pointer, yields to inputs/canvas, respects reduced motion and stops work outside the page.

## Actual street implementation — limitations explicit

The previous moving-still slideshow has been removed from the main cinematic section. Two real films now provide forty seconds of scroll-addressable footage across eight caption beats:

1–4: Nick English’s moving Melbourne aerial (Pexels 17920530).
5–8: Peter Erb’s **fixed-camera** Flinders Street night traffic (Pexels 8949648).

The cut is editorial and moves from sunset aerial to night; it is not a continuous physical walk. Flinders has real motion in the scene but no travelling ground-level camera. **A free, suitable Collins Street tracking film remains an asset dependency.** Its original licensed photographs and eight original view descriptions are preserved in an expandable architectural notebook, with no simulated movement and no 3D claims.

Individual source pages state Free; Pexels License permits website use and editing. Full per-file source, author, licence, zero cost and modifications: `public/assets/streets/video/SOURCES.json`. No API or paid subscription. Source originals are ignored in `assets/streets/source/video/`.

### Decoding and loading

H.264, yuv420p, 24 fps, 6-frame GOP (0.25 seconds), no B frames, faststart. 1080p desktop and 720p mobile. Local assets; no hotlinked video service. `prepare-street-video.py` produces derivatives without altering originals.

`VideoScrubber` queues only the latest target. It gates on metadata, seekable ranges and an idle decoder. A seeked event commits the displayed time; captions follow that committed time. No autoplay; stopping scroll holds a frame; reversing requests earlier times. One shared GSAP ticker callback services two maximum video elements only while near the section. No image-sequence frame cache. Seeking ends before the final undecodable frame. A real first-frame poster and last decoded video remain visible while loading; errors preserve skip/notebook navigation. Reduced-motion users choose eight static film moments with previous/next/replay rather than forced scroll movement.

The film viewport uses native CSS sticky, one ScrollTrigger, 650svh desktop / 450svh mobile (formerly 900/700). No extra canvas or new RAF. Replay, skip and source links remain keyboard accessible. Mobile shows the full landscape image rather than stretching/cropping it into portrait.

Approximate download sizes: desktop 52.58 MB total, mobile 28.77 MB total; these are network file sizes, **not** measured GPU memory. Two decoded 1080p RGBA frames alone would be ~15.8 MiB, but browser decoding/buffering uses additional unmeasured memory. Both clips are prefetched only near the journey.

## Landmark direction and stability

Two causes addressed:

1. OrbitControls captured its orientation quaternion before the arrival/map camera’s up vector was reset to world Y. Controllers are now constructed after that reset.
2. Default object-grab drag direction opposed the site's camera-direction buttons. Camera-relative steering now uses negative rotation speed: right drag moves viewpoint right; upward drag raises it. UI states this interaction model.

Existing limits, zoom, target framing and exterior transition arcs remain. Damping is frame-updated; residual orbit input is drained before a scripted camera transition. No free-flight, roll or unrestricted panning added.

Real OrbitControls tested under synthetic pointer events for MCG, Flinders, Federation Square and Shrine: both horizontal directions, upward movement, inherited map up-axis, polar limits, rapid input and settling. This is meaningful mathematical/input testing, not a substitute for visual WebGL checks.

## Verification status

- TypeScript and production build passed.
- Existing discovery, landmark and editorial regression groups retained.
- New tests cover 10,001 film progress samples, caption boundaries, forward/reverse seeks, latest-target coalescing, decoder readiness, idle behaviour, end-frame clamp, media cleanup, four-landmark pointer controls and local licensed media variants.
- Local browser navigation to the exact requested localhost was rejected by a saved user permission. User was asked to clear it; no alternate origin/browser/CDP workaround used.
- Desktop comparison, live decoder performance, WebGL visual interactions, phone and reduced-motion browser checks must be recorded below when actually performed. Do not equate unit tests with these checks or claim the full Phase 5 creative target achieved.
