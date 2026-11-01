# Curriculum workspaces

Each curriculum has a stable state/subject/year pack ID and these stages:

```
curricula/<pack-id>/
  pack.json                  # staging/publication manifest, no credentials
  originals/                 # approved PDFs + checksums; committed archive
  extracted/                 # unreviewed pages.json archived; transient OCR/renders ignored
  tools/                     # source-family adapters; Math history in tools/legacy
  model/                     # whole-program metadata and canonical entities
  compat/                    # temporary legacy reconstruction fields
  reviewed/                  # current v1 publishable snapshot

content/<pack-id>/<version>/  # immutable compiled model, graph, metadata and views

dist/packs/<pack-id>/         # published files and page images for new packs
```

For compatibility, the existing UP pack publishes to the existing `dist/`
paths. Its guide/workbook/textbook images stay where they were. They are
published derivatives, not originals. `reviewed/` is the editable snapshot;
`dist/` is its published copy. The served app never reads this workspace.

The original transfer lacked PDFs; recovery status and current checksum checks are recorded in [source archive status](../docs/SOURCE_ARCHIVE.md). The reviewed snapshot is
an exact copy of the existing app content; it does not assert complete academic
approval.

## Local ingestion

From the project root (for extraction, install the optional dependencies with
`python3 -m pip install -r scripts/requirements-ingestion.txt`):

```sh
python3 scripts/curriculum_workspace.py init state-subject-year
python3 scripts/curriculum_workspace.py import state-subject-year /path/to/guide.pdf --kind guide --grade 8
python3 scripts/curriculum_workspace.py import state-subject-year /path/to/workbook.pdf --kind workbook --grade 8
python3 scripts/curriculum_workspace.py extract state-subject-year
```

The importer copies the PDF without changing the supplied file, records its
SHA-256, and uses a content-based filename. Re-importing the same document is
idempotent. Extraction checks that the original still matches its checksum.
Embedded text goes only into `extracted/<document-id>/pages.json`; blank pages
are flagged for OCR. All pages are explicitly unreviewed. Extraction requires
PyMuPDF (`fitz`); it does not perform OCR, infer teaching sequences or claim that
nonempty text is correct.

Read [program metadata](../docs/PROGRAM_METADATA.md) and fill the initialized
program-understanding scaffold and profile before modelling lessons. Read the whole
guide, including pedagogy, calendar, outcomes, assessment and non-lesson sections.
See [repository layout](../docs/REPOSITORY_LAYOUT.md) for canonical model/compiler
ownership and the temporary v1 boundary.

Review the extracted content against the PDFs, run any source-specific OCR or
mapping adapter with intermediate output under `extracted/`, and put normalized
`catalog.mjs`, `sources.json`, `resources.json`, `worksheets.json` in `reviewed/`.
Only list completed files in `pack.json.reviewedFiles`; set status to
`reviewed-snapshot` after the appropriate review. Preserve uncertain-content
notices; this status does not mean independent academic sign-off.

```sh
node scripts/publish_curriculum.mjs state-subject-year
node scripts/publish_curriculum.mjs state-subject-year --check
```

Publication is an explicit local copy of allowlisted reviewed files only.
Original PDFs and extraction output are never copied into `dist/`. New pack
page images must be rendered into `dist/packs/<pack-id>/` and use dist-relative
paths in the catalog and indices. Register the descriptor and its offline
modules as described in `docs/CURRICULUM_PACKS.md`. No deployment happens here.

For the current UP snapshot:

```sh
npm run verify:publication
npm test
npm run test:ingestion
npm run check
```

Keep `dist/` out of manual content editing: change/review the snapshot and
publish it explicitly. Application UI code in `dist/app.mjs` is still authored
in place; the project retains its buildless runtime.

The historical UP scripts predate this workspace. They assume a mixed input
folder and some overwrite `dist/` directly. They now live in `up-math-2026/tools/legacy/` and remain available for forensic
reproduction, but are not the new ingestion entrypoint. Do not run them against
`originals/` or the current publication. A future source-specific adapter must
honor the separate-stage contract.

## Unified grade and subject expansion

[Curriculum expansion contract](../docs/CURRICULUM_EXPANSION.md) is authoritative for multi-grade/subject
UP growth: one state app with top Grade/Subject controls, Balvatika as level0,
metadata-derived valid pairs and disjoint immutable deliveries. New content must
not overwrite any previous published payload, image path or teacher-data identity.
Run all-delivery publication checks and the preservation baseline gate; never
reset the baseline to bypass a failure.
