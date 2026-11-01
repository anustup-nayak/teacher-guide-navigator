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
| `dist/day-types.mjs`, `dist/program-guide-data.mjs` | Generated from the pinned release by `site:publish` (do not edit): card day labels; program-guide calendar, day types, periods and section pages |
| `dist/views/program-guide.mjs` | Program guide screens (`#/guide…`), loaded on demand |
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

Before a UI release, also run the end-to-end journey sweep (not in CI: it needs a browser and a local server):

```sh
python3 -m http.server 8765 --directory dist &   # any static server on :8765
npm run test:e2e                                 # BASE=https://… to target another origin
```

It walks archetypes A–F ([PRD.md](PRD.md#personas-canonical-set)) through their journeys. It sweeps every top-level
route at 320/360/390/1024 px in both languages for overflow, console errors, text under 13 px and small targets. It
renders all 549 smart cards and checks offline reading with fonts. Expect 0 failures.

Read exit codes: piping to `tail` hides a failing command. File-sync tools (iCloud, Dropbox) can drop
copies named `… 2.json` into the tree, including inside `.git`; the compiler refuses them. Keep the
repository out of synced folders, and check `git status` for `* 2*` files if a gate fails oddly.

## Changing things

- **UI** (`dist/`): use design tokens only ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md); `tests/design-system.test.mjs`
  enforces it), put new screens in `dist/views/`, and run `npm run test:e2e`. Test Hindi and English at 320–390 px,
  keyboard navigation and old deep links. Protected files and frozen behaviour need the owner's approval
  ([DESIGN_CONTRACT.md](DESIGN_CONTRACT.md)).
- **Existing-pack source repairs**: add a source-compared entry to
  `curricula/<pack>/tools/repairs.json`, rebuild with the pack's `build_pack.py --no-images`, publish with
  the reviewed-snapshot publication path only as part of the repair procedure, and record a reviewed baseline amendment
  ([CURRICULUM_EXPANSION.md](CURRICULUM_EXPANSION.md)). For the current v2 website, synchronize the canonical model and a new immutable content release, advance the pin and publish generated site modules in the same reviewed task. Do not publish a repaired v1 snapshot alone over the pinned production catalogs; `verify:site` and parity must both pass.
- **Content model (v2, on `next`)**: edit `curricula/<pack>/model/`, then
  `npm run content:build -- --version <next> --previous <current>`, update `content/website.json` and the
  `verify:content` pin, and run `npm run site:publish` ([CONTENT_COMPILER.md](CONTENT_COMPILER.md)).
- **New PDFs / grades / subjects**: follow the skill and [CURRICULUM_EXPANSION.md](CURRICULUM_EXPANSION.md).

## Releasing

Branches and tags: [VERSIONING.md](VERSIONING.md). For a v1 maintenance release before cutover: `npm run manifest` if page
images changed, `npm run release:assets -- rNN` (coordinates every `?v=` token and the worker shell), all
checks, PR, merge (GitHub Pages deploys `dist/` from `main`: [GITHUB_PAGES.md](GITHUB_PAGES.md)), then
fast-forward `release/v1`, tag `v1.0.N` and merge `main` into `next`. `next` carries its own higher rNN.

After v2 cutover, freeze `release/v1` at `v1.0.4`; normal v2 releases flow through `next` → `main`. Pages runs the v2 content/site gates and stages the current `dist/` plus the frozen v1 tag at `/v1/` using `scripts/stage_pages.mjs`. Never fast-forward `release/v1` to a v2 commit. See [GitHub Pages delivery](GITHUB_PAGES.md).

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
