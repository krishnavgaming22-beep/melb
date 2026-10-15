# Phase 0 Lite gate — 3 October 2026

Completed before implementing Phase 1.

- React / TypeScript / Vite production build passes.
- Chrome and in-app Chromium render the temporary WebGL box against the layered DOM opening.
- Runtime logs: no errors or warnings during the checked interactions.
- Lenis active, one Arrival ScrollTrigger, one canvas.
- Scroll progress reaches 1 through native scroll; resets on returning home.
- Menu opens, route to Why Melbourne resolves, return home works.
- Route away: zero canvases and zero ScrollTriggers; return home: one each (including React StrictMode).
- Desktop 1468px and narrow 433px measured viewport: document width equals viewport width.
- Responsive typography/navigation adapt; no cursor on coarse pointer or reduced motion by media query.
- Foundation build has the expected Three.js bundle-size advisory, no compilation failures.

Phase 1 replaces the temporary scene and timeline in place. Future chapters stay structural only.
