# UP Sandarshika lesson companion

Buildless static app for Grade 1–3 UP Mathematics guides shared for AY 2026–27. Hindi-first interface with English UI switch. Topic → two-line summary card → full lesson, or week → named day card → full lesson. No mandatory sub-topic accordion or Prepare/Teach gate. Original I do / We do / You do sections retain mapped week/day.

## Run and validate

For local development run `python3 -m http.server 8000 --directory dist` and open http://localhost:8000. Requires Node.js 22+ and Python 3.11+ for ingestion/archive tooling. Agents start with the [handoff log](docs/HANDOFF.md) (current state, active work, change log) and the [protected design contract](docs/DESIGN_CONTRACT.md); then read the [developer handoff](docs/DEVELOPMENT.md) and [agent instructions](AGENTS.md) before editing. Use the Sites managed preview workflow when developing inside ChatGPT Sites. `npm test` runs the catalog, UI-navigation, offline and workspace regression checks. `npm run check` checks application syntax; also check `dist/sw.js` after worker changes. There are no runtime packages or build step. `.openai/hosting.json` is retained as historical Sites metadata; GitHub Pages uses `.github/workflows/pages.yml`.

## Resources and source pipeline

366 mapped day plans: 183 direct teaching plans and 183 weekly plans. Grade 1 begins Week 9; Grades 2 and 3 begin Week 1. Weeks 13/20 expose the original periodic-review pages and workbooks without fabricated day records. Direct plans retain three 40-minute periods.

Preserve authorized original PDFs and checksum manifests under `curricula/<pack-id>/originals/`; see [source archive](docs/SOURCE_ARCHIVE.md). `scripts/decode_legacy.py`, `ocr_guides.py`, `index_guides.py`, and `extract_guides.py` form the original extraction pipeline. `scripts/prepare_resources.py SOURCE_ROOT dist` indexes printed worksheet headers and renders the complete supplied guides/workbooks and available Grade 3 textbook. `scripts/harden_content.mjs` applies source-compared repairs, removes known encoding artifacts, prepares summary cards, links worksheets and gives source-derived practice when no worksheet was supplied. It produces `docs/CONTENT_AUDIT.json`.

Eight image-only daily records and four weekly source pages (12 day records) were manually compared with original images. Repairs include 70% thresholds, materials, references and actual teaching instructions. Adapted practice is labelled. Original pages remain accessible inside an in-app reader. A separate academic reviewer has not signed off every instruction.

The 990 page images are loaded on demand (largest about 0.29 MB). They include all 400 guide pages, 384 workbook pages and 206 Grade 3 textbook pages. The two larger textbook PDFs exceeded the connector's 256 MiB retrieval limit; their printed-book references remain explicit. No required app button sends the teacher to Google sign-in.

## State and teaching flow

Device-only local storage retains notes, bookmarks, intentional/reversible taught status, per-class week preference and last teaching phase. Existing source-specific keys are preserved. Notes merge changed lesson keys to prevent stale-tab overwrites. Storage denial is disclosed. No student personal data, account, cloud sync or video claim is introduced.

Preparation, teaching phases, notes and references are visible inline. The complete lesson scrolls in source order, with wrapping sticky section chips for preparation, every teaching phase, notes and source pages. The current phase follows scrolling and chip jumps; original phase deep links and resume keys are retained. Completion is an explicit button after the teaching loop. Source-inspired blue navigation, amber teaching, pink practice and purple support have labelled roles and checked text contrast. Skip-to-content retains the current route. Original pages print with an honest label.

The service worker caches the shell. “Keep offline” explicitly downloads the lesson's guide page and mapped worksheets and reports failure unless all requested assets are cached. Increment both application VERSION and service-worker cache VERSION when releasing resource changes. Do not claim that unselected whole books are offline.

## QA and release

See `docs/QA_QC_RELEASE_CHECKLIST.md`, `docs/QA_REPORT.md` and `docs/CONTENT_AUDIT.json`. Functional testing does not establish classroom effectiveness or complete academic correctness. Real-device, real-teacher, full academic proofreading, screen-reader speech and physical-printer verification remain distinct checks.

Deploy the app using [GitHub Pages instructions](docs/GITHUB_PAGES.md). The repository archives approved source PDFs; the website artifact contains only `dist/`. Keep credentials, signed URLs, private correspondence and temporary browser harnesses out of both.

## Curriculum workspace separation

`curricula/<pack-id>/` separates local original PDFs, unreviewed extraction,
and reviewed normalized content. See `curricula/README.md` for the supported
staging workflow. `dist/` contains only the app's published content/assets.
The UP reviewed snapshot publishes to legacy paths to preserve compatibility;
new packs publish under `dist/packs/<pack-id>/`. Run `npm run verify:publication`
to detect reviewed/published drift and `npm run test:ingestion` for ingestion tests.

## Source-led visual cards

The lesson UI now combines original illustrations with compact instructions and
questions. Colours follow the supplied grade/template guides. Artwork enlarges
in a focused reader; original pages remain accessible. See
`docs/VISUAL_DESIGN.md` for source geometry, palette configuration and QA scope.

## UX audit release

The audit implementation is recorded in `docs/tasks/ux-audit-fixes.md`. The app
now distinguishes My list, checked offline copies and downloaded page files;
Help explains their storage and recovery limits. Reader Back/Forward stays in
the current lesson. Printed page numbers are shown only from verified metadata.

When changing page assets, run `npm run manifest` before release and increment
all versioned entry/import/CSS URLs, application VERSION and service-worker
VERSION together. The worker migrates unchanged downloaded images by SHA-256;
changed images must be downloaded again. `npm test` verifies the manifest,
shared-page removal, migration and cached HTTP-error fallback. A missing manifest
must not erase an older prepared cache. Full books are not automatically offline.

Help exports a readable text copy of notes and a lesson-context issue file;
there is no cloud sync, automatic issue transmission or automatic re-import feature.
The lesson-text size control supports up to 200%; physical TalkBack/printer and
independent academic/diagram-semantic review remain separate release checks.

## Reusable agent skill

The complete source-to-app workflow is packaged at
[skills/teacher-guide-to-app/SKILL.md](skills/teacher-guide-to-app/SKILL.md), with
history/decision provenance, ingestion and content contracts, design, QA/release
references, intake/review/report templates and a read-only preflight command.
`AGENTS.md` directs future agents to it; agents without automatic skill discovery
can read the entrypoint explicitly. No global installation is required.

Example request: “Use the teacher-guide-to-app skill in this repo with these
Teacher Guide and Workbook PDFs for [state, subject, grades, edition]. Add a
separate reviewed pack, preserve UP content/data, and run its full validation.”

The skill makes the workflow reproducible; unseen PDF layouts still require
source-specific extraction and review. See its historical record for retrieval
gaps and its QA matrix for checks that require real teachers/devices/printers.

## Product contract and modular instances

[PRD](docs/PRD.md) defines what the product should do, priorities, exclusions and
success measures. [Architecture](docs/ARCHITECTURE.md) defines shared context,
services, reader/offline features, media views and separate curriculum descriptors.
The skill now starts with TG/workbook PDFs, inspects them, clarifies user goals and
freezes a concrete requirements brief before new-pack implementation. Each pack
uses the shared runtime and an isolated namespace rather than a copied app.

`npm run release:assets -- rNN` coordinates runtime versions and derives the
service-worker shell from the module graph; `npm run check` checks all dist
modules recursively. The command neither publishes content nor deploys the site.

## Unified grade and subject expansion

[Curriculum expansion contract](docs/CURRICULUM_EXPANSION.md) is authoritative for multi-grade/subject
UP growth: one state app with top Grade/Subject controls, Balvatika as level0,
metadata-derived valid pairs and disjoint immutable deliveries. New content must
not overwrite any previous published payload, image path or teacher-data identity.
Run all-delivery publication checks and the preservation baseline gate; never
reset the baseline to bypass a failure.

## Source archive and GitHub Pages

All seven PDFs used by the current app are archived with matching published-source
SHA-256 checksums, alongside fresh unreviewed embedded-text extraction for 990 pages.
See [source archive](docs/SOURCE_ARCHIVE.md), [GitHub Pages setup](docs/GITHUB_PAGES.md)
and [content rights](CONTENT_RIGHTS.md). `npm run verify:sources -- --require-complete`
checks completeness and integrity independently of app content validation.
