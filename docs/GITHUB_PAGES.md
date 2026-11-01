# GitHub Pages delivery

This is a buildless static application. Source and archived PDFs live in the
repository; the website artifact contains **only website files**: current `dist/` at the root and frozen `v1.0.4` website files at `/v1/`. No API keys, backend, npm
install or PDF extraction is needed to run the website.

## Deployment

1. Push the reviewed source to `main` in the intended GitHub repository.
2. In repository Settings → Pages, select **GitHub Actions** as the source.
3. `.github/workflows/pages.yml` runs Node/syntax/publication/source-integrity,
   v2 program/content/site gates, Python ingestion and skill-helper checks, checks out frozen tag `v1.0.4`, stages both websites with `scripts/stage_pages.mjs` into `work/pages`, then deploys that artifact with
   the `github-pages` environment. It uses the built-in GitHub token; no personal
   token belongs in the repository. Manual runs from other branches do not deploy.
4. Open the completed workflow's `page_url`. A project site has the path
   `https://<owner>.github.io/<repository>/`; keep all runtime paths relative.

The checks workflow also runs for pushes/pull requests. A passing local test is
not evidence that a remote workflow or deployment succeeded. Record the actual
commit, run URL and live test results in `docs/tasks/github-readiness.md`.
The historical Sites manifest does not configure GitHub Pages or update the old site.
Branch-based Pages cannot select `dist/`; do not select the documentation folder
or publish the entire repository by mistake.

## Before and after publication

Run `npm test`, `npm run check`, `npm run verify:publication`, `npm run verify:sources`,
`npm run test:ingestion`, and the skill-helper tests. For a complete source handoff,
also run `npm run verify:sources -- --require-complete`.

After deployment inspect Hindi/English Find, grade switching, a legacy lesson/phase
URL, source artwork/reader, resource images, notes, browser Back and offline status.
Check the console and a phone viewport. Verify service-worker URLs stay under the
project prefix. Reload a prepared offline lesson and test an old installation
upgrade when changing runtime/cache versions. Physical-device, classroom and
academic sign-off remain distinct from software checks.

Publishing under a new origin creates separate browser storage. Existing localhost
or Sites notes do not automatically appear on github.io; the app's text export
preserves a readable copy, but no automated import/cloud sync is implemented.

Sources: [GitHub Pages publishing configuration](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site),
[custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Frozen v1 fallback

`work/pages` is disposable deployment output, never committed. The staging command requires a fresh output directory separate from both website sources. It copies no repository source or PDFs outside the two dist trees. Run all gates before staging so the nested legacy assets do not alter publication checks. The v1 service worker remains at `/v1/sw.js` with its own path scope. Staging changes only the fallback worker’s Cache Storage prefix from `up-guide-` to `legacy-up-guide-`: Cache Storage is shared across worker scopes, so this prevents either version deleting the other’s offline cache. The frozen source, lesson IDs and teacher-storage namespaces remain unchanged. Keep the immutable v1 tag and `release/v1` for at least one school term; do not advance them during v2 releases.
