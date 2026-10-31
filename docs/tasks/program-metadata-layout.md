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

## Verification

- Full final Node suite: 116/116 PASS. The first full run caught outcome links
  leaking through an overly narrow graph-edge predicate; fixed typed-string link
  recognition while preserving numeric calendar ranges, then reran all tests.
- Program readiness: both packs PASS, nine dimensions each; strict preflight with
  source/review/program flags PASS for both packs.
- Immutable 1.1.0 compiler verification and 732-lesson v1 byte parity PASS.
  Retained 1.0.0 release file hashes pass the new regression test.
- Published payloads and all 1,962 prior page assets preserved; publication gate PASS.
- Python ingestion 16/16; skill helpers 5/5; skill format validation PASS.
- Source archive complete: 13 PDFs verified, no missing files or checksum errors.
- Protected design lock, module graph, worker syntax, moved Python/JS syntax PASS.
  Shared font mapping/function body unchanged; no obsolete active tool references.
- Staged diff check PASS; no dist, design-lock, preservation-baseline or 1.0.0 edits.

The first complete preservation scan took about 16 minutes in the fresh worktree;
after asset reads completed, the final full Node run took 4.2 seconds.
No browser UI was changed; no live deployment or v2 cutover is part of this task.

Program metadata also requires source evidence covering every declared program
grade, so extending an existing pack cannot silently reuse metadata with no
understanding evidence for the new grade. Added to the negative gate regression.

## Integration and completion

[PR #17](https://github.com/anustup-nayak/teacher-guide-navigator/pull/17) targets
next and depends on open compiler PR #16. All local gates pass; final PR head CI
must pass before integration. No merge or production deployment performed. Core
skill, metadata schema/gate, compiler/query and canonical documentation describe
the same structure. Remaining academic and physical-device/teacher checks are
unchanged and are not claimed as completed here.
