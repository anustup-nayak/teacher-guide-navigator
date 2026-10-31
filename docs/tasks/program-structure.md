# Program structure first (calendar, day types, exceptions)

Owner request (31 Oct 2026): lesson structure differs by subject, and some days (assessment)
do not fit the teaching-day shape, so build metadata from a clear understanding of the program
structure first, then the schemas. Branch `task/program-structure` from `next`; PR to `next`.

## Owned files
- `schemas/content-model/structure.schema.json` (new); `vocabularies.json` (added values:
  dayPurpose explore / consolidation-assessment / remedial-revision; periodRole assessment / open;
  new planForm, weekPhase, exceptionKind); `program.schema.json` (calendar, cycle and periods
  moved out); `lesson.schema.json` (`dayType` replaces `dayPurpose`; step `slots`).
- `curricula/up-hindi-2026/model/structure.json`, `curricula/up-math-2026/model/structure.json` (new).
- `scripts/content/structure.mjs` (new), `v1_lesson.mjs`, `build_examples.mjs`, examples.
- `tests/structure.test.mjs` (new), `tests/content-model.test.mjs`.
- Docs: `docs/CONTENT_MODEL.md` §1a, skill step 3, plan Phase 2 line.

## Sources read
- Hindi: usage (G1 pdf 7), annual objectives (pdf 15), weekly cycle (pdf 16), period outline
  (pdf 18) in all three guides; day pages pdf 19 (G2), 24 (G1), 124 (G2) as images.
- Math: weekly overview G1 pdf 11–14 and G2/G3 pdf 12–15 (days 1–4 and 5–6 pages are
  image-only; read from rendered images); annual objectives pdf 8 (G2/G3 start with the
  previous class's codes = class-review weeks 1–4).

## Findings
- Hindi weekly assessment (day 6, periods 2+3 combined) runs in G1 only from week 14; G1 weeks
  9–12 day 6 is a three-period revision day. Remedial work is on days 1–5 only.
- Math assesses on day 5, not day 6. Days 1–3 are day plans; days 4–6 are weekly templates with
  period 3 left open (G1, G2). G3 prints days 4–6 without कालांश, with teacher-made plans and a
  project review, so it has its own day types.
- `g2-hindi-w19-d03` (pdf 124): v1 lost step 2.3 and period 3 (3.1, 3.2). Needs a source repair
  task on `main` (owner approval); recorded as a `v1-incomplete` exception.
- G2/G3 week 1 day 1: no remedial step, as printed (`source-variant`).
- Math G3 day plans title period 3 ‘गणित खेल / अभ्यास’ with no separate remedial step; the
  remedial slot comes from the cycle page note, so it is not matched per day.

## Acceptance
- [x] Both structure files validate; calendar contiguous weeks 1–25; cycles cover days 1–6.
- [x] All 732 v1 lessons fit a day type or a recorded exception (3, all Hindi); weeks without
      lessons = weeks without day plans; review plan pages = published review pages.
- [x] Assessment days are where each guide puts them (test).
- [x] npm test 94/94, npm run check, skill preflight tests.

## Open (review gate ✋)
Confirm day types; Math G1 weeks 1–8 kind (editorial); repair of `g2-hindi-w19-d03`.
