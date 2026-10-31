# Phase 1 — Read the programs (program profiles and page maps)

Plan: [CONTENT_ARCHITECTURE_PLAN.md](../CONTENT_ARCHITECTURE_PLAN.md) §6 Phase 1.
Branch `task/phase1-program-profiles` from `next`; PR goes to `next`, never `main`.

## Goal
Read every front- and back-matter page of the six UP Teacher Guides (Hindi and Math,
Grades 1–3), map each guide's sections from its own contents page, and write a program
profile per pack with page references and open questions for the curriculum team.

## Owned files
- `scripts/content/extract_matter.py` — decodes front/back matter (reuses the Hindi pack
  decoder; Math AAText is Kruti-compatible in the U+F0xx area).
- `curricula/<pack>/extracted/matter/<guide>.json` — decoded lines per page (unreviewed).
- `curricula/<pack>/model/PROGRAM_PROFILE.md`, `curricula/<pack>/model/pagemap.json`.

## Lesson ranges used (pdf pages; from the published catalogs)
| Guide | Front | Lessons | Back |
|---|---|---|---|
| Hindi G1 | 1–18 | 19–110 | 111–152 |
| Hindi G2 | 1–18 | 19–158 | 159–200 |
| Hindi G3 | 1–18 | 19–158 | 159–200 |
| Math G1 | 1–17 | 18–84 | 85–112 |
| Math G2 | 1–18 | 19–115 | 116–144 |
| Math G3 | 1–18 | 19–114 | 115–144 |

Printed page = pdf page − 2 in all six guides.

## Progress
- [x] Moved 38 macOS " 2" sync duplicates (37 identical, 1 stale copy of
  up-hindi-ingestion.md) out of the repo to `../teacher-guide-navigator-duplicates-2026-10-31/`;
  they made `verify:sources` report unregistered originals. Nothing deleted.
- [x] Extractor run: all pages decoded; Math G1 pdf 12, 13, 85, 86, 88, 89 have no text
  layer (images; need OCR or reading from the page image).
- [ ] Program profiles and page maps.
- [ ] PR to `next`.

## Checks
`python3 scripts/content/extract_matter.py`; `npm test`; `npm run verify:sources -- --require-complete`.
