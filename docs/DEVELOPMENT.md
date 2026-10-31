# Developer guide

How to run, change, check and release Sandarshika. The live cross-agent state is
[HANDOFF.md](HANDOFF.md); rules for every agent are in [AGENTS.md](../AGENTS.md); the frozen look,
feel and flow are in [DESIGN_CONTRACT.md](DESIGN_CONTRACT.md). Dated notes from earlier releases are
kept in [history/DEVELOPMENT_LOG.md](history/DEVELOPMENT_LOG.md).

## Run from a fresh clone

Requires Node.js 22+ and Python 3.11+ (ingestion and source-archive tools only). No npm dependencies
or build step.

```sh
python3 -m http.server 8000 --directory dist   # open http://localhost:8000
npm test
npm run check
```

Use localhost or HTTPS (service workers); `file://` is unsupported. Static hosts must serve `.mjs` as
JavaScript and keep relative paths. No API keys, database or accounts. Python's simple server sends no
cache headers, so after changing modules without a new release token a browser may keep old files: use
a fresh port or clear the site's cache when checking.

## Where things live

| Path | Purpose |
|---|---|
| `dist/` | The website (only this is deployed): `app.mjs` (UI, routes), `core.mjs`, `ux.mjs`, `domain/`, `services/`, `features/`, `views/`, `sw.js` (offline), `styles.css` + `guide-cards.css` (protected) |
| `dist/catalog.mjs`, `dist/packs/up-hindi-2026/catalog.mjs` | Lesson catalogs (Math at its legacy path, Hindi under its pack); on `next` copied from the pinned content release |
| `dist/day-types.mjs` | Generated day-type calendar and labels for cards (do not edit) |
| `dist/source`, `workbook`, `textbook`, `packs/*/` | Original page images (WebP), loaded on demand |
| `curricula/<pack>/` | One curriculum pack: `originals/` (PDFs + checksums), `extracted/` (unreviewed), `tools/` (adapters), `model/` (canonical model), `compat/` (v1 bridge), `reviewed/` (v1 snapshot) |
| `content/<pack>/<version>/`, `content/query.mjs`, `content/website.json` | Compiled content releases, the shared query library, and the website's pinned versions |
| `schemas/` | Content-model and release contracts |
| `scripts/content/` | Compiler, program-metadata check, site publisher, validator |
| `scripts/` | v1 publication, preservation, release-assets, source-archive and design-lock tools |
| `tests/` | Node (`*.test.mjs`) and Python (`test_*.py`) tests |
| `skills/teacher-guide-to-app/` | Reusable PDF-to-app workflow |

Full folder ownership: [REPOSITORY_LAYOUT.md](REPOSITORY_LAYOUT.md).

## Checks

Run all of these before a PR (CI runs them on every push):

```sh
npm test                          # Node tests incl. design lock, compiler parity, site-from-release
npm run check                     # all dist modules parse and resolve
node --check dist/sw.js
npm run verify:content            # pinned content release rebuilds byte for byte (v2 line)
npm run verify:site               # dist/ catalogs and day types equal the pinned release (v2 line)
npm run verify:program            # whole-program metadata readiness per pack
npm run verify:publication        # reviewed snapshots equal dist/; preservation baseline intact
npm run test:ingestion            # Python ingestion tests (needs PyMuPDF, Pillow)
npm run verify:sources -- --require-complete
```

Read exit codes: piping to `tail` hides a failing command. File-sync tools (iCloud, Dropbox) can drop
copies named `… 2.json` into the tree, including inside `.git`; the compiler refuses them. Keep the
repository out of synced folders, and check `git status` for `* 2*` files if a gate fails oddly.

## Changing things

- **UI** (`dist/`): test Hindi and English at 360 and 390 px, keyboard navigation and old deep links.
  Protected files and frozen behaviour need the owner's approval ([DESIGN_CONTRACT.md](DESIGN_CONTRACT.md)).
- **Lesson content repairs (v1, on `main`)**: add a source-compared entry to
  `curricula/<pack>/tools/repairs.json`, rebuild with the pack's `build_pack.py --no-images`, publish with
  `node scripts/publish_curriculum.mjs <pack>`, and record a reviewed baseline amendment
  ([CURRICULUM_EXPANSION.md](CURRICULUM_EXPANSION.md)). After `main` is merged into `next`, rebuild the
  content release so `verify:site` stays green.
- **Content model (v2, on `next`)**: edit `curricula/<pack>/model/`, then
  `npm run content:build -- --version <next> --previous <current>`, update `content/website.json` and the
  `verify:content` pin, and run `npm run site:publish` ([CONTENT_COMPILER.md](CONTENT_COMPILER.md)).
- **New PDFs / grades / subjects**: follow the skill and [CURRICULUM_EXPANSION.md](CURRICULUM_EXPANSION.md).

## Releasing (v1)

Branches and tags: [VERSIONING.md](VERSIONING.md). For a release on `main`: `npm run manifest` if page
images changed, `npm run release:assets -- rNN` (coordinates every `?v=` token and the worker shell), all
checks, PR, merge (GitHub Pages deploys `dist/` from `main`: [GITHUB_PAGES.md](GITHUB_PAGES.md)), then
fast-forward `release/v1`, tag `v1.0.N` and merge `main` into `next`. `next` carries its own higher rNN.

## Parallel agents

One task branch and worktree per agent; agree file ownership first. `dist/app.mjs` and the CSS files are
shared hotspots: one agent at a time. Browser storage is not isolated by worktree, so use separate ports or
browser profiles for tests.

## Coverage and limits

732 day plans: Math 183 direct plans + 183 weekly templates; Hindi 366 three-period plans (day 6 combines
periods 2 and 3 for the weekly assessment from the week it starts). Grade 1 begins week 9; Grades 2–3
begin week 1; weeks 13 and 20 are periodic-revision pages. Grade 1–2 Math textbooks are not bundled
(printed page references instead). No independent academic proofreading, teacher field test, or
physical phone, screen-reader or printer check has been done.
