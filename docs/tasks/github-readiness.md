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
