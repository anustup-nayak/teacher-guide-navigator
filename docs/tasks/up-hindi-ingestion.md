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
- [ ] Then: decoder adapter, lesson mapping, source comparison, publish, register
  Hindi as a subject, full checks, PR.

## Unresolved

Pack ID `up-hindi-2026` chosen. Open: workbook edition mismatch; GitHub file-size
limit for the G3 workbook; Hindi textbooks were not supplied.
