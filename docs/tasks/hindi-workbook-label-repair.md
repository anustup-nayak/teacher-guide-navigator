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

## Progress

- Claimed; inventory found ~52 of 85 Grade 1 pages with damaged labels. Comparing page images next.
