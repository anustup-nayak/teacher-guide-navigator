# Repository layout and ownership

One source archive and canonical model serve multiple front ends. Do not copy a
curriculum into each app or derive the model from UI components.

| Location | Owns | Lifecycle |
|---|---|---|
| `curricula/<pack>/pack.json` | Workspace, publication and program metadata pointers | Stable pack identity |
| `curricula/<pack>/originals/` | Authorized supplied PDFs and checksum manifest | Immutable source archive; not Pages payload |
| `curricula/<pack>/extracted/` | Unreviewed text/OCR and source page extraction | Reproducible staging, never authoritative teaching content |
| `curricula/<pack>/tools/` | Source-family adapters | Pack-specific parsing; explicit staging targets |
| `curricula/<pack>/model/` | Program understanding, structure, entities, source references and review status | Canonical product-neutral authoring input |
| `curricula/<pack>/compat/` | Temporary legacy reconstruction fields | Migration bridge; no duplicate canonical teaching text |
| `curricula/<pack>/reviewed/` | Existing v1 publishable snapshot | Current production repair/publication path, not an independent v2 ontology |
| `content/<pack>/<version>/` | Validated immutable entities, graph, program metadata and front-end views | Compiler output; never edit by hand |
| `content/query.mjs` | Shared product-neutral query interface | Website and future consumers use the same release |
| `schemas/` | Model and release contracts | Additive compatibility after published versions |
| `scripts/content/` | Shared compiler, validation, explicit migration | No source-family schedules or UI logic |
| `scripts/ingestion/` | Reusable decoding primitives | Reuse only after verifying source font/encoding |
| `dist/` | Authored buildless website and published v1 content | Only directory deployed to Pages |
| `skills/teacher-guide-to-app/` | Conversational intake, program-first workflow, QA and recovery | Links to canonical contracts rather than duplicating them |
| `docs/tasks/` | Dated task evidence | Historical records, not new instructions |

The original Math publication keeps its existing `dist/` paths. Hindi uses
`dist/packs/up-hindi-2026/`. Preserve both, all earlier grade/subject deliveries,
IDs, image URLs and teacher-data namespaces. Balvatika is grade 0; availability is
metadata-driven, never a set of fake empty grade/subject options.

## Flow and boundaries

1. Import originals with checksums; extract into staging.
2. Understand the *whole* program using [PROGRAM_METADATA.md](PROGRAM_METADATA.md):
   guide architecture, calendar, outcomes, day types, pedagogy, assessment,
   materials, teacher guidance and page mappings. Record gaps and evidence.
3. Author the canonical model and explicit review/provenance. Preserve missing
   content; do not manufacture links or pedagogical phases.
4. Compile a new immutable release with entities, graph, metadata and views.
   [CONTENT_COMPILER.md](CONTENT_COMPILER.md) defines validation and query loading.
5. A consumer loads a pinned release; its presentation never becomes the source
   of truth. V2 releases remain repository artifacts until cutover is authorized.

For existing v1 repairs, inspect and change `reviewed/`, then explicitly publish
allowlisted files and run preservation checks. Keep corresponding canonical model
and compatibility changes consistent through the byte-parity gate. Never rerun the
one-time importer to erase authored model work. This temporary dual boundary is
intentional until the approved runtime cutover.

## Historical source adapters

UP Math scripts that once lived at the repository scripts root now live in
`curricula/up-math-2026/tools/legacy/`. Some overwrite the historical publication;
they are retained for forensic reproduction, **not** a supported new-pack command.
Their relative imports resolve to the same assets/shared decoder; run syntax and
ingestion tests without executing destructive historical pipelines.
Hindi adapters remain under its own `tools/`. Shared legacy font decoding lives
in `scripts/ingestion/legacy_fonts.py`; source schedules and manual corrections
belong in their pack. Do not run any legacy adapter against immutable originals.
