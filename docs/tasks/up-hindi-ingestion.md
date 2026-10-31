# UP Hindi (literacy) Grades 1–3 ingestion — started 31 October 2026

Goal: ingest the UP Hindi Teacher Guides and Workbooks for Grades 1–3 as a new,
separate curriculum pack in the same UP app, following
`skills/teacher-guide-to-app/SKILL.md`. This note covers discovery first; no app
code, CSS, Math content or teacher-storage change until the requirements brief
is agreed with the owner.

Branch / agent: `task/up-hindi-ingestion` · Claude Code.

## Sources (from Renu Chauhan, email “UP Literacy TG & WB”, 31 Oct 2026, Drive folder)

| File | Kind | Grade | Drive size |
|---|---|---|---|
| UP Literacy TG Grade-1 with Grid.pdf | guide | 1 | 35,257,475 B |
| UP Literacy TG Grade-2.pdf | guide | 2 | 59,548,358 B |
| UP Literacy TG Grade-3 (1).pdf | guide | 3 | 45,587,185 B |
| WB Sarangi Grade-1.pdf | workbook | 1 | 27,397,388 B |
| WB Grade-2 Sarangi.pdf | workbook | 2 | 60,291,357 B |
| WB Grade-3 Veena 1 (18 march 25).pdf | workbook | 3 | 134,741,977 B |

Owner decisions so far: include Grades 1–3; download through the in-app browser.
Owner direction (31 Oct 2026): keep it simple. Hindi is added as a subject inside the
existing Math app (same screens, same flow, a Hindi option in the Subject selector).
No separate app, no new design; minimise questions and reuse existing components.

Drive file IDs (folder 1KQa4pH58nRBC00VGItfbpx9JhBfJtKbK): TG G1 1AwGjmuTeYGVovRhLLOp39v0GGFOGTrz3,
TG G2 1Bvf5r9EqhHh8NCLt64Opeg2cuNGNJLMJ, TG G3 1EZTc_ZcLekvqczG2hjUDR8UzaTBLpfK8,
WB G1 1axTTkscK2Qh0j9L5WuktqnW33ftm2Gvl, WB G2 1pMWpkffNNMstsccYnInrqAI9SwY21RMZ,
WB G3 1jvZ1FddXpjbilTDmXB6a5LivDbfu9JNh. Too large for the Drive connector; use an
authenticated browser or a local copy.

## Owned files

`curricula/<new pack>/` (originals, extracted), this note, `docs/HANDOFF.md`.

## Progress

- [x] Located sources; owner chose scope and download route.
- [x] Downloaded via the owner's Chrome (in-app browser could not hold the Google
  sign-in) to `~/Downloads/up-hindi-sources/`; sizes match Drive exactly; all six
  open in PyMuPDF, unencrypted, valid header/trailer. 972 pages.
- [x] Imported into pack `up-hindi-2026` (AY 2026–27 from the Drive path and TG covers)
  with SHA-256 manifest. PDFs are **not committed yet**: the G3 workbook is 134.7 MB,
  over GitHub's 100 MB per-file limit (largest Math original is 95 MB).
- [x] Embedded extraction: 971/972 pages have text, but **0 Unicode Devanagari**.
  All Hindi is in legacy fonts (Kruti Dev 010, BHARTIYA-HINDI_057/115/218,
  A-SuperHindi-1, Walkman-Chanakya905). Bold is drawn as doubled runs
  (`oh.kkoh.kk`).
- [x] Decoding probe (`curricula/up-hindi-2026/tools/discovery_probe.py`) using
  `scripts/decode_legacy.py` on all legacy-font spans plus run de-duplication gives
  mostly correct Hindi. Systematic font-specific errors seen: `वेळ`→के,
  `¢`→ँ (chandrabindu), `fÚयान्वयन`→क्रियान्वयन, `संद¤शका`→संदर्शिका,
  `चित्रां े`→चित्रों, `स्वूळल`→स्कूल. Needs a per-font correction table checked
  against page images; OCR (Tesseract `hin` installed) as a cross-check.
- [x] Visual inspection (TG G1 p20, WB G1 p15): same anatomy as Math. Week/day
  badge; three 40-minute periods (कालांश-1 मौखिक भाषा विकास, कालांश-2 कार्यपुस्तिका,
  कालांश-3 बिग बुक / remedial); timed steps 1.1, 1.2…; materials; question boxes;
  two-column layout. Workbook pages have week/day badge, पाठ number, printed page.
- [x] Coverage (`tools/discovery_inventory.py`): TG G1 weeks 9–25 (~93 days),
  TG G2/G3 weeks 1–25 (~141 days each); weeks 13/20 are short review weeks;
  weekly-plan (साप्ताहिक/योजना) and assessment (आकलन) pages present. Workbooks:
  G1 weeks 9–25, G2/G3 weeks 5–25, 5 days a week.
- [x] Edition years on covers: TGs 2026–27; workbooks G1 2024–25, G2 2025–26,
  G3 2025–26.
- [x] Owner: use these workbooks for now and ask Renu on the same thread; reply
  drafted in Gmail (not sent until the owner approves the wording).
- [x] Owner chose Git LFS for the 135 MB workbook. Installed git-lfs 3.8.1, enabled
  with `--local`, tracked by exact path. `verify_source_archive.py` now accepts
  >100 MiB only when LFS-tracked and verifies LFS pointers against the manifest, so
  CI does not download LFS content. Tests: 9/9 ingestion. Simulated CI clone
  (`GIT_LFS_SKIP_SMUDGE=1`): verify:sources ok (13 documents, 1 pointer), npm test 75/75.
- [x] Decoder `tools/hindi_text.py`: per-family glyph fixes before the shared Kruti
  mapping (क/फ hook glyphs, Chanakya \x01 spaces, Ú ¢ Û Ç ý õ É ä ± » ¤ £). Words with
  the ळ mis-decode: 8,978 → 10 across all 972 pages. `tests/test_hindi_decoder.py`
  covers 20 real words checked against page images.
- Build design (keeps existing screens): every TG day 1–6 is a full 3-period plan,
  so no weekly-template records. One phase per source step (1.1, 1.2 …) with
  `period` "N · <period title>" and source minutes; period colours via a generic
  phase `role` (period 1 teaching/amber, 2 practice/pink, 3 support/purple, as on the
  printed pages). Weeks 13/20 are one-page review tables → `reviewPages`. Topics =
  the TG's own annual objectives by week block (G1 p15).
- [x] TG parser `tools/parse_guides.py` (+ `visible_text.py`, `audit_guides.py`,
  `show_day.py`). Output `extracted/adapter/guides.json` (reproducible, not committed):
  G1 90 days (weeks 9–25), G2/G3 138 days (weeks 1–25); weeks 13/20 are review tables.
  Day 6 usually has कालांश-2 एवं 3 (80 min weekly assessment) — source structure.
  Fixed on the way: Unicode \b vs Devanagari; step numbers printed right of titles;
  raised small text (समूह-A, workbook page icons); scrambled glyph order on some lines
  (rebuilt from glyph positions); older edits printed under current text (G3 p127) and
  clipped tails (G2 p19) — earlier overdrawn spans dropped, rawdict honours clipping;
  letter/word grids (drawn squares ≥30pt) kept out of prose and attached to their step
  for page crops; 59 “क्या आप जानते हैं?” tip boxes excluded from steps.
- Source misprints kept as printed (app numbers cards itself): duplicate step numbers on
  G1 w10d6, w14d2; G2 w6d1, w17d2, w25d5; G3 w16d4, w21d3, w22d5.
- Needs reviewed repair: G3 w19 d6 period 1 (two overprinted edits). Transcribed from a
  120-dpi render: 1.1 शिक्षक द्वारा अनुभव सुनाना (7–10), 1.2 बच्चों द्वारा अनुभव साझा
  करना (10–15), 1.3 लेखन कार्य (10–12); 1.3 names ‘मेरा प्यारा मित्र’ as printed.
- Review list: G3 w4 d3 period 2 objective loses a bare vowel sign inside quotes.
- [x] Workbook mapping (`tools/parse_workbooks.py`): workbooks have 5 days/week against
  the guide's 6, so the guide's printed page-number icons decide the page; the icon's
  line says workbook or textbook. All cited workbook pages exist; textbook refs are kept
  as printed-book references (no Hindi textbooks supplied). This also answers the edition
  question provisionally: the 2024–25/2025–26 workbooks match the 2026–27 guide citations.
- [x] Built (`tools/build_pack.py`): 366 lessons, 2,752 steps, 332 workbook links, 175 grid
  crops, 972 WebP pages (125 MB) in `dist/packs/up-hindi-2026/`. Topics = annual-objective
  week blocks (printed p13). Registered after Math in `dist/curricula.mjs`; storage
  namespace `up-hindi-sandarshika-2026-v1`. Release r57 (record:additions, manifest,
  release:assets).
- [x] Generic app edits (no protected file, Math unchanged): phase `role` drives card/chip
  colour; `worksheetPreview` shows the workbook page on the step that uses it;
  `validateCatalog` totals minutes only when all are whole numbers (Hindi keeps ranges).

## Checks (31 October 2026)

npm test 80/80 (5 new Hindi-pack tests, design lock 6/6); npm run check; design:check;
sw.js syntax; verify:publication (both packs, all prior payloads/pages preserved);
test:ingestion 12/12; skill tests 4/4; verify:sources --require-complete; publish --check
for both packs. Browser (localhost): Math default and legacy query-less deep link
unchanged; subject switch to हिन्दी; 4 Grade 1 topics (90 lessons); G1 w9 d2 lesson
(7 steps, period colours, workbook page 6 preview); grid crop G1 w17 d5; combined
कालांश 2 एवं 3 on G2 w1 d6; repaired G3 w19 d6; week route incl. सप्ताह 13 review;
English UI; 360 px no horizontal overflow; separate storage namespaces; no console errors.
Not run: 390 px, keyboard-only pass, offline download of a Hindi lesson, real phones.

## Known limits / follow-ups

- 2026-10-31 r58: G2 w19 d3 repaired (periods 2–3); see [repair task](repair-g2-hindi-w19-d03.md).
- 2026-10-31 r59: grid crops now follow the step's column (133 moved); see [grid task](hindi-grid-columns.md).

- Text is decoded, audited for all 366 days and compared on sampled lessons (G1 w9 d2,
  G2 w1 d5–6, G3 w3 d4, w4 d3, w19 d6, G1 w10 d6, w17 d5); not proofread line by line.
  Lessons carry contentStatus `decoded-unreviewed` and a visible extraction notice.
- Review list: G3 w4 d3 objective loses a bare vowel sign in quotes; G3 w19 d6 cites
  workbook p82 (labelled week 18 day 5); 8 source step-number misprints kept.
- Both subjects' catalogs load at startup (Hindi 6.4 MB, ~455 KB compressed). Loading a
  subject's lessons only when selected would halve first-visit download (follow-up).
- Repository is ~0.85 GB on GitHub plus 135 MB in LFS; future packs should consider
  LFS or an external archive for originals.

## Documentation impact

README, CURRICULUM_EXPANSION (current coverage), CURRICULUM_PACKS (phase `role`,
`worksheetPreview`, minute ranges), MVP_ACCEPTANCE note, SOURCE_ARCHIVE (LFS),
skill ingestion reference (lessons from the Hindi adapter), HANDOFF.

## Unresolved

Pack ID `up-hindi-2026` chosen. Open: workbook edition mismatch; GitHub file-size
limit for the G3 workbook; Hindi textbooks were not supplied.
