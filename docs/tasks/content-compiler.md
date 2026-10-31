# Phase 3: content compiler

Owner: Codex, task/content-compiler, isolated worktree. Base next; local dependency
merge of task/ontology-decisions (PR #15 is open, despite an earlier handoff row
saying merged). No production/UI/design changes.

Goal: validated product-neutral static content releases and dependency-free query
library; byte-for-byte reconstruction of both v1 catalogs, immutable versioned
outputs, provenance, graph integrity, per-grade app views and changelog.

Phase 4/5 academic model population is separate: preserve unreviewed status and
explicit absent entities/links; do not infer approved pedagogy. Legacy-only fields
need a lossless compatibility envelope while canonical lesson/step content is
owned by the model. No retrieval/bot/generator or v2 UI.

Next: inspect adapter/schema gaps, implement importer/reconstructor, compiler,
query and tests.

## Implemented

Explicit non-overwriting importer; canonical lessons for all 732 day records; typed
asset/document references; lossless legacy-only bridge outside the model; schema,
source/day-type/period/slot/graph/ID validation; immutable staged releases with file
and entity/legacy hashes, changelog and per-grade views; pure query API with review
gates and honest absent-data results. All source instructions, including empty or
independent alternate instruction lists, reconstruct exactly.

Both 1.0.0 release views equal current published catalogs byte for byte. Ontology
1.0.0 frozen in this task branch. Full model population is deliberately pending.
No dist, page images, design lock, storage, production workflow or baseline changed.
The 33 MiB static releases remain repository artifacts; no new content endpoint is
served publicly.

Validation so far: 112 Node tests; 15 Python ingestion; 4 skill helper; syntax, design
lock, source integrity (13 originals), both reviewed publications and preservation
all pass. Manifest/output check is deterministic/read-only. Final CI/PR evidence
will be recorded below.

Documentation impact: compiler contract, model/platform/architecture/README and skill
release guidance; CI gains the committed content-output gate. PR depends on still-open
PR #15; it must be integrated before, or with, this compiler.

## Final local validation

112/112 Node tests, 15/15 Python ingestion tests and 4/4 skill-helper tests PASS.
`verify:content`, `check`, `design:check`, worker syntax, `verify:publication`,
strict source archive and `git diff --check` PASS. Both 1.0.0 releases rebuild
without rewriting any file. Output: 732 lessons, 4,036 qualified steps, 1,962 page
references, 46 static release files. Hashes and every graph endpoint are checked.

New negative cases cover edited canonical actions/instructions, invalid source
page/crop/slot/period/graph/identity, missing/tampered releases, symlink/unsafe output
paths, overwrite attempts by the migration importer, deletion of stable entities,
query isolation, proposed crosswalks, editorial visibility and legacy-only changes
in the changelog. Generated release/compatibility files are marked for collapsed
GitHub diffs; canonical model changes remain visible.

## PR and remote evidence

[PR #16](https://github.com/anustup-nayak/teacher-guide-navigator/pull/16) targets
`next`, with #15 explicitly declared as an open dependency. Implementation commit
`92663b9` passed both GitHub runs:
[push checks](https://github.com/anustup-nayak/teacher-guide-navigator/actions/runs/41214414045),
[PR checks](https://github.com/anustup-nayak/teacher-guide-navigator/actions/runs/41214444577).
The PR is mergeable. Neither PR was merged by this task; production remains r61.
A final documentation-only commit records this handoff; its CI must also pass.

Next agent: review/merge #15 before #16 (or inspect the dependency changes together),
then continue Phases 4–5 from next. Do not deploy these artifacts or create v2 UI
without the separate hosting/design decisions. Full live-site QA from the earlier
chat was superseded by the user's explicit choice to resume Phase 3; no stale r56
asset results were used as r61 release approval. Temporary browser preferences were
restored, and the live-test tab closed before compiler work.

## Dependency synchronized

PR #15 merged during close-out as `7c9556a`. Merged the new next head into this
branch; resolved only HANDOFF and CONTENT_MODEL documentation conflicts, preserving
all seven owner decisions and the compiler's tested v1.0.0 freeze. No runtime/model
source conflict. All local gates were rerun successfully on the synchronized branch.
PR #16 is the next integration step; its final head must pass GitHub checks.
Semantic versions now reject malformed or non-advancing previous/version pairs,
including prerelease numeric ordering.

## Taken over by Claude Code (31 Oct 2026)

Codex ran out of credits after `bcd106e`; its worktree was clean and pushed. The owner asked
Claude Code to continue and make sure the architecture-driven website works. Worked on a local
branch tracking `origin/task/content-compiler` (Codex's worktree untouched). Reran every gate on
`bcd106e`: 112/112 tests, `verify:content`, check, design lock, publication, ingestion 15/15, CI.

- **Gap found:** the app bundles lacked 412 of the 650 workbook pages the website shows (Math days
  4–6 and most Hindi days); they lived only in `compat/v1.json`. Fixed in the model: lesson-level
  `workbook` links (schema field, `v1_codec` importer, one-off model edit); nothing else in any
  lesson changed (checked field by field). Release **1.0.1** built with `--previous 1.0.0`; v1 views
  unchanged byte for byte; 1.0.0 untouched.
- **Website reads the release:** `content/website.json` pins 1.0.1; `scripts/content/publish_site.mjs`
  (`site:publish`, `verify:site`) copies hash-checked `views/v1` catalogs to `dist/`.
  `tests/site-from-release.test.mjs`: dist equals the pinned releases; app bundles carry every
  displayed field for all 732 lessons (4,036 steps).
- **Query library in a real browser:** loaded 1.0.1 over HTTP, all 16 files hash-verified with
  SubtleCrypto; `lesson`, `day`, `dayType`, `search` (Hindi), `cite` correct; routine/outcome
  queries empty (Phases 4–5); no globals touched.
- **Website QA on the release-driven build (localhost, 390 px):** every 3rd Math lesson (122) and
  all 366 Hindi lessons open with the right title and step count, no overflow; no empty ‘ ’;
  images load; no console errors.
