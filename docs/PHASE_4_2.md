# Phase 4.2 — motion transformation

Baseline: dc7dcea. Budget: ₹0. No original media or source photomesh changed.

## Reference inspection and audit (19 October 2026)
Lenis was inspected with native forward scrolling: oversized opening typography leaves the composition while the atmospheric background persists; the next split composition pairs a large left heading with a right column. The page visibly changes its composition rather than relying only on opacity. Its official README confirms one GSAP ticker driving Lenis and scroll events updating ScrollTrigger. StudentOS exposes eight story chapters and a persistent story composition; attempting its Capture interaction timed out. No claim is made that its unobserved effects were verified. No reference source code or assets copied.

| Area | Baseline limitation | Implementation target | Progress / reverse | Compact / reduced |
|---|---|---|---|---|
| Opening | Word fades upwards, little spatial transformation | Individual letter separation, large scale and lateral travel; clouds move at separate depths | Existing arrival master, 0–0.24; exact reverse | Smaller travel / no spatial motion |
| Flight | Predictable fixed chase offset | Continuous lateral camera arc and controlled field-of-view approach; deterministic clouds | Existing path retained; no new camera owner | Restrained arc / static framing |
| City/map | Small overview drift | Wider oblique orbit into north-up overhead; title mask and enlarged alignment | Existing city transition, 0.66–0.94 | Reduced orbit / existing map remains |
| Editorial introduction | Static large text | Pinned aperture expands into skyline, giant Melbourne crosses screen, title replaces it | One scoped timeline, top-top to bottom-bottom | Shorter sticky passage / all content static |
| Landmark passage | No horizontal sequence | Four photographic panels travel horizontally through vertical scroll, with independent crops and readable links | One scoped timeline, reverse reconstructs positions | Vertical cards / no pin |
| Articles | Small early reveal finishes before reading | Deeper image framing, independent crop travel, heading translation, staged columns | top-bottom through section exit | Short reveal / static |
| Closing | Cards simply fade in | Contrasting title scale, staggered card depth and border reveal | Reversible shared engine | Vertical flow / static |
| Films | Two sources, eight beats | Expanded source collection; bounded nearby decoders; destination-specific framing and continuous caption masks | One scroll owner with latest-target seeking | Smaller files / manual scene selection |
| Controls | Cursor circle without labels | Contextual VIEW/EXPLORE/SCROLL labels; explicit motion preference | Shared ticker, cleanup | Native cursor |

New full-screen passages use CSS sticky with ScrollTrigger progress; native document height owns the scroll budget. This avoids nested pin spacers under the existing arrival and map architecture. The map, source geometry and landmark registry remain intact.


### Additional live reference: Rockstar GTA VI
At the user's request, inspected https://www.rockstargames.com/VI?utm_source=lenis on 19 October. Native forward scroll moved from the framed opening artwork, through a dark logo bridge, into a full-screen trailer composition. Further scroll held and dimmed that composition while rounded content cards rose over its lower edge. Reverse scroll restored the full-screen scene and its brightness. This observed behaviour informed the MELB skyline-to-photographic-card handoff. No artwork, video, fonts or source code from Rockstar were copied. The current live page was assessed; no assumptions about older versions.

## Film collection and choreography
20 scroll-selected moments, 11 source films, approximately 146 seconds of distinct source time (previously 40 seconds). The scene/source mapping and exact trims are in `src/scenes/CinematicStreets/videoTimeline.ts` and `public/assets/streets/video/SOURCES.json`. Individual Pexels pages expose the Free/Pexels License; credits and licence links remain in the website. New derivatives are H.264 at 24 fps, a 12-frame GOP without B frames, 720/1080 variants with constrained bitrates and faststart. The original two films retain their 6-frame GOP. All source downloads stay in the ignored research directory. No original user photomesh files touched.

| Setting | Scroll direction and framing | Text / handoff |
|---|---|---|
| CBD aerial | Opening inset expands; subsequent shot subtly drifts | Masked title follows decoded video time |
| Yarra approach | Wide composition opens into forward aerial | Caption settles after title; continuous second beat |
| Swanston / Hosier | Side curtain reveals street-level forward footage | Two consecutive, distinct time ranges per film |
| State Library | Native portrait film retained in a framed split composition, never stretched | Copy beside architecture on desktop; below on compact screens |
| Shrine | Restrained full-frame movement from the original footage | Calm typography; city-axis and garden views follow |
| St Kilda | Coastal aperture expands into a wide frame | Separate arrival and pier-detail moments |
| Southbank | Side reveal into the river, then a slight crop drift | Day-to-evening editorial transition |
| Flinders after dark | Full-image aperture, then quiet ending | Traffic/trams remain genuine video, reversible with scroll |

Only the target film, the previously visible film and one directional neighbour may mount (maximum three video elements, often two). Inactive decoders release their source, and the entire pool unmounts away from the film section. Captions switch only when the requested video time has decoded; the last image remains available during loading. All films are paused and seek-controlled, not autoplay. Direct scene controls, next/previous, replay and skip work without a wheel. Reduced motion removes spatial treatments and uses manual selection.

### Coverage gaps — not claimed complete
The collection now covers CBD, Yarra/Southbank, Swanston, Hosier, State Library, Shrine, St Kilda, Flinders, trams and night. Free modern footage for MCG/sports precinct, Federation Square itself, Royal Botanic Gardens, Arts Centre/NGV, Queen Victoria Market, Royal Exhibition Building and Docklands was not verified for this release. Existing sourced photos, interactive map entries and four 3D architectural studies remain available. These are not described as new footage. Search results tagged Melbourne but showing Geelong cricket grounds were rejected. A film titled Docklands visibly shows the St Paul's / Swanston precinct and is correctly labelled Swanston. The Shrine Reserve lawn is not labelled Royal Botanic Gardens. Collins remains an explicitly photographic notebook. Therefore the **full mandatory destination-footage checklist is not complete**.

## Validation
Offline: production TypeScript/Vite build; map/discovery, landmarks, editorial DOM, actual OrbitControls direction, media readiness/coalescing, 10,001 timeline samples, 20 forward/reverse manually selected decoded scenes, rapid jumps, StrictMode source retention, decoder ceiling and deterministic framing tests. Live public verification follows deployment; localhost's prior saved browser denial was not bypassed. Safari and physical-device performance are not claimed from desktop browser emulation.

### Public deployment verification
Verified on the published GitHub Pages site in the desktop browser (1171 × 819): opening/flight, Australia map, full discovery reveal and landmark search, horizontal Flinders panel, 3D entry/zoom/return, skyline reveal at several positions and in reverse, Shrine forward/reverse film seeking, portrait Library framing, St Kilda, and reduced-motion manual scene selection. Console error/warning collection was empty. Document width equalled viewport width. The main experience retained one canvas; inactive video sections released their decoders. Screenshots in `docs/phase42` are local visual evidence, not a continuous screen recording.

Rolling 600-frame samples reported approximately 60 fps in arrival, discovery and film sections on this machine; this is a frame-cadence observation, not a universal device benchmark or GPU-memory measurement. Warm film seeking was typically tens of milliseconds in the inspected samples. Cold direct jumps reached 1.8–2.6 seconds while media decoded; the prior frame and caption remained visible. Network-dependent cold seeking remains a limitation.

Live review found and fixed incomplete discovery reveal at the Explore shortcut, premature staggered title/card visibility, landmark title overlap, and postcard framing. All 22 responsive video files decoded through their final frame offline. Production build and all 27 automated test groups passed after final styling changes.

Responsive CSS and smaller film variants are implemented, but the browser viewport override did not change the actual reported dimensions. Consequently mobile visual testing, physical-device performance and Safari are **not verified**. The desktop reduced-motion preference and manual film selection were verified and then restored to full motion. Public evidence: `phase42/public-desktop.json`, `phase42/public-interactions.json`; media integrity: `phase42/media-verification.json`.

### Final follow-up — 20 October 2026
The refreshed browser session successfully applied a 390 × 844 viewport. Public-site checks now confirm no horizontal overflow at that size, the 1280-wide/720-high film variants, direct Library scene selection with an undistorted 406 × 720 portrait frame, accessible film controls, the compact discovery panel, and Shrine filtering. Screenshots: `phase42/mobile-library.png` and `phase42/mobile-map.png`. This supersedes the earlier viewport-tool limitation; physical phones and Safari remain untested.

A tab retained across deployment had requested a deleted, older hashed 3D module. Reloading loaded the current release correctly. Added Vite preload-error recovery with a persistent once-per-build guard; storage failure leaves the existing error fallback in place, avoiding refresh loops. The production build and recovery tests passed; the full CI suite now contains 28 groups. The complete destination-footage checklist remains open as explicitly listed above.
