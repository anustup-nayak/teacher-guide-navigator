# Ontology-aligned layout and program metadata

Owner: Codex; isolated task/program-metadata-layout from the Phase 3 branch (PR #16
still open at start). Scope: metadata/schema/gates, legacy tool placement, core skill
and its templates, canonical folder/ingestion docs and tests. No dist/UI/teacher IDs
or content baseline changes. Old versioned releases remain byte-immutable.

Acceptance: every content build identifies program structure and an evidence-backed
understanding record; unresolved/absent source information remains honest. New-pack
intake understands the whole guide before lessons. Folder ownership and raw → model
→ release → consumer boundaries are clear. All compiler/parity/source/design gates pass.

## Implementation

- Added nine-dimension program-understanding schema and evidence/readiness gate.
  Pack and program metadata point to the profile, structured understanding,
  calendar/day types, sections and page map. Initialization creates honest empty
  scaffolds; blocking questions and absent evidence cannot pass compilation.
- Existing Math/Hindi summaries remain editorial/unreviewed with 2/3 acknowledged
  nonblocking questions. Documentation does not claim academic sign-off.
- Compiled immutable 1.1.0 releases snapshot this metadata, profile and page maps;
  retained 1.0.0 bytes remain untouched. Added shared query programStructure().
  Testing caught and fixed calendar ranges being misclassified as graph links.
- Moved Math-specific historical scripts to its pack tools/legacy, split reusable
  font decoder into scripts/ingestion; Hindi imports that shared primitive.
- Rewrote core skill around conversational intake, whole-program understanding,
  canonical ontology/releases, shared consumers, protected website and full QA.
  Added canonical repository-layout/program-metadata docs and updated active
  contracts, discovery, requirements template and compiler instructions.

## Verification underway

Python ingestion: 16/16. Skill helper: 5/5. Skill format validation PASS.
Full Node/compiler/source/publication/design checks and final diff review pending.
No browser UI was changed; no live deployment or v2 cutover is part of this task.
