# Grade 1 Hindi workbook label repair (r72 / content 1.3.5)

- **Agent:** Claude Code · **Branch:** `task/hindi-workbook-label-repair` (from `next` @ `37e8bb9`)
- **Owner request (chat, 2 Nov 2026):** fix the damaged Hindi workbook label found while checking the product
  explainer storyline; on seeing the wider defect, the owner chose "All Grade 1 labels".

## Goal

Repair font-decoding damage in Grade 1 Hindi workbook labels (the heading shown for each lesson's workbook page),
each change compared with its workbook page image. Grades 2–3 labels were scanned and look clean.

## Owned files

`curricula/up-hindi-2026/compat/v1.json`; `curricula/up-hindi-2026/tools/` (new label recipe file,
`build_pack.py`); `scripts/content/source_text_repairs.mjs` and `tests/source-text-repairs.test.mjs`; new
immutable `content/*/1.3.5/`; `content/website.json`, `package.json` verify pin; `curricula/published-baseline.json`
amendment; generated `dist/` modules and r72 release tokens; affected docs.

## Acceptance criteria

- Every changed label has a recipe with grade, PDF page, old/new text, page image and its SHA-256.
- `source_text_repairs.mjs --check` verifies label recipes; raw `build_pack.py` rebuilds keep them.
- New content release 1.3.5; older releases, image paths, lesson IDs and storage keys unchanged.
- Explicit baseline amendment; `npm test`, check, all verify gates and `npm run test:e2e` pass.
- Browser check of repaired labels in Hindi at 360 px.

## Result

- **Inventory:** 75 distinct Grade 1 workbook pages carry labels (90 lesson entries). Each label was compared with the
  top of its rendered page (badge, lesson number, first activity heading) from contact sheets. 36 pages needed a
  repair, touching 41 lesson entries. Grades 2–3 labels were scanned for the same damage patterns and none was found.
- **What changed (labels only):** legacy-font decoding damage (`भरं-े`→`भरें-`, `पढं े़`→`पढ़ें`, `वणोङ`/`वणाङे`→`वर्णों`,
  `शब्दांे`→`शब्दों`, `पढे़ं`→`पढ़ें`); the स्कूल रेडिनेस badge restored where it was dropped or garbled (weeks 9–12);
  the missing `पढ़ें -` heading on PDF p58; the tick (✓) and anusvara (ं) that decoded as empty brackets, with the
  stray `ü` removed; the anusvara badge moved in front of `पाठ` on p82–83 to match every other label.
  Labels already correct were left alone, including bare vowel-sign badges (they are what the page prints).
- **Recipes:** `curricula/up-hindi-2026/tools/workbook-label-repairs-r72.json`, 36 records with page image SHA-256.
- **Tooling:** `scripts/content/source_text_repairs.mjs` checks and applies label recipes to the compatibility
  bridge and both worksheet lists; `build_pack.py` reapplies them on raw rebuilds; new test in
  `tests/source-text-repairs.test.mjs`.
- **Release:** immutable content 1.3.5 for both packs (Hindi: 41 changed lessons, labels only; Math: version metadata
  only), pins advanced, `site:publish` parity, r72 tokens (75 shell URLs). Baseline amendment records
  `packs/up-hindi-2026/catalog.mjs` and `worksheets.json` hash changes. Older releases, images, IDs and storage keys
  unchanged; a byte comparison confirmed both published files differ only in label strings.

## Checks

- `npm test` 146/146; `check`, `design:check`, `verify:program`, `verify:content` (1.3.5), `verify:publication`,
  `verify:site`, `verify:sources` pass; `test:ingestion` OK; `source_text_repairs.mjs --check` verifies 36 label
  repairs; `node --check dist/sw.js` OK.
- Browser (local server, r72, 375 px, Hindi): the app's Hindi catalog and worksheet list contain no damaged Grade 1
  labels; `g1-hindi-w09-d02` renders, its workbook page reader opens (p8, 1250 px), Escape closes it and focus
  returns; no console errors or horizontal overflow.
- **Not run:** `npm run test:e2e`. Playwright is not installed in this checkout and installing it needs a download;
  the affected flows were checked directly instead, as in r71.

## Finding and limits

- The r71 lesson screen does not display the label (it shows `कार्यपुस्तिका · पृष्ठ N` and the page's
  instructions). The repair corrects the published data used by content releases, the worksheet list and future
  views; it does not change what a teacher sees today.
- No academic proofreading of the labels beyond page comparison. Not yet released: merge to `next`, then a
  reviewed release PR to `main`. Update README, ARCHITECTURE and CONTENT_COMPILER production statements (r71 /
  1.3.4) at that release.

## Documentation impact

DEVELOPMENT.md (label recipes), CONTENT_COMPILER.md (pin), this note and HANDOFF. No contract, PRD or design change.
