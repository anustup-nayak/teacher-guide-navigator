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

Drive file IDs (folder 1KQa4pH58nRBC00VGItfbpx9JhBfJtKbK): TG G1 1AwGjmuTeYGVovRhLLOp39v0GGFOGTrz3,
TG G2 1Bvf5r9EqhHh8NCLt64Opeg2cuNGNJLMJ, TG G3 1EZTc_ZcLekvqczG2hjUDR8UzaTBLpfK8,
WB G1 1axTTkscK2Qh0j9L5WuktqnW33ftm2Gvl, WB G2 1pMWpkffNNMstsccYnInrqAI9SwY21RMZ,
WB G3 1jvZ1FddXpjbilTDmXB6a5LivDbfu9JNh. Too large for the Drive connector; use an
authenticated browser or a local copy.

## Owned files

`curricula/<new pack>/` (originals, extracted), this note, `docs/HANDOFF.md`.

## Progress

- [x] Located sources; owner chose scope and download route.
- [ ] Download and verify PDFs.
- [ ] Import originals with checksums into the new pack.
- [ ] Embedded-text extraction and page diagnosis.
- [ ] Visual inspection of representative pages.
- [ ] Present source structure, end-to-end plan and requirements questions.

## Unresolved

Pack ID and edition year to be confirmed from the covers.
