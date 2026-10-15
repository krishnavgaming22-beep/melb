# Discovery layout and interaction polish — 12 October 2026

Implemented directly in the existing discovery interface. City geometry, photographs, landmark records, camera selection and arrival sequence remain in place.

## Confirmed problems

The supplied screenshot shows text against the panel's left edge and a partially cut-off list. Source inspection confirmed `padding-left: 0`, a weakly separated translucent/gradient surface, and competing panel/results scrolling. The search used a font-dependent glyph; categories had individually sized underlines rather than one consistent selection indicator.

## Changes

- Desktop width increased from 300 px to a responsive 340–390 px; tablet/laptop width is 330 px. Equal 28 px desktop or 24 px tablet padding, on an 8 px spacing scale.
- Distinct warm ivory surface, fine edge and light shadow replace the background-blending gradient. Detail and discovery panels share desktop widths and outer bounds.
- Framed two-line serif title, consistent eyebrow spacing, and controlled spacing between heading, search, categories, theme story and result count.
- Inline SVG search icon, aligned input, subtle field surface and animated focus/hover states.
- Five equal category columns with a single moving active underline and subdued active tint.
- Destination rows use a defined number/title/arrow grid; thumbnail rows use a matching four-column grid. Larger row padding, readable category labels, restrained text/arrow hover movement and short staggered filter entrances.
- Normal-height panels keep the header and destination count fixed; only the list scrolls. Stable scrollbar space, end padding, keyboard End navigation and a scroll hint based on actual remaining overflow make the final row reachable. Filtering resets the list to the top.
- Short-height windows use one whole-panel scroll container to avoid squeezing the list to zero height. Mobile uses a compact heading, deliberate list expansion and bounded height so the map remains available.
- Reversible panel ascent and masked title reveal are added to the existing timeline; no new animation loop. Reduced-motion settings suppress decorative motion.

## Verification

Production build and offline DOM interaction suite pass. Added checks cover last-row keyboard access, overflow-hint updates, filter scroll reset and active-tab position. Existing tests cover all twelve panels, search, categories, camera-state restoration and map controls.

Browser access has a known saved localhost denial and has not been restored. No workaround was used. The screenshot was inspected, but the updated layout has **not** been visually verified in a live browser. Remaining checks: 1440×900 / 1366×768 / 1024×768 / 390×844 / short landscape layouts; final-row visibility while scrolling; hover/focus appearance; rapid filters; masked forward/reverse entrance; panel-to-map balance. Offline DOM tests do not measure CSS layout, animation appearance or FPS.
