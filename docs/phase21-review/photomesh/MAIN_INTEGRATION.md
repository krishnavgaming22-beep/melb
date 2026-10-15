# Main website photomesh integration — 5 October 2026

The main homepage now renders the supplied C4-22 photogrammetry through the existing React Three Fiber canvas and arrival timeline. The procedural city is no longer loaded. Original source folders and ZIPs were not edited. The opening camera holds a centred frame, the aircraft settles at its destination and fades during descent, and the city continues into a higher aerial view. Existing MELB. typography remains.

## Delivered assets

| Level | Triangles | GLB download | Draw calls | Estimated geometry + GPU textures |
|---|---:|---:|---:|---:|
| High | 1,138,007 | 23.06 MB | 17 | 74.5–122.1 MB |
| Medium | 218,801 | 5.29 MB | 1 | 16.7–27.9 MB |
| Far | 128,710 | 2.27 MB | 1 | 6.1–8.9 MB |

Decimal MB; memory range assumes BC1 or ASTC 4×4 with mipmaps, excluding driver overhead, CPU copies, framebuffer and temporary decode allocations. A device without supported GPU texture compression can use substantially more memory. RAW has 2,745,409 triangles and 870.6 MB of source files; its original textures alone require approximately 12.14 GB with RGBA mipmaps. The comparison RAW uses the approved reduced texture atlases, not that original memory allocation.

High retains original UV islands with conservative geometry simplification. Medium and far simplify source geometry and rebake the real source photography into one 4096² / 2048² atlas. All use Meshopt geometry compression and KTX2 ETC1S textures. Far is a real 3D mesh, not the discarded nadir-only heightfield. Blender renders at oblique, higher and near-top-down angles show recognisable architecture; medium softens small roof details, while far loses some fine roof structures and about 7.3 m from the highest source point. Far is reserved for smaller projected views. Source ground footprint remains 281 × 281 m at every level.

Projected screen size selects the LOD with hysteresis; mobile/low-power mode caps at medium. There is one resident scene plus one replacement being loaded, with disposal after replacement. Objects use frustum culling. The tile perimeter fades across 12 m to soften the cut boundary. This does not create missing geographic coverage.

## Verification and remaining limits

Production TypeScript/Vite build and coordinate round-trip tests pass. Vite reports its large Three.js chunk warning. Browser policy still rejects localhost, so browser load time, FPS, console and final scroll appearance are **unverified**. Use `/photomesh-comparison.html` in the development server to compare three aerial angles and export actual device benchmark results. Static comparison images are Blender renders, not browser screenshots.

The main scene is **partial CBD coverage**, not a completed wider Melbourne. Inaccurate procedural landmark pins are disabled pending contiguous data and a verified datum. The source origin is [320877.49072265625, 5812809.471992493, 0] in MGA55/AHD. Local coordinates are east, AHD height, south, with a uniform 1/120 presentation scale. GDA94 versus GDA2020 remains unknown; the geographic conversion API requires an explicit datum and refuses to guess. The national-map destination is a presentation anchor, not a certified survey registration.

## Next coverage

Recursive Downloads inspection found no dataset index among 420 candidate metadata files; the six supplied ZIPs contain OBJ/MTL/JPG assets. The missing input is the official **Tile_Index.kml** (or equivalent official tile-footprint KMZ/GeoJSON) and horizontal-datum metadata.

Measured coordinates from all six tiles fit a 280 m grid with 1 m overlapping borders and residual below 0.25 mm. The immediate C4-22 neighbour candidates are **C4-15, C4-16, C4-17, C4-21, C4-23, C4-27, C4-28 and C4-29**. These are coordinate-derived candidates, not official-index-verified IDs. See `coverage-plan.json` and `coverage.svg` for measured footprints. C5-33 and C5-34 touch each other but do not connect to C4-22; neither is loaded in the homepage.

Obtain the immediate 3×3 CBD coverage first, then select a continuous river/Southbank/parklands/MCG corridor against official footprints. Exact wider-area download IDs cannot responsibly be confirmed without that index. A provisional budget is 4 medium tiles and 8 far tiles: about 1.9 million triangles and 116–183 MB estimated geometry/texture GPU memory, before all other allocations. This is a planning budget, **not a verified safe tile count**; approve actual browser benchmarks before expansion. Use spatial streaming and only one near high tile, rather than loading the entire city at high LOD.
