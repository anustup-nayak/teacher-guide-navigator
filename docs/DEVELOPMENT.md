# Developer handoff

## Run from a fresh clone

Requires Node.js 22+ and Python 3.11+ for ingestion/archive tooling. No npm dependencies or build step.

```sh
npm test
npm run check
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000. localhost supports service workers; arbitrary HTTP hosts may not. Static hosting must serve .mjs as JavaScript and preserve relative resource paths. No API keys, database or account setup is required.

## File map

| Path | Purpose |
|---|---|
| dist/app.mjs | UI, routing, persistence orchestration |
| dist/core.mjs | Catalog, routing and storage helpers |
| dist/catalog.mjs | Published UP lesson snapshot; matches curricula/up-math-2026/reviewed |
| dist/data.mjs | Data exports |
| dist/styles.css | Responsive styles |
| dist/sw.js | Explicit offline caching |
| dist/resources.json, worksheets.json, sources.json | Resource indices and provenance |
| dist/source, workbook, textbook | 990 committed original-page WebP assets |
| scripts | Optional PDF extraction, decoding and content repair pipeline |
| tests | Node regression tests |
| docs | Acceptance criteria, QA and content audit |

The runnable app and its assets are self-contained. The source archive and its current completeness are documented in [SOURCE_ARCHIVE.md](SOURCE_ARCHIVE.md). Approved raw PDFs and reproducible embedded-text outputs belong in the repository; transient OCR/render files remain local. Python pipeline dependencies include PyMuPDF and Pillow; OCR also requires Tesseract with Hindi language data. Read each script's arguments before running: generation overwrites committed data and needs academic review. Do not regenerate the catalog as part of normal app development.

## Coverage and limits

366 day records: 183 direct plans and 183 weekly plans. Direct plans have six source stages, not seven invented phases. Grade 1 starts Week 9. Grades 2/3 start Week 1. Review weeks 13/20 use original resources. Grade 1/2 textbook PDFs are not bundled; printed page references are intentional. Grade 3 textbook and all guides/workbooks have in-app images.

Independent academic proofreading, teacher field testing and physical-device verification remain outstanding. See the QA reports for precise scope. Text and images retain their original rights; repository transfer does not grant a new content licence.

## Parallel coding agents

```sh
git worktree add ../sand-ui -b task/lesson-loop
git worktree add ../sand-content -b task/content-review
```

Give each agent a task note and exclusive file scope. Suggested streams: UI/navigation; source content; QA/accessibility. Integrate one reviewed PR at a time, rebase the next branch, and rerun checks. Shared local storage in a browser profile is not isolated by git worktree: use separate browser profiles or ports for tests.

## Deployment

Serve dist/ on any static host. The .openai/hosting.json manifest identifies the existing Sites publication and is not a credential. Changing GitHub source does not automatically update that publication. GitHub Pages now has a check-gated workflow that publishes only dist/ from main. See [GITHUB_PAGES.md](GITHUB_PAGES.md) for setup and verification. No deploy secrets are needed.

## Scrollable lesson (local release r18)

The full lesson now renders preparation, every source teaching phase, notes and
references inline, with sticky wrapping jump chips. The phase dropdown and fixed
next/previous bar have been replaced by the full-loop navigator and explicit
completion after the phases. Old phase URLs and saved progress remain supported.
See `docs/tasks/scrollable-lesson.md` for validation. These are local changes;
no production publication has been performed.

## Curriculum extension (31 October 2026)

See `docs/CURRICULUM_PACKS.md` for the pack contract and onboarding procedure.
The UI now reads metadata, grades, reviews and resource paths from
`dist/curricula.mjs`. UP remains the default and retains all old storage keys.
There are now 38 Node regression tests and 3 Python ingestion tests. `docs/TRANSFER_MANIFEST.original.json` describes the original
transfer, not this locally modified source tree.

## Ingestion workspace (31 October 2026)

See `curricula/README.md`. The original 31 October setup treated originals and drafts as local stages. The current [source archive contract](SOURCE_ARCHIVE.md) supersedes that Git policy; normalized reviewed files are still published explicitly. `npm run
verify:publication` checks the UP snapshot. Python ingestion tests require the
optional `scripts/requirements-ingestion.txt` dependencies. CI runs both suites.

Browser smoke checks after separation: Grades 1/3 and week/day navigation,
original Grade 3 Week 13 review page image, legacy lesson/phase URL, bookmark
and note persistence through reload (temporary test values restored), keyboard
skip link, and Hindi/English lesson layouts at 360/390px without horizontal
overflow. No browser console errors captured. Physical-device/classroom and
full academic review remain separate outstanding checks.

## Source-led cards (local release r27)

`dist/guide-cards.css` layers source-specific compact cards over the base UI.
`dist/lesson-visuals.mjs` validates and renders original-artwork viewports;
`CURRICULA[].visualStyle` holds pack/grade palettes and geometry overrides.
See `docs/VISUAL_DESIGN.md` and `docs/tasks/source-led-cards.md`. Source data
remains byte-identical to its reviewed snapshot. No production deployment.

## Modular runtime (r48)

The current [PRD](PRD.md) and [architecture](ARCHITECTURE.md) supersede historical
file-map/count descriptions above where they differ. Registry metadata, instance
preferences, resource fetching, reader/offline state and source-media views now
have explicit module boundaries. App composition preserves the existing routes
and storage keys. New modules are recursively syntax-checked and included in the
release shell through `npm run release:assets -- rNN`; no framework/build step added.
