# Public deployment — 15 October 2026

- Repository: https://github.com/krishnavgaming22-beep/melb
- Public website: https://krishnavgaming22-beep.github.io/melb/
- Street entry: https://krishnavgaming22-beep.github.io/melb/#walk
- Host: GitHub Pages, HTTPS enabled.
- Deployment: `.github/workflows/deploy.yml`, automatic on pushes to `main`.
- First deployment: successful workflow run 38742544205.

The local repository's `origin` points to the public GitHub repository and `main` tracks `origin/main`. Commit and push future changes to update the same URL. No local server is required for visitors.

Publication checks: 22 offline test groups passed; the production build succeeded with `/melb/` as its base path; GitHub's clean-runner tests, build and deployment succeeded. A browser smoke check confirmed the live homepage, menu, Flinders and Collins imagery and scroll progression, with no console errors captured. This is not a full cross-browser/performance or Phase 4.1 creative acceptance report.

The site uses one existing Three.js canvas. Public paths now resolve through the deployment base, including model/texture/decoder downloads and source credits. BrowserRouter has the matching basename. GitHub Pages receives `404.html` for direct React route links.

Local research originals and previous inspection renders remain on disk; they were not uploaded. Runtime web assets, source code, attribution manifests and the landmark Blender sources are in the repository. GitHub CLI authentication was approved by the user; no credentials were committed.
