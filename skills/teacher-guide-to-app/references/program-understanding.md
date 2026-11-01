# Program understanding comes before lesson modelling

Canonical metadata contract: `docs/PROGRAM_METADATA.md`; folder ownership:
`docs/REPOSITORY_LAYOUT.md`. Read the whole guide's architecture before choosing
what to extract or how to render lessons. An attractive lesson screen is not a
substitute for understanding how the program expects teachers to work.

For each grade/edition inspect the contents and every relevant program section:
usage, front/back matter, pedagogy, scope/sequence, weekly/unit cycles, period
outlines, routine explanations, materials, assessments, remediation, trackers and
workbook instructions/parts. Render image-only or corrupt pages; record uncertainties.
Do not call this independent academic proofreading.

The mandatory metadata dimensions are:

1. guide architecture: what each source section is for;
2. calendar/sequence: coverage, readiness/review, teaching units and exceptions;
3. learning outcomes: printed lists/codes/hierarchies, authoritative list and crosswalk policy;
4. day types/periods: source-native cycle, timings, slots, combined/open periods;
5. pedagogy/routines: what/why/how/watch-outs and grade differences;
6. assessment/remediation: when, instruments, thresholds, grouping and next teaching actions;
7. materials/workbooks: book parts, headers, kit/resources and missing coverage;
8. teacher guidance: articles, usage principles and support beyond daily plans;
9. page mapping: all source pages accounted for, printed/PDF distinction and verified joins.

Write an explanation in `model/PROGRAM_PROFILE.md` and a machine-readable record
in `model/program-understanding.json`. Give every dimension a source citation,
summary and honest status/review. `not-stated` requires evidence of inspected scope;
`not-applicable` requires a reason. Uninspected/unresolved dimensions and open blocking
questions fail the readiness gate. Non-blocking uncertainties remain explicit.
The initializer creates incomplete scaffolds, never a documented/approved program.

Record user choices separately in the frozen brief: a teacher workflow is a product
decision, while assessment timing and textbook coverage are source facts. The owner
can accept an explicit limitation; do not invent a source statement or review stamp.

Metadata must be reachable from `pack.json.metadata`, `model/program.json.structure`
and the compiled manifest's `programStructure`. Use the Node gate for complete
schema/evidence/readiness validation; skill preflight is a read-only preliminary gate.
Every future pack/grade/subject repeats this source-specific understanding, including
its differences from earlier packs. Existing UI-only repairs need no ceremonial intake.
