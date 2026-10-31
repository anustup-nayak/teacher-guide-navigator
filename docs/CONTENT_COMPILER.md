# Content compiler and query contract — Phase 3

The ontology began at v1.0.0: the Phase 3 gate reconstructs both current v1 catalogs byte
for byte (732 lessons) without copying the catalog as the build output. Changes to
published model vocabulary/schema fields are additive after this version. The
model is only partly populated: Phases 4–5 supply outcomes, sequence, routines,
materials, assessments and program-guide passages. That missing work is explicit
in each release manifest; no links or academic approval are inferred to fill it.

Program understanding is mandatory authoring metadata; see
[PROGRAM_METADATA.md](PROGRAM_METADATA.md) and [REPOSITORY_LAYOUT.md](REPOSITORY_LAYOUT.md).
Current releases use schema 1.1.0, adding program metadata snapshots without
changing retained 1.0.0 releases or the production website.

## Inputs and ownership

- `curricula/<pack>/model/program.json`: pack identity and archived document metadata.
- `structure.json`, `sections.json`, `pagemap.json`: program/page maps.
- `program-understanding.json`, `PROGRAM_PROFILE.md`: nine evidence-backed inspection
  dimensions, whole-program synthesis, explicit questions and honest review status.
  `pack.json.metadata` and `program.json.structure` must reference these records.
  The compiler refuses incomplete understanding or open blocking questions.
- `lessons/<grade>.json`: canonical day/period/step records. Titles, actions, minute
  values, questions, exact instruction variants and source references live here.
  `instructions: []` means no alternate instruction list; consumers fall back to
  actions. This additive field preserves v1 variants without rewriting teaching text.
- `assets.json`: typed document-page/image references, not copied images.
- Optional schema-validated `outcomes.json`, `sequence.json`, `routines.json`,
  `materials.json`, `assessments.json`, and `guide/<grade>.json` are loaded when supplied.
- `curricula/<pack>/compat/v1.json`: legacy-only fields, property/phase/lesson order,
  module prefix and auxiliary exports. This is a migration bridge outside the
  product-neutral model. It contains no duplicate canonical actions/instructions,
  titles or timings; reconstruction takes those from the model. Remaining legacy
  fields are not claimed as a fully authored v2 model. Retire bridge fields as later
  phases model their meaning; never discard information to get parity.

The one-time migration command is explicit and refuses to overwrite authored files:

```sh
node scripts/content/import_v1.mjs --write-model up-math-2026
```

It is already complete for both existing packs. Do not rerun it during builds or
use it to reset an edited model. Its adapter starts from reviewed v1 content;
normal compilation reads model/compatibility JSON and only compares against the
published catalog for the parity gate. No PDF, OCR, extraction or browser execution
is part of the build. Legacy module text is parsed as JSON, never evaluated.

## Build, verify and immutable releases

Requires Node 22+. No npm dependency/install or build framework.

```sh
npm run verify:program
npm run content:build -- --version 1.1.0 --previous 1.0.0
npm run verify:content
# Next content version, after model review and matching v1 repair if necessary:
npm run content:build -- --version 1.1.1 --previous 1.1.0
```

Optional final arguments select pack IDs. The current `verify:content` command pins
1.1.0 with previous 1.0.0; change its pinned version/previous version in the same reviewed PR when the
current canonical models advance. Older directories remain immutable; rebuilding
an older release from newer models is not a supported update mechanism.

Output: `content/<pack>/<version>/`:

| File | Purpose |
|---|---|
| `manifest.json` | schema/version, entity/review counts, pending model families, input hashes, per-entity and legacy hashes, output-file hashes/UTF-8 byte counts |
| `entities/<kind>.json` | nodes by kind: program, document, daytype, lesson, step, section, passage, lo, objective, unit, routine, material, assessment, resource, workbook |
| `graph.json` | typed links with origin, review, rule and available source; qualified step IDs (`step:<lesson>/<step>`) avoid cross-lesson collisions |
| `structure.json` | calendar, day types, slots and explicit exceptions |
| `program-understanding.json`, `PROGRAM_PROFILE.md` | evidence-backed whole-program understanding and questions |
| `sections.json`, `pagemap.json` | guide architecture and page mapping snapshots |
| `views/app/grade-N.json` | independently loadable canonical grade bundle, tagged with pack/version |
| `views/v1/catalog.mjs` | byte-identical legacy module, including auxiliary exports |
| `CHANGELOG.json` | added/changed/removed qualified IDs and added/changed/removed files relative to an explicitly named previous release |

Manifest `files` hashes every other release file; it excludes itself to avoid a
recursive hash. `entityHashes` cover canonical nodes; `legacyHashes` ensure a
legacy-only correction still reports the affected lesson ID. File changes also
expose auxiliary-export changes and version metadata changes. Output has no clock
or ambient Git state, so the same explicit inputs produce identical bytes.

All validation/parity checks run before output is written. A new directory is
staged then renamed. Repeating identical output is a no-op (no timestamp rewrite).
An existing version that differs, an extra output file, an unsafe path or a symlink
fails. `--check` is read-only and fails on missing/stale output. A previous release
cannot belong to another pack; the new semantic version must be strictly higher
(including prerelease ordering); deleting stable entities
is rejected. Deprecate a record rather than dropping its ID.

The compiler validates schemas, day-type/period/slot and grade coverage, duplicate
IDs, typed graph targets, document/page/crop references, local image existence,
review/rule metadata and v1 parity. Source approval is not established by these
software checks. Explicit source-variant exceptions remain source variants.

## Query library

`content/query.mjs` exports `createContentQuery({manifest, entities, graph, structure, understanding})`.
It is plain ES: no imports, filesystem, network, browser APIs or global app state.
The host loads release JSON and verifies manifest hashes before constructing it.
`entities` maps each manifest kind to its JSON array. A website may load a pinned
grade bundle and the relevant entities/edges; server-side tools can load the same
release without a browser.

Load `structure.json` and `program-understanding.json` into the corresponding
properties to use `programStructure()`, which returns references, structure and
understanding. Retained releases without these properties return null metadata.
This accessor uses the same review projection as other queries; unapproved
editorial summaries remain hidden, but evidence and readiness status are available.

Queries: `lesson(id)`, `day(grade, week, day)`, `dayType(lessonOrId)`, `routine(id)`,
`stepsByRoutine(id)`, `lessonsForOutcome(code)`, `assessmentFor(grade, week)`,
`remediationFor(grade, week, outcome?)`, `passages(sectionId)`, `search(text, filters)`,
`cite(qualifiedIdOrLessonId)`, plus `entity(kind,id)` and `links(from,relation?)`.
Missing data returns null/empty results, not guessed routines/outcomes or schedules.
Search covers source/teaching text, normalizes equivalent Hindi and local digits,
and supports grade/kind/week/limit. It does not search internal metadata as content.
Citations retain document, PDF page, honest printed label, optional crop and image
path. Image paths are relative to the website's asset root; callers supply its URL.

Default policy: stated source content keeps its existing honest review status;
editorial entities/summary/classroom-action fields and derived/crosswalk links need
`reviewed` or `owner-approved`. `source-compared` is not an approval for a derived
curriculum assertion. Authoring tools can explicitly opt into
`includeUnreviewedLinks: true`; the website must use the default. Outputs are
projected copies; consumers cannot mutate the query's internal release.

## Release boundaries and validation

The retained 1.0.0 and new 1.1.0 releases live in the repository on `next`; they are **not published
to the production website**. `dist/`, its pipeline, storage keys, caches and design
lock are unchanged. There is no retrieval view, chatbot, generator or v2 UI in this
phase. Preview/public `/content/` hosting remains a separate owner decision.

`npm test` covers all 732 reconstructed records, deterministic output, manifest
integrity, grade views, graph/query isolation, mutation-to-parity failures, invalid
schema/source/slot/ID/graph cases, immutable writes and changelogs. CI additionally
runs `npm run verify:content` against the committed release directories. Run the
existing design/publication/source/ingestion/skill gates as well.
