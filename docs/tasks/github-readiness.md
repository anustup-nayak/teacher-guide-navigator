# GitHub archive and Pages delivery — 31 October 2026

Goal: preserve the complete source used by the current app, clean the repository
handoff and publish the requested teacher-guide-navigator GitHub repository/site.

Scope: ignore/attribute rules; source archive and verification; Pages workflow;
current run/deploy/archiving documentation and skill references. Runtime modules,
reviewed content, teacher storage keys and the 990 published images are unchanged.

Recovered the seven exact current PDFs through the authenticated browser after
Drive raw fetch failed. All hashes match the pre-existing published resource index:
three guides (400 pages), three workbooks (384), Grade 3 textbook (206). Archived
362,552,359 bytes of PDF originals. Rejected older local same-named guides because
checksums differed. Fresh embedded-text extraction covers 990 pages; 18 blank-text
pages are flagged for OCR. These drafts do not replace source-compared reviewed
content and are not the historical OCR intermediates.

Code/software licence remains unselected; CONTENT_RIGHTS.md preserves existing
rights and makes no third-party licence grant. Grade 1/2 textbook PDFs were never
part of the current rendered corpus and remain external references. No private
email content or sender contact details are included in the archive.

Validation: 69 Node regressions; 7 Python tests including archive tamper/missing/
unsafe-path cases; 4 skill-helper tests; syntax; publication/preservation equality;
strict original integrity/completeness; skill validation. Remote CI and live smoke
evidence are recorded below after actual completion.

Documentation impact: updated AGENTS, README, developer/pack/workspace docs and
skill entry/ingestion/release/intake. Canonical SOURCE_ARCHIVE and GITHUB_PAGES
explain the split between full repo and dist-only website. Historical transfer
manifest moved to docs/TRANSFER_MANIFEST.original.json to avoid implying current
checksums. Current PRD/runtime behavior and immutable baseline are unchanged.

## Published evidence

- Initial implementation commit: `86aa0e2`.
- Repository: https://github.com/anustup-nayak/teacher-guide-navigator
- Live app: https://anustup-nayak.github.io/teacher-guide-navigator/
- Initial Checks run: https://github.com/anustup-nayak/teacher-guide-navigator/actions/runs/41171644439 — PASS.
- Initial Pages validation/deployment: https://github.com/anustup-nayak/teacher-guide-navigator/actions/runs/41171644433 — PASS.
- A clean local clone passed Node/syntax, publication/preservation, strict source
  integrity and the skill preflight with no warnings.
- Browser smoke: Hindi/English Find, grade switching, legacy Grade 1 phase link,
  original-page reader and Escape return, all visible lesson images, and explicit
  offline preparation verified at the public project-prefix URL. No captured
  warning/error console entries or desktop horizontal overflow. Local prefix
  server independently passed lesson images and offline preparation.
- Production index, app module, worker and sampled guide image match local bytes.
- All seven PDFs were accepted by GitHub. Three trigger recommended-size warnings
  above 50 MiB; none exceeds the regular-Git 100 MiB limit. No LFS is currently used.

This evidence update changes documentation only; runtime remains r56. Remote
workflow results are also available in Actions for each subsequent commit.
Physical-device airplane mode, physical printing, screen-reader speech, teacher
observation and full independent academic review were not performed in this task.
The app-origin change does not migrate existing Sites/localhost notes.
