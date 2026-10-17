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
- Public deployment tested in Codex’s Chromium-based browser on the current machine after the user explicitly chose public verification.

### Public browser verification — 17 October 2026

- Desktop: 1920×1080 and 1440×900 screenshots captured. At 1920, 24 selected header/article/heading/photo/card/footer boxes retain identical x, width, height, font and colour compared with the pre-change baseline. The sport composition was visually reviewed at both sizes. This is sampled regression evidence, not a pixel-perfect comparison of every scroll frame.
- Film: forward seek to 5.985 seconds, reverse to 3.102 seconds, fast forward across the edit to Flinders at 7.817 seconds. Idle held the same frame and seek count. Replay returned to 0.012 seconds. Skip moved focus to the next chapter. The introductory entrance was then corrected to align the film with the viewport top, without the normal anchor navigation offset.
- Performance sample: 77 completed seeks, mean 11 ms, maximum 39 ms. A rolling 600-frame sample reported 30 fps, 33 ms median / 34 ms p95, no frames over 50 ms. An earlier short sample was approximately 59 fps. Browser scheduling and machine load affect these figures; this is not a guaranteed 60 fps claim or an isolated GPU benchmark. Raw snapshot: `docs/phase5/live-film-metrics.json`.
- MCG: visually checked horizontal drag and upward drag, including the raised viewpoint and stable framing. Flinders zoom worked; Federation Square and Shrine loaded after switching. All four use the same canvas. Exhaustive directions, rapid input and limits for all four are additionally covered by the real OrbitControls offline tests.
- Phone foundation: 390×844, zero horizontal overflow; both 1280-pixel video variants loaded at readyState 4. Landscape footage retains its aspect ratio. This was viewport testing, not a physical iPhone/Android or pinch-gesture certification.
- Console warnings/errors: none in the sampled public session. One canvas, one Lenis owner and 60 ScrollTriggers remained after repeated film entry and landmark switching.
- Reduced-motion branches were reviewed and existing offline checks passed. System-level reduced-motion browser emulation was not available through this browser control; that specific visual acceptance check remains unverified.
- `npm test`: all 26 groups passed. TypeScript and Vite production build passed. The existing large Three.js chunk warning remains.

### Delivery status

The implemented motion, real-film prototype, camera fixes and mobile foundation are published. This is **not full creative acceptance of the requested two-street travelling experience**: continuous Collins Street footage and a travelling Flinders ground-level shot remain missing. The site explicitly identifies the aerial-to-fixed-camera edit and preserves Collins photography with its licences. No paid asset or API was introduced.
