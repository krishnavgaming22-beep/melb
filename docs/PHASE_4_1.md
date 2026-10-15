# Phase 4.1 — photographic streets

Status: ₹0 implementation integrated; live visual/performance acceptance **pending**. This is the strongest free photographic prototype assembled and checked offline, not a verified Getty-equivalent 3D film. The user explicitly authorised photographs after the initial video-source investigation.

## Delivered

Eight scroll-directed compositions (four per street), using seven real, individually licensed photographs. Gentle framing, an architectural detail study and reversible dissolves share one document-scroll progress. No street camera, OrbitControls, video decoder, extra WebGL canvas or new RAF loop. Existing Lenis drives the existing GSAP ticker; one new ScrollTrigger reads the street section's progress. CSS sticky supplies the viewport stage.

Main editorial entry: `/#walk`. Film: `/#street-film`. Conclusion remains `/#your-melbourne`. The old C4-22 Bourke Street interface and lazy scene are disconnected from main imports; the source experiment and original uploads remain available unchanged. Arrival, discovery and four landmark experiences remain in their existing canvas.

Mobile shows whole photographs with compact text rather than stretching or arbitrary portrait crops. Reduced motion offers eight direct views with previous/next and replay, and no framing motion or long pinned scroll. Skip moves focus to the existing conclusion. Full text and source credits are accessible below the sequence. The photographic nature and editorial changes of location/date are explicitly described.

## Recording audit (before source edits)

Reviewed the two supplied recordings using 12 extracted frames each. Contact sheets: `phase41/recording-a-contact.jpg`, `phase41/recording-b-contact.jpg`. Originals untouched.

A: 6.11.56 pm, 20.4567 s, current MELB.

- 0.00 s: invitation points into experimental Bourke Street rather than the requested Flinders/Collins chapters.
- 1.70–6.82 s: street environment visibly sideways while UI stays upright; smeared close surfaces, unnaturally flat/occluded façades.
- 8.52–11.93 s: look controls expose missing/warped geometry at close distance; visual subject is lost.
- 13.64 s: third viewpoint is a discrete change, with persistent viewer controls rather than scroll-directed storytelling.
- 15.34 s: dark transition; 17.05–18.75 s: fourth viewpoint retains the same sideways horizon and poor source surfaces.
- Loading duration and exit are not observable in the sampled recording. No numerical FPS or seek-latency inference made from screenshots.

Confirmed technical causes: CameraRig changes camera.up towards (0,0,-1) for map flattening; old StreetScene never sets it back to (0,1,0). Therefore lookAt inherits an unsuitable up vector. Old street movement uses four teleport points behind a 0.7 s curtain, not a continuous scroll path. High LOD still contains aerial capture holes; neither higher triangle counts nor lighting fixes can supply missing street data.

B: 6.13.17 pm, 45.495 s, Getty reference (not MELB).

- 0–3.79 s: strong frontal Gate composition and large restrained title.
- 7.58 s: close architectural detail with small contextual text.
- 11.37 s: spatial passage between architecture; 15.17 s: bright chapter transition.
- 18.96–22.75 s: new wide setting followed by closer relief views.
- 26.54–30.33 s: isolated column/capital detail, with unobtrusive navigation.
- 34.12–41.70 s: new chapter and a controlled approach.

The live Getty site was also opened and advanced through its entrance to the Gate. Its directed compositions and minimal interface informed this implementation; no Getty assets or source code were copied. Exact reverse-scroll response was not conclusively observed in the tool session; the supplied recording shows forward movement.

## Free source selection

`assets/streets/sources.json` retains Commons per-file metadata, author, source URL, dimensions, licence and original description. `public/assets/streets/ATTRIBUTION.json` describes the actual seven derivatives served. All are CC BY or CC BY-SA; each derivative retains its original licence. Attribution is in the website and downloadable manifest. Source authors are not presented as endorsing MELB.

- Flinders aerial: Dietmar Rabich, 6720×4480, CC BY-SA 4.0, 2019, photographed through Eureka Tower observation-deck glass.
- Flinders frontage: Medelam, 4096×3072, CC BY-SA 4.0, May 2019.
- Flinders corner: Gracchus250, 4841×3026, CC BY-SA 4.0, March 2021; also used for a restrained detail-framing beat.
- Collins tram-stop perspective: Philip Mallis, 6960×4640, CC BY-SA 2.0, 2024.
- Olderfleet architectural view: Tangerineduel, 3648×2736, CC BY 4.0, 2010. Explicitly dated on screen.
- Treasury on Collins: Sgroey, 3883×1791, CC BY-SA 4.0, 2023 metadata.
- Tram outside 538 Collins Street: Ymblanter, 5484×3712, CC BY-SA 4.0, 2024.

Rejected: aerial C4-22 for pedestrian views; rail-track photograph initially returned by the Flinders search (not the frontage); pole-obstructed Olderfleet composition; low-resolution archival photos. Pexels Flinders assets 36522677 and 37315855 were verified as portrait sources (2160×3840), insufficient for the intended desktop-wide film. Pixabay aerial footage does not fill the required terrestrial detail gap. Focused Mixkit/CC footage searches did not establish a complete, suitable free pair of street films. Paid candidates are excluded by the final ₹0 requirement.

This is a curated photographic essay, not continuous 3D travel. Captures differ in date and lighting. No false intermediary street route, fabricated façades, animated trams or AI-generated architecture. Locations follow source descriptions; the images are not georeferenced camera poses.

## Storyboard

| View | Subject | Direction |
|---|---|---|
| 01 | Flinders precinct from Eureka Tower | Establish station/river/city relationship |
| 02 | Station entrance | Editorial dissolve to street-level architecture |
| 03 | Dome/clock/façade | Restrained framing study within a high-resolution source |
| 04 | Station corner | Settle and announce a separate Collins chapter |
| 05 | 101 Collins Street tram stop | New street perspective; no implied connecting walk |
| 06 | Olderfleet buildings | Heritage composition, capture date made explicit |
| 07 | Treasury on Collins | Arches and façade rhythm |
| 08 | Tram outside 538 Collins Street | Everyday street context; onward to existing conclusion |

## Asset preparation and limits

`scripts/prepare-street-images.py` uses original images read-only and generates 960/1920/3200px WebP derivatives at quality 88. No upscaling. Native widths 3648–6960px. Source inspection sheets are image-source evidence, not screenshots of the finished UI.

Full seven-image download totals by tier: 960px 1,191,592 bytes; 1920px 3,799,494 bytes; 3200px 8,010,244 bytes. Only the selected tier is requested; high-density desktop selects 3200px. The intro does not preload the entire essay. Near-section loading mounts previous/current/next plus the last displayed image if needed, maximum four image elements. On failure, skip/text stay available. Decode callbacks ignore detached elements. Images unmount when far offscreen; browser HTTP caching is browser-managed.

Conservative four-image RGBA decoded estimates: 10.55 MiB / 42.19 MiB / 117.19 MiB by tier. These are dimensional estimates, **not measured runtime/GPU memory**; compositor copies and browser caches add overhead. No frame-rate, load-time or browser smoothness claim.

## Verification

Production build passed. Existing discovery/landmark/editorial checks plus new deterministic timeline and reduced-motion DOM coverage pass. New checks include 10,001 timeline samples, bounded progress, eight direct views forwards/backwards, replay, skip destination, image-mount bound, source credits and legacy scene disconnection.

Local dev process is listening on 127.0.0.1:5173. Browser tool explicitly rejected that address due to a saved user denial. No alternate browser, Playwright CLI, proxy, raw CDP or file-URL workaround was used.

**Still required:** real Chrome/Safari/Edge visual and motion review, 1920×1080 and 2560×1440 screenshots, mobile layout checks, rapid reverse/resize/reentry, measured frame timing and image-load behaviour, and a screen recording. The source prototype has been checked offline; browser validation before final creative acceptance remains outstanding. Ten final UI screenshots and finished-motion evidence have not been fabricated.

To enable that review: in the app's browser permissions, clear the saved denial for the exact `http://127.0.0.1:5173` origin and allow Browsing, then confirm access has changed.
