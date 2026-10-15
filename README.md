# MELB.

**Arrive. Explore. Belong.** An interactive Melbourne experience with a cinematic arrival, a geographic discovery map, landmark journeys, editorial stories and a scroll-directed photographic essay through Flinders Street and Collins Street.

**Live site:** https://krishnavgaming22-beep.github.io/melb/

**Street journey:** https://krishnavgaming22-beep.github.io/melb/#walk

## Develop

Use Node.js 22 or newer.

```sh
npm ci
npm run dev
```

```sh
npm test
npm run build
```

## Publish

GitHub Actions builds and publishes the site to GitHub Pages whenever `main` is updated. In the repository's **Settings → Pages**, select **GitHub Actions** as the publishing source once. The deployment URL appears in the completed **Publish MELB** workflow.

The build sets the Vite base path to the repository name. Images, models, decoder files and React routing support that project path. `404.html` serves the application for direct links to its routes.

Future changes can be committed and pushed to `main`; the same public URL updates after the deployment succeeds.

## Assets and attribution

Photographs and geographic resources retain their individual licences. See `public/assets/streets/ATTRIBUTION.json`, `src/data/discovery-photos.json`, the landmark manifest and the on-site credits. Image derivatives retain their source licences. Third-party authors do not endorse MELB.

Large research downloads and original photomesh tiles stay outside version control. Runtime models, web images and the landmark Blender source files are included. Some optional asset-reconstruction scripts require local research originals and Blender; the website's normal build does not.

## Verification status

The production build and automated state/DOM tests pass. The deployed homepage, menu navigation and both street chapters passed an initial browser smoke check with no console errors. Full browser/WebGL, responsive and motion acceptance remains pending; these checks are not a claim of measured FPS or full browser coverage. See `docs/PHASE_4_1.md`.
