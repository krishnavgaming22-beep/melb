# Phase 2.1 — isolated photomesh inspection

Date: 2026-10-04. Scope: read-only inspection of the supplied C4-22 and C5-34 folders; isolated C4-22 derivative. No photomesh added to the MELB arrival or city sequence.

## Findings

C4-22 is a useful real photogrammetry source for Phase 2.1. Its textured derivative imports into Blender and renders convincing rooflines, façades, rooftop equipment, streets, signage and vegetation. Oblique, overhead and detail renders were inspected. Close views expose typical photogrammetric softness, distorted vertical surfaces, baked shadows and ragged tile boundaries. This is suitable for an aerial experience, subject to wider coverage and optimisation; it is not a street-level reconstruction.

The test retains all source triangles. It does not invent buildings, flatten heights, or change the main website. The reduced-resolution photography is still recognisably detailed. The final production asset must be substantially lighter than this inspection derivative.

## Source measurements

All sizes below are decimal MB/GB; memory figures are analytical estimates, not measured browser peaks.

| Measurement | C4-22 | C5-34 |
|---|---:|---:|
| Total source files | 3,606 | 3,190 |
| Total source size | 870.589 MB | 746.338 MB |
| OBJ | 698.680 MB | 575.426 MB |
| JPGs on disk | 171.513 MB | 170.567 MB |
| Position vertices | 1,423,571 | 1,172,688 |
| Triangles / faces | 2,745,409 | 2,269,956 |
| Normal records | 2,745,409 | 2,269,956 |
| UV records | 8,236,227 | 6,809,868 |
| Materials / JPGs | 3,604 | 3,188 |
| Missing references or undecodable JPGs | 0 | 0 |
| Nonfinite UV records | 66 | 123 |
| Footprint, source units | 281 × 281 | 281 × 281 |
| Height range, source units | 4.014–84.991 | 4.875–85.333 |
| Decoded RGBA texture memory | 9.103 GB | 7.818 GB |
| RGBA textures including mipmaps | 12.137 GB | 10.424 GB |
| Expanded position/normal/UV geometry | 263.559 MB | 217.916 MB |

Texture resolutions:

| Resolution | C4-22 count | C5-34 count |
|---|---:|---:|
| 16 × 16 | 58 | 70 |
| 32 × 32 | 20 | 26 |
| 64 × 64 | 52 | 54 |
| 128 × 128 | 127 | 125 |
| 256 × 256 | 272 | 291 |
| 512 × 512 | 1,232 | 1,038 |
| 1024 × 1024 | 1,843 | 1,584 |

Both OBJ files use triangular faces, valid vertex/UV/normal indices, matching `mtllib` files, defined materials and existing `map_Kd` images. All JPGs were fully decoded, not merely checked for existence. The OBJ headers identify CloudCompare exports dated 2021-05-29; the acquisition date and licence are not contained in these folders.

The material files use `Tr 1`, which standard transparency interpretations may turn fully transparent. The derivative explicitly treats these photographed building/terrain surfaces as opaque and unlit, preserving baked photographic lighting. This override is recorded rather than modifying the MTLs.

## Coordinates and placement

The OBJ positions already contain large projected coordinates; there is no separate origin file in either folder.

| Tile | Easting min–max | Northing min–max |
|---|---|---|
| C4-22 | 320736.99072265625–321017.99072265625 | 5812668.971984863–5812949.972000122 |
| C5-34 | 322416.99072265625–322697.99072265625 | 5812108.971984863–5812389.971984863 |

C5-34's centre is exactly 1,680 source units east and approximately 560 south of C4-22. It is not an adjacent tile. Under the provisional MGA Zone 55 interpretation these units are metres, and approximate centres are:

- C4-22: longitude 144.965039, latitude −37.814555 (central CBD).
- C5-34: longitude 144.983977, latitude −37.819927 (MCG vicinity; provisional geographic interpretation, not an authoritative coverage verification).

These coordinate conversions are conditional on the CRS assumption. Neither folder contains CRS metadata, a vertical datum declaration, licence, or the tile index. Do not claim GDA94 versus GDA2020, AHD, exact landmark containment, or final multi-tile registration as verified. Pyproj's available transformations returned the same approximate coordinates for both candidate MGA definitions; this does not identify the correct datum.

The test stores origin `[320877.49072265625, 5812809.471992493, 0]` in GLB extras and `conversion.json`. Conversion uses `x = E − E0`, `y = source height`, `z = −(N − N0)`. Subtraction occurs in double precision before storage as float32. This is a rigid coordinate change with no scale change. It preserves relative geometry and allows restoration to source positioning; geographic metadata is still required for the map alignment.

## Isolated C4-22 test

- GLB: `.photomesh-test/C4-22.glb`.
- Blender inspection: `.photomesh-test/C4-22-inspection.blend`.
- Three rendered views: `.photomesh-test/C4-22-{oblique,overhead,detail}.png`.
- Standalone developer preview: `http://127.0.0.1:5173/photomesh-test.html` while Vite is running.
- All original geometry retained: 2,745,409 triangles.
- 17 JPEG atlases, each 4096², containing 256² texture patches with edge padding.
- 17 material primitives, reducing the expected draw calls from 3,604 to 17 for one pass.
- Approximately 211 MB GLB; 164.725 MB position/UV geometry, with normals omitted for the unlit inspection material.
- Estimated texture GPU allocation including mipmaps: 1.521 GB. Geometry plus textures: approximately 1.686 GB, excluding framebuffer and driver overhead.
- CPU-side GLB, geometry and decoded atlas images can add roughly 1.5 GB if retained simultaneously; peak process memory depends on loader and browser lifetimes. Mobile performance is not established.
- The 66 undefined source UVs are replaced by their material texture centre in the derivative only. This is a documented approximation, not recovery of their missing original UV values.

The browser tool still rejects localhost under a saved permission rule. No alternate browser or raw-browser workaround was used. Browser loading, interactions, runtime memory and frame rate therefore remain unverified. Blender rendering and binary checks are separate evidence, not a claim of successful browser testing. The developer preview is not a production build entry and is not imported by the main application.

## Recommended production optimisation

1. Retain these originals as read-only references. Record the official source metadata and licence with the delivery manifest.
2. Consolidate only needed texture regions, with adaptive patch sizes. The current uniform 256² packing is a quick inspection budget, not optimal production packing.
3. Generate KTX2/Basis texture tiers and compare image quality. A 4-bit-per-pixel target for the current atlases would be approximately 190 MB including mipmaps, before geometry; actual GPU format depends on device support.
4. Weld compatible vertices and use meshopt or Draco compression; create geometric LODs with UV/seam-aware simplification. Compare rooflines, silhouettes and boundaries against this full-geometry reference.
5. Deliver spatial chunks with coarse-first loading, frustum selection, bounded residency and disposal. Do not load many full-resolution source tiles together.
6. Keep the camera's visible region away from uncovered edges. Preserve true heights throughout the oblique-to-map transition.

## Which tiles next?

Do not guess IDs from the C4-22/C5-34 naming pattern. The official tile index is required to name the surrounding tiles reliably. Request the KML/KMZ index and CRS/origin metadata next, before requesting more mesh downloads. The other supplied folders (C3-34, C5-33, D4-09, D5-19) were not included in this two-tile audit and are not presumed to cover a landmark.

Once the index is available, intersect its polygons with the desired CBD, Yarra, Southbank, MCG, Shrine and Botanic Gardens extent, add a camera-frustum margin, and subtract already supplied tiles. C5-34 is a candidate for the MCG area based on projected coordinates, but must be confirmed against that index before selection. C4-22 alone is a 281 m patch, not the wider Melbourne skyline.

## Evidence and reproducibility

Machine-readable audit, texture inventory, SHA-256 source manifests and final validation are alongside this report. Reproduction scripts are `scripts/inspect_photomesh.py`, `scripts/photomesh_test_convert.py`, `scripts/render_photomesh_test.py` and `scripts/validate_photomesh_test.py`. Only generated derivatives and reports are written; the supplied folders are not edited, renamed, compressed or deleted.

Final binary validation passed: all 2,745,409 triangles retained, finite attributes, valid atlas UV range and all 17 embedded JPEGs decoded. Bounds reconstruct within 0.00000763 source units of the original bounds. SHA-256 checks confirmed all 6,796 source files match the audit manifests. `npm run build` passed with the existing large-chunk warning; browser validation is still outstanding.
