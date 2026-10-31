# Program understanding metadata

Program structure is a first-class curriculum feature, not an ingestion note.
Every new pack must explain the entire Teacher Guide program before individual
lessons are modelled. The same metadata accompanies every compiled release and is
available to all front ends through the shared query contract.

## Authoritative records

`pack.json.metadata` points to `model/program.json`, `model/structure.json`,
`model/program-understanding.json` and `model/PROGRAM_PROFILE.md`.
`program.json.structure` names `structure.json`, `program-understanding.json`,
`PROGRAM_PROFILE.md`, `sections.json` and `pagemap.json`. These are model-relative
and release-relative names, not machine-specific paths.

| Record | Responsibility |
|---|---|
| `program.json` | Identity, state, subject, grades, edition, documents and metadata references |
| `PROGRAM_PROFILE.md` | Readable synthesis of the whole program with evidence and limitations |
| `program-understanding.json` | Machine-checkable inspection status, evidence and unresolved questions |
| `structure.json` | Calendar ranges, day types, periods, slots and explicit source exceptions |
| `sections.json` | Guide architecture, including non-lesson teacher guidance |
| `pagemap.json` | PDF/printed-page mapping and source coverage |
| Model entity families | Outcomes, sequence, lessons/steps, routines, materials, assessments and guide passages |

Metadata completeness does not imply that all entity families are populated. The
manifest reports pending families; later phases author them with source evidence.

## Nine required dimensions

Every dimension must appear exactly once in `program-understanding.json`:

1. `guide-architecture`: front matter, contents, teacher guidance, schedules and lesson families.
2. `calendar-sequence`: year/unit/week/day organization, readiness, review, assessment and gaps.
3. `learning-outcomes`: LO codes/statements, numbering, progression and source relationships.
4. `day-types-periods`: daily/weekly templates, periods, timing and exceptions.
5. `pedagogy-routines`: teaching loop, modelling, practice, grouping, repeated routines and variants.
6. `assessment-remediation`: when/how learning is checked and how support is planned.
7. `materials-workbooks`: tasks, workbook/textbook availability, mappings and missing parts.
8. `teacher-guidance`: non-lesson instructions, implementation guidance and contextual support.
9. `page-mapping`: PDF pages versus printed labels, images, crops and source citations.

Each entry carries a summary, explicit status, page evidence and provenance/review
status. `not-stated` requires inspected source evidence; `not-applicable` requires a
reason. Empty, `not-inspected` or `unresolved` entries cannot pass compilation.
Questions record their dimension, whether they block work, evidence, status and the
actual resolution. Open blocking questions stop compilation; acknowledged
nonblocking limitations remain visible. Do not silently discard gaps to pass.

## Readiness and review are separate

Initialization creates `not-started` metadata and nine empty `not-inspected`
entries. Agents must read the PDFs, fill the profile and evidence, resolve blocking
questions and set the overall status to `documented`. This is a workflow readiness
claim, **not** independent academic approval. Existing Math/Hindi summaries remain
editorial and unreviewed, with known gaps explicitly open.

```sh
python3 skills/teacher-guide-to-app/scripts/preflight.py --help
npm run verify:program
npm run verify:content
```

Use preflight's `--require-program` alongside existing source/review flags for
new source work. The Node gate validates the full schema, exact metadata pointers,
nine unique dimensions, evidence covering every program grade, nonempty rationale,
available document/page references,
profile and blocking questions. Compiler validation also checks the actual
calendar/day types and all model relationships; a prose checklist cannot replace it.

Releases from schema 1.1.0 snapshot the profile, understanding, sections and page map
alongside structure; the manifest hashes them and exposes `programStructure`
references/status/review/dimension coverage. Retained 1.0.0 releases stay unchanged.
Consumers load those JSON snapshots and call `query.programStructure()` (see
[compiler contract](CONTENT_COMPILER.md)). Unapproved editorial summaries are
omitted by the default query projection; status, provenance and citations remain.
Front ends may present source-grounded program navigation without inventing a
calendar, outcome crosswalk or assessment relationship.

## Conversation and changes

Read the whole source program, explain it back in familiar language, and clarify
only material ambiguities with the user before freezing the requirements brief.
Keep source facts, owner choices and editorial adaptations separate. A new grade,
subject or source edition must update this metadata and its evidence, profile,
model, release and regression cases together; preserve previous deliveries and
teacher-data identities. See the core skill and [repository layout](REPOSITORY_LAYOUT.md).
