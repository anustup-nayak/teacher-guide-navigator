# Ontology-led content system and app v2 — build plan

Status: **proposal for owner approval**, 31 October 2026. Nothing in this plan has been
implemented. Live app: r57 (UP Math + Hindi, Grades 1–3). Author: Claude Code.

## 1. Why

Today each pack fits its guide into one fixed lesson schema (grade → week → day → topic →
lesson → stages). The guides themselves define a richer program: learning outcomes in
domains, an annual scope and sequence, a weekly teaching cycle, named routines with their
own descriptions, materials, an assessment and remediation loop. We use little of it
(page numbers are PDF pages unless marked printed):

| Program element | Defined in the guide | Used today |
|---|---|---|
| Learning outcomes (LOs) | Hindi: NIPUN सूची by domain (TG p2). Math: LO code table (TG p2, M101.1…) | Math: codes on 180/366 lessons. Hindi: none |
| Sub-LOs / indicators | To be confirmed per guide (Phase 1) | None |
| Strands / domains | Hindi: four-block model — oral language, decoding, reading, writing (TG p17). Math: LO families | None |
| Scope and sequence | Hindi: annual objectives by week block (printed p13). Math: LO → week → TG/WB pages (TG G1 pp8–10) | Hindi: topics = week blocks. Math: 12 app-made topics |
| Weekly cycle | Hindi: days 1–4 new skills, day 5 revision, day 6 weekly assessment (TG p16) | Implicit only |
| Period roles | Hindi: कालांश 1 oral language, 2 decoding + workbook part 1, 3 big book / reading / part 2 / remedial (TG p18) | Colours only |
| Routine library | Hindi: back matter describes each period's activities (G1 printed pp109–130) | None — steps are untyped text |
| Assessment and remediation | Hindi: weekly assessment, remedial strategy, oral-language assessment (G1 printed pp131–136); groups A/B | Day-6 text only |
| Materials | Big book, picture/story charts, textbook, workbook parts 1/2, grids, stories, poems | Free text |
| Teacher guidance articles | Hindi (all grades): usage guide, समझ की जाँच, gender sensitivity, multigrade teaching; G1 decoding and emergent writing; G2 oral-language strategies, scaffolding and pair/group work; G3 structured pedagogy, writing for expression | Page images only |
| Resources and trackers | Stories, poems, grids, annual-weekly tracker, weekly assessment tracker | Page images only |

About a quarter to a third of each Hindi guide is front and back matter. Teachers rarely
read it because it is dense, yet it explains why each lesson is built the way it is.

**Goal:** make the program itself the backbone. Model it once per edition from the guide's
front and back matter, link every lesson and step to it, give teachers that guidance as a
simplified **program guide** layer (section 4a), and build the app from that model,
without breaking the live product or teachers' saved data.

## 2. Principles

Content-architecture principles:

1. **Separate layers.** Source → extraction → canonical content model → compiled app
   bundles → app. The app never reads extraction output; content is never edited in `dist/`.
2. **The model is the source of truth.** Lesson records become *views* compiled from it.
3. **Every assertion has provenance.** Each node and link records its source page and how it
   was established: `stated` (printed in the guide), `derived` (inferred by a rule we can
   name, e.g. LO from the week map), or `editorial` (our grouping or label). The app shows
   only `stated` and reviewed `derived` links as fact; `editorial` is labelled.
4. **Stable, namespaced IDs.** `up-hindi-2026:lo:read-02`, `up-math-2026:lo:M101.1`,
   `…:lesson:g1-w09-d02`. Existing lesson IDs and storage keys never change.
5. **Controlled vocabularies with Hindi and English labels** for strands, routine types,
   material types and assessment types. A shared core, with subject-specific extensions.
6. **Versioned schema and versioned content.** Schema semver; each pack edition is
   immutable once published; corrections are new content versions with diffs.

Curriculum-design principles (structured pedagogy):

7. **Answer the teacher's daily questions in order:** what do I teach today (schedule) →
   why (LO, strand, where it sits in the sequence) → how (routine and steps, timings) →
   with what (materials, pages) → how do I check (assessment) → what if they did not get it
   (remediation, groups).
8. **Routines are first-class.** A routine (e.g. picture-chart discussion, model reading,
   letter-sound introduction, I do / We do / You do, remedial group work) has one
   definition from the guide and many uses on lesson days. Teachers learn a routine once.
9. **Sequence and spiral are visible.** LO progressions across weeks and grades, and the
   revision/assessment days that revisit them, come from the guide's own maps.
10. **Do not invent pedagogy.** If the guide does not state an LO for a day, the link is
    `derived` with its rule and review status, or absent. No generated activities.

## 3. Target architecture

```
curricula/<pack>/originals/          immutable PDFs + checksums            (exists)
curricula/<pack>/extracted/          page text, decoded, unreviewed         (exists)
curricula/<pack>/model/              CANONICAL CONTENT MODEL (new)
    program.json                     edition, grades, period/day structure, weekly cycle
    outcomes.json                    strands → LOs → sub-LOs, codes, statements
    sequence.json                    units/blocks → weeks → LOs (scope and sequence)
    routines.json                    routine definitions (from back matter) + types
    materials.json                   books, charts, workbook parts, page ranges
    assessments.json                 weekly/periodic assessment, remediation strategy
    guide/<grade>.json               program guide: sections → passages (source text,
                                     reviewed summaries, key actions), resources
    pagemap.json                     every PDF page → node (coverage gate)
    lessons/g1.json …                lesson → periods → steps, each linked to
                                     routine, LOs, materials, pages
    provenance.json                  page refs and assertion type per node/link
    CHANGELOG.md                     content versions
schemas/content-model/*.schema.json  shared JSON Schemas + vocabularies (new)
scripts/content/                     validate, compile, diff, coverage reports (new)
dist/  (v1, live)                    unchanged until cutover
app-next/ → build → dist-next/       v2 app, compiled bundles per pack/grade (new)
```

**Compiler.** `npm run content:compile` validates the model against the schemas, checks
referential integrity (every link resolves; no orphan LOs/routines), then emits per-pack,
per-grade bundles: schedule index, lesson bodies, LO index, routine index, search index.
It also emits the v1-compatible `catalog.mjs`, so v1 can be fed from the model later
without UI changes.

**Lazy loading.** v2 loads only the selected pack and grade (today both subjects load at
startup, about 0.8 MB compressed). Indexes are small; lesson bodies load on demand.

## 4. The content model (summary)

| Entity | Key fields | Example |
|---|---|---|
| Program / Edition | state, subject, academic year, grades, source docs | UP · Hindi · 2026–27 |
| Strand | id, hi/en label | पढ़ना / Reading |
| LearningOutcome | code or id, statement, strand, grade, NIPUN goal | Math M101.1; Hindi पढ़ना-2 |
| SubOutcome | id, parent LO, statement (only if the guide states them) | — |
| Unit (sequence block) | weeks, LOs, textbook lessons, TG/WB page ranges | सप्ताह 14–17 · सारंगी-1 पाठ 1–5 |
| WeekCycle slot | day number, purpose (new / revision / assessment) | दिवस 5 = पुनरावृत्ति |
| Lesson (day) | id (unchanged), grade, week, day, unit, LOs, periods | g1-hindi-w09-d02 |
| Period | number/label, role, minutes | कालांश 2 · डिकोडिंग + कार्यपुस्तिका भाग-1 |
| Step | routine, title, minutes, actions, questions, materials, page rect | 2.1 वर्ण पहचान |
| Routine | type, name, definition text, source pages, typical period | चित्र चार्ट चर्चा |
| Material | type, title, pages | बिग बुक ‘मुर्गी के तीन चूजे’ |
| Assessment | type, when, instrument, recording | ‘मैंने सीख लिया’ (दिवस 6) |
| Remediation | groups, strategy, period | समूह-A रिमीडियल, कालांश 3 |
| GuideSection | id, title, kind (overview, approach, routine guide, assessment, remediation, resource, tracker), grade(s), source pages, parent | “व्यवस्थित डिकोडिंग” (G1 printed p8) |
| GuidePassage | section, order, source text (decoded), plain-language summary, key actions, review status | one paragraph or list of a section |
| Resource | type (story, poem, grid, tracker), title, pages, linked lessons | कहानी ‘मुर्गी के तीन चूजे’ |
| PageMap | every PDF page → the node(s) it belongs to | p20 → lesson g1-w09-d02 |

Every link carries `{source: {doc, pdfPage, printedPage}, assertion: stated|derived|editorial,
rule?, review: unreviewed|reviewed}`.

**Full coverage.** The page map assigns every page of every guide and workbook to a node:
a lesson, a review week, a guide section, a resource or tracker, or a labelled
non-teaching page (cover, credits, pledge). A coverage gate fails if any page is unassigned,
so the app reflects everything in the guide.

## 4a. Program guide layer (the simplified navigator)

A separate section of the app, built from the guide's front and back matter, that
**informs** the lessons without changing them. Lesson content stays as decoded from the
day pages; the program guide is a parallel, linked layer.

**Structure.** The same for every subject; sections follow each guide's own contents.

1. **कार्यक्रम एक नज़र में / Program at a glance**: goals (NIPUN list by domain), the year
   map (annual objectives by week block), the weekly cycle (what each day is for), the
   period outline (what each कालांश is for), materials.
2. **पढ़ाने का तरीका / How we teach**: the approach articles (decoding, writing, oral
   language, structured pedagogy, scaffolding, gender sensitivity, multigrade).
3. **गतिविधियों की गाइड / Activity guide**: each routine as the guide describes it, by period.
4. **आकलन और सहायता / Assessment and support**: समझ की जाँच, the weekly assessment, the
   oral-language assessment, the remediation strategy and groups A/B, the trackers.
5. **संसाधन / Resources**: stories, poems, grids.

**Three reading depths per section, so it is no longer too dense:**

- **सार / In short**: 3–5 plain-language points plus “कक्षा में क्या करें” (what to do in
  class). These are editorial: written strictly from the source passages they cite, with
  no new pedagogy, labelled as a summary and reviewed before publication.
- **पूरा पढ़ें / Read in full**: the guide's own text, decoded and structured into headings,
  lists and tables, unchanged in wording.
- **मूल पृष्ठ / Original page**: the page image, as today.

**How it informs lessons (links, never gates).** On the lesson screen, small links lead into
the guide at the point of need, for example:

- the lesson header shows the day's place in the weekly cycle (“दिवस 5 · पुनरावृत्ति का दिन”)
  and the unit, linking to the year map;
- each step's routine links to its activity guide (“चित्र चार्ट चर्चा कैसे कराएँ”);
- LO chips link to the goal and where it is taught, revised and assessed;
- day 6 links to the weekly assessment guide and tracker; remedial steps link to the
  remediation strategy; grid and story steps link to the resource.

The guide never sits in front of a lesson: the existing topic → summary → lesson and
week → day → lesson routes stay one tap away, as the design contract requires. Where the
guide section appears (a header link, a Help entry or a lesson-panel link) is a Phase 6
design decision for the owner.

**Authoring and review of summaries.** Drafts may be machine-assisted, but each summary point
cites its source passage. A reviewer with curriculum authority approves each section before
it is published; unreviewed sections show only “Read in full” and the original page.

## 5. Keeping the live product safe (version control and release)

1. **Freeze v1.** Tag `v1.0.0` (= r57 on `main`). Create `release/v1` for hotfixes only. `main`
   keeps deploying v1 to the site root until cutover. Every v1 release still passes all
   current gates.
2. **Build v2 on a long-lived `next` branch.** Feature branches merge into `next` by PR.
   `next` must pass the v1 gates plus new model, compiler and parity gates.
3. **Isolate the preview.** The v1 offline worker controls every URL under
   `/teacher-guide-navigator/`, and all `*.github.io` project sites share one browser
   storage. So either:
   - **(A, recommended)** a separate preview origin (e.g. a Cloudflare/Netlify/Vercel
     preview of `dist-next/`): no shared worker and no shared storage; or
   - **(B)** a `/next/` subpath on the same site, which needs a small v1 release (worker
     ignores `/next/`) and a v2 storage namespace suffix (`…-v2preview`) that reads v1 data
     read-only until cutover.
4. **Teacher-data contract.** v2 uses the same lesson IDs and storage keys and writes only
   additive fields. Tests replay real v1 storage snapshots (notes, list, taught marks,
   resume, offline ledger) through v2 and back. No storage is ever cleared.
5. **Content versioning.** Each pack has `model/CHANGELOG.md` and a content version
   (`up-hindi-2026@1.1.0`). The compiler writes a diff report (lessons/steps/links
   added, changed, removed) for every PR. The preservation baseline extends to the model:
   published content versions cannot be rewritten.
6. **Schema versioning.** `schemas/content-model` carries semver; the compiler refuses a
   model with an unknown major version; migrations are scripted and tested.
7. **Cutover with rollback.** After owner sign-off, v2 deploys to the root and v1 moves to
   `/v1/` for at least one term. Rollback = redeploy tag `v1.x`.

## 6. Phased build

Each phase ends with a gate. Owner approvals are marked ✋. Agents log each step in
`docs/HANDOFF.md`; each phase has a task note.

**Phase 0 — Safeguard v1 (small).** *Started 31 Oct 2026: `v1.0.0` tagged at `5ae263b`; `release/v1`
and `next` created; rules in [VERSIONING.md](VERSIONING.md); preview repo waits for the org.* Tag `v1.0.0`, create `release/v1` and `next`, add CI for
`next`. Preview: the owner creates a free GitHub organisation (e.g. `sandarshika-preview`);
its user-site repo `<org>.github.io` holds only a Pages workflow that checks out the public
`next` branch of `anustup-nayak/teacher-guide-navigator` and publishes its v2 build, on a
schedule and on manual dispatch. No tokens or secrets; separate origin, so no shared worker
or storage with the live app. Gate: v1 unchanged; `next` CI green; preview URL serves `next`.

**Phase 1 — Read the programs (both subjects, all grades).** Read every front and back
matter page of each TG and workbook (contents, NIPUN lists, usage guide, teaching cycle,
materials, period outline, routine descriptions, assessment, remediation, annual
objectives, Math LO table and LO→week map). Math front matter needs OCR/legacy decoding
first. Draft the section map of each guide's front and back matter (following its own
contents page) and a first page map. Output: `curricula/<pack>/model/PROGRAM_PROFILE.md` per pack, with page references
and open questions for the curriculum team. Gate ✋: owner/academic review of both profiles.

**Phase 2 — Design the content model.** Draft: [CONTENT_MODEL.md](CONTENT_MODEL.md). Including the program guide entities (section 4a).
Write `docs/CONTENT_MODEL.md`, the JSON Schemas,
vocabularies (strands, routine types, material types, assessment types) and ID rules, with
worked examples from one Hindi day and one Math day. Gate ✋: curriculum-design review —
does the model express both programs without forcing one onto the other?

**Phase 3 — Content tooling.** Validator, referential-integrity checks, compiler (v2
bundles and the v1-compatible catalog), diff and coverage reports (LOs without lessons,
lessons without LOs, routines never used, pages not in the page map), tests. Gate: compiling the *current* content
reproduces today's v1 catalogs byte-for-byte (no behaviour change yet).

**Phase 4 — Populate Hindi.** Decode every front and back matter section into structured
program-guide text, draft cited plain-language summaries, and link sections to lessons.
Extract the NIPUN LOs and strands, unit blocks, weekly cycle,
period roles and routine library from the guide; type every step against the routine
library (matching titles plus back-matter definitions; ambiguous cases reviewed); link
lessons to LOs only where stated or derivable by a named rule; model assessment and
remediation. Gate ✋: coverage report plus a sampled academic check per grade.

**Phase 5 — Populate Math.** Build the Math program guide the same way. OCR the LO table and
LO→week map; link all 366 days (direct
plans stated; weekly plans derived from the week map); map GRR stages to routine types;
replace app-made topics with the guide's sequence where it defines one, keeping
`editorial` labels where it does not. Gate ✋: same as Phase 4.

**Phase 6 — App v2 design proposal.** Include the program guide section, its three reading
depths and the lesson-to-guide links (section 4a). Proposal with Hindi screens at 360 px: the same core
flow (Today/week → day → lesson; topic → summary → lesson) plus ontology-backed
additions to discuss, such as "why" (LO and strand chips on each lesson), a routine guide
(how to run picture-chart discussion), an LO view (where an outcome is taught, revised and
assessed), and a remediation view. Gate ✋: owner approval; `docs/DESIGN_CONTRACT.md` v2
and the design-lock tests updated in the same change.

**Phase 7 — Build app v2.** Data layer on compiled bundles with lazy loading; existing
screens re-pointed to the model; approved new views; same storage keys and deep links;
offline worker scoped to v2. Gate: all v1 behavioural tests pass on v2, plus new ones.

**Phase 8 — Parity and QA.** Page coverage is 100% for every guide and workbook; every
published summary has a reviewer. Automated parity: every v1 lesson ID reachable, with the same
steps, times, questions and worksheets, and all v1 deep links resolving. Storage snapshot
replay; offline download/upgrade; the previously open checks (390 px, keyboard-only,
offline Hindi lesson, real Android phones, TalkBack, print). Teacher pilot if possible ✋.

**Phase 9 — Cutover.** Release notes, deploy v2 to root, v1 at `/v1/`, monitor, keep the
rollback path for a term. Gate ✋: owner go-live decision.

## 7. Working agreements for agents

- File ownership per phase: model/schemas (content), compiler (tooling) and app-next (UI)
  can run in parallel worktrees once Phase 2 is approved; `dist/` (v1) changes only via
  `release/v1`.
- Content changes need source comparison; app tests cannot prove academic correctness.
- The design contract stays in force for v1; v2 gets its own contract at Phase 6.
- The skill (`skills/teacher-guide-to-app`) gains a "program model first" stage in Phase 2,
  so future packs start from front matter.

## 8. Risks and open questions

- **Per-day LOs may not be printed** (Hindi lists LOs per grade, not per day). Links would
  then be `derived` from unit and strand rules and need academic review, or be left out.
- **Math front matter is not machine-readable** in its current fonts; OCR accuracy for LO
  tables must be checked against images.
- **Routine typing needs judgement.** We start with the guide's own back-matter names and
  record ambiguous steps for review instead of forcing a type.
- **Scope creep in v2 UI.** Every new view needs owner approval and must not add a
  mandatory gate before the lesson.
- **Repository size** (~0.85 GB + LFS). Model files are small; consider LFS or an external
  archive for any new originals.
- **Reviewer capacity.** Gates ✋ in Phases 1, 2, 4 and 5 need someone with curriculum
  authority (for example Renu's team) to sign off.

## 9. Decisions needed from the owner before Phase 0

1. ~~Preview hosting~~ **Decided 31 Oct 2026: separate origin on a second GitHub Pages site** (see Phase 0).
2. LO linking: allow reviewed `derived` links, or only links printed in the guide?
3. Who reviews the program profiles and content model (✋ gates)?
4. Which v2 additions to explore in Phase 6 (LO view, routine guide, remediation view)?
5. Where the program guide lives in the app (fourth header link, inside Help, or only via
   lesson links), decided in Phase 6 with screens.
