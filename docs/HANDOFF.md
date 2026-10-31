# Agent handoff log

This file lets any coding agent (Claude Code, Codex or another) continue work
that a previous agent started, including when that agent ran out of tokens
mid-task. It is the first file to read and the last file to update.

## Protocol

1. **Read first.** Read this file, then [AGENTS.md](../AGENTS.md) and the
   [design contract](DESIGN_CONTRACT.md), before editing anything.
2. **Claim before working.** Add a row to *Active work* with your agent name,
   branch, owned files and status `in progress`. Do not edit files another
   active row owns.
3. **Write as you go.** After each meaningful step (a file group written, a
   check run, a decision made), update your *Active work* row's "Last step /
   next step" cell. Assume you can be cut off at any moment: the next agent
   must be able to continue from this file and your task note alone.
4. **Log when done.** Add a *Change log* entry at the top of that section,
   move your row out of *Active work*, and refresh *Current state* if the
   facts changed. Never delete or rewrite older log entries; correct them with
   a new entry.
5. **Keep detail elsewhere.** Long evidence belongs in the task note under
   `docs/tasks/`; log entries link to it. Never record credentials, signed
   URLs, private email or student data here.
6. **Picking up someone else's task.** Read their task note and row, run
   `git status` and `git log` on their branch, rerun the checks it names, and
   then continue. Record the takeover in the row ("taken over by … from …").
7. **Protected design.** Never change the look, feel or flow defined in
   [DESIGN_CONTRACT.md](DESIGN_CONTRACT.md) without the owner's explicit
   approval in chat. `npm test` fails when a protected file changes without a
   recorded approval.

## Current state

*Update this section when the facts change; it is not a log.*

| Item | Value |
|---|---|
| Live app | https://anustup-nayak.github.io/teacher-guide-navigator/ (deployed from `main` by `.github/workflows/pages.yml`) |
| Repository | github.com/anustup-nayak/teacher-guide-navigator (public). Branches: `main` (v1 live), `release/v1`, `next` (v2) — see [VERSIONING.md](VERSIONING.md). Tag `v1.0.0` = r57 |
| Release | r61 (live, tag `v1.0.4`, `main` @ `49f873c`; `release/v1` mirrors it). `next` has `main` merged in |
| Published content | UP Mathematics Grades 1–3, `up-math-2026`: 366 day plans, 990 page images. UP Hindi Grades 1–3, `up-hindi-2026`: 366 day plans, 972 page images |
| Teacher-data namespaces | Math `up-sandarshika-2026-v1`, Hindi `up-hindi-sandarshika-2026-v1` (both permanent) |
| Checks | `npm test` (116 on metadata task branch, includes design lock), `npm run check`, `node --check dist/sw.js`, `npm run verify:publication`, `npm run test:ingestion` (16), skill script tests, `npm run verify:sources -- --require-complete` |
| Content compiler | Phase 3 in PR #16 (not merged); metadata task builds on it with additive 1.1.0 releases, required program understanding and shared query accessor. Retained 1.0.0 unchanged; 732 lessons, both v1 byte-parity gates PASS. |
| Design lock | `docs/design-lock.json`; see [design contract](DESIGN_CONTRACT.md) |
| Known open checks | Independent academic review, real teachers, physical phones/TalkBack, physical printing |

## Next up

*Refreshed 31 Oct 2026 by Claude Code while integrating PR #17; read AGENTS.md first.*

v1 is live at r61 (`main` @ `49f873c`, tag `v1.0.4`; `release/v1` mirrors it). v2 is on `next`.

1. **Owner merges [PR #17](https://github.com/anustup-nayak/teacher-guide-navigator/pull/17)**
   (program metadata, repository layout, skill rewrite, docs cleanup; content release 1.1.0 built
   on 1.0.1). See [task note](tasks/program-metadata-layout.md),
   [PROGRAM_METADATA.md](PROGRAM_METADATA.md), [REPOSITORY_LAYOUT.md](REPOSITORY_LAYOUT.md).
2. **Program-guide design (Phase 6 slice)** awaits the owner's approval before any build:
   [PROGRAM_GUIDE_DESIGN.md](PROGRAM_GUIDE_DESIGN.md).
3. **Phases 4–5** (task branch from `next`): populate outcomes, sequence, routines, materials,
   assessments and guide passages per pack using [CONTENT_MODEL.md §6](CONTENT_MODEL.md); build
   the next release with `--previous`, advancing `content/website.json` and `verify:content` together.
4. **Owner decisions:** Phase 0 preview site (organisation name).

**v1 follow-ups** (on `main`; see [VERSIONING.md](VERSIONING.md)): lazy subject loading;
real-phone, TalkBack and print checks. Content repairs: `repairs.json` + recorded baseline
amendment, then rebuild the content release so `verify:site` stays green after `main` → `next`.
`next` uses release token r62; after `main` releases again, re-run `release:assets` on `next`
with a higher rNN.

## Active work

| Agent | Branch | Owned files | Status | Last step / next step |
|---|---|---|---|---|
| Claude Code | `task/week-cards` (from `next`) | `dist/ux.mjs` (`lessonSummary`, `dayLabel`), `dist/app.mjs` (card), `dist/day-types.mjs` (generated), `scripts/content/publish_site.mjs`, `tests/site-from-release.test.mjs`, r62 bumps, `docs/DESIGN_CONTRACT.md` | PR to `next` open | Owner approved one card rule for Hindi and Math week/topic cards plus day labels. Next: owner merges. `next` is at r62 (ahead of `main` r61); when `main` releases again, re-run `release:assets` on `next` with a higher rNN after merging. |
| Claude Code (took over from Codex) | `task/content-compiler` ([PR #16](https://github.com/anustup-nayak/teacher-guide-navigator/pull/16)) | `curricula/*/model/lessons/`, `schemas/content-model/lesson.schema.json`, `scripts/content/{v1_codec,publish_site}.mjs`, `content/` (1.0.1, `website.json`), `tests/site-from-release.test.mjs`, `docs/CONTENT_COMPILER.md` | PR to `next` open | Codex out of credits; continued. Added lesson workbook links (release 1.0.1), pinned the website to the release, browser-verified query library and all Hindi + 122 Math lessons. Next: owner merges #16. |
| Claude Code | `task/ontology-decisions` (from `next`) | `docs/CONTENT_MODEL.md` §3/§6, `schemas/content-model/{vocabularies,common,outcomes}`, `curricula/*/model/structure.json`, `scripts/content/build_examples.mjs`, examples, profiles | Merged as PR #15 | Owner decided all 7 open points; ontology is v1.0 release candidate. Next: Phase 3 compiler (byte-for-byte v1 parity) freezes v1.0. |
| Claude Code | `task/content-platform` (from `next`) | `docs/CONTENT_PLATFORM.md`; links in `docs/CONTENT_ARCHITECTURE_PLAN.md`, `docs/ARCHITECTURE.md`, `docs/PRD.md` | Merged as PR #12 (`9ce00b1`) | Owner: build only the website now; design the content repository so other products can come later. Next: Phase 3 builds the website's content release and query library. |
| Claude Code | `task/lesson-link-pack` (from `main`) | `dist/domain/selection.mjs`, `dist/app.mjs` (render), `tests/hindi-pack.test.mjs`, r61 bumps, `docs/ARCHITECTURE.md` | Merged as PR #14 (`49f873c`); live r61, tag `v1.0.4` | Done, and branches synced. Left: lazy subject loading. |
| Claude Code | `task/v1-fixes` (from `main`) | Hindi `repairs.json`, `build_pack.py`, reviewed/dist catalog and worksheets, `curricula/published-baseline.json`, `tests/hindi-pack.test.mjs`, r60 bumps | Merged as PR #13 (`4be3376`); live r60, tag `v1.0.3` | Done, and branches synced. Left: pack-less lesson links, lazy subject loading. Task note: [v1 fixes](tasks/v1-fixes.md). |
| Claude Code | `task/hindi-grid-columns` (from `main`) | `curricula/up-hindi-2026/tools/parse_guides.py`, Hindi reviewed/dist catalog, `curricula/published-baseline.json`, `tests/test_hindi_grids.py`, `tests/hindi-pack.test.mjs`, r59 bumps | Merged as PR #11 (`cb6075b`); live r59, tag `v1.0.2` | Done, and branches synced (`release/v1`, `next`). Task note: [grid](tasks/hindi-grid-columns.md). |
| Claude Code | `task/repair-g2-hindi-w19-d03` (from `main`) | `curricula/up-hindi-2026/tools/{repairs.json,build_pack.py}`, `curricula/up-hindi-2026/reviewed/catalog.mjs`, `dist/packs/up-hindi-2026/catalog.mjs`, `curricula/published-baseline.json`, r58 version bumps in `dist/` | Merged as PR #10 (`181a840`); live r58, tag `v1.0.1` | Done: repair, publish, reviewed baseline amendment, r58, all checks, browser check. Done after merge: `release/v1` fast-forwarded, `v1.0.1` tagged, `main` merged into `next`, exception dropped. Left: check grid attachment on G2 w19 d2. Task note: [repair](tasks/repair-g2-hindi-w19-d03.md). |
| Claude Code | `task/program-structure` (from `next`) | `schemas/content-model/{structure,lesson,program}.schema.json`, `vocabularies.json`, `curricula/*/model/structure.json`, `scripts/content/{structure,v1_lesson,build_examples}.mjs`, `tests/structure.test.mjs`, `tests/content-model.test.mjs`, `docs/CONTENT_MODEL.md` | Merged as PR #9 (`78e5e24`) | Done: program structure (calendar, day types, exceptions) for both packs; all 732 lessons classified; npm test 94/94. Next: review gate ✋ (CONTENT_MODEL.md §1a, §6), then Phase 3. Task note: [program-structure](tasks/program-structure.md). |
| Claude Code | `task/phase2-content-model` (merged as PR #8, `bb39abe`) | — | Merged into `next` | Review gate ✋ still open (CONTENT_MODEL.md §6). |
| Claude Code | `task/phase1-program-profiles` (from `next`) | `scripts/content/*`, `curricula/*/extracted/matter/`, `curricula/*/model/*`, `tests/pagemap.test.mjs`, `docs/tasks/phase1-program-profiles.md` | Phase 1 drafted; PR to `next` open | Done: extractor, section maps, page maps + coverage test (npm test 83/83), both PROGRAM_PROFILE.md drafts, workbook matter. Next: owner/academic review gate ✋ of both profiles; then Phase 2. Any agent may take over. |
| Claude Code | `task/ontology-plan` (merged as PR #5) | `docs/CONTENT_ARCHITECTURE_PLAN.md`, `docs/VERSIONING.md`, `docs/preview/pages-preview.yml` | Phase 0 waiting on owner | Done: tag `v1.0.0`, branches `release/v1` and `next`, branch rules, plan, preview workflow template. Waiting: owner names the preview organisation. Next: step 1 of *Next up*. Any agent may take this over. |

## Change log

### 2026-10-31 · Claude Code · `task/week-cards` (PR to `next`)

- Owner noticed Hindi and Math week views rendered differently. Causes: the card summary
  concatenated every material and prep note (Hindi lists one per period, so its workbook page
  was cut off), and only Math weekly templates were marked, so Hindi revision/assessment days
  looked like teaching days. Owner approved one rule for both (design contract §3 updated):
  workbook page first, then the first material; the top line names the day type on non-teaching
  days. Labels come from `dist/day-types.mjs`, generated from the pinned release's structure.
- No CSS/protected-file change. Release tokens bumped to r62 on `next` (the browser's HTTP cache
  kept r61 modules otherwise). Browser: Hindi G1/G2 and Math G2 weeks at 360/390 px, Hindi and
  English, no overflow or console errors.
- iCloud sync again left copies (`lessons/1 2.json`, `compat/v1 2.json`, empty `content/* 2/`) that
  doubled the Math lessons for the compiler. Moved (not deleted) to
  `../teacher-guide-navigator-duplicates-2026-10-31b/`; `loadPack` now refuses such files with a
  clear message. Keep this repository out of iCloud "Optimise Mac Storage"/Desktop & Documents
  sync, or check `git status` for `* 2*` files before building. npm test 115/115.

### 2026-10-31 · Claude Code · `task/content-compiler` (took over PR #16 from Codex)

- Codex ran out of credits; its branch was clean and green. Found that the app bundles lacked 412
  of 650 cited workbook pages; added lesson-level `workbook` links to the model and built content
  release 1.0.1 (1.0.0 immutable; v1 views byte-identical). The website is now pinned to the
  release (`content/website.json`, `site:publish`/`verify:site`); a new test proves `dist/` equals
  the release and the app bundles carry everything the site shows for all 732 lessons.
- Browser: query library runs on the hash-verified release; release-driven site QA passes (366
  Hindi + 122 Math lessons at 390 px). Checks: see the [task note](tasks/content-compiler.md).

### 2026-10-31 · Codex · `task/program-metadata-layout` ([PR #17](https://github.com/anustup-nayak/teacher-guide-navigator/pull/17) to `next`)

- Required whole-program metadata: nine evidence-backed dimensions, per-grade
  source coverage, explicit readiness/review/questions and pack/program/release
  pointers. New-pack scaffolds cannot pass until inspected and documented.
- Additive 1.1.0 releases snapshot profiles, understanding and section/page maps;
  shared query accessor preserves calendars and hides unapproved editorial/link
  assertions. Existing 1.0.0 releases and all 732 v1 lessons remain unchanged.
- Isolated historical Math tooling under its pack, preserved shared font decoder
  and Hindi integration. Reworked core skill/templates and canonical folder,
  program-metadata, product/architecture/compiler/agent documentation together.
- Local checks PASS: Node 116, ingestion 16, skill helpers 5, both strict pack
  preflights, complete 13-PDF archive, both compiler/parity gates, publication
  preservation (1,962 page assets), design lock, module/worker/tool syntax,
  skill validation and diff checks. GitHub CI runs on the final PR head; consult
  PR checks before merging. No live UI/deploy, baseline, IDs or namespace changes.
- Review/merge #16 before #17. Full LO/sequence/routine/material/assessment/guide
  authoring remains Phases 4–5; existing profiles remain editorial/unreviewed.
  Details: [task note](tasks/program-metadata-layout.md).

### 2026-10-31 · Codex · `task/content-compiler` ([PR #16](https://github.com/anustup-nayak/teacher-guide-navigator/pull/16) to `next`)

- Phase 3: validated immutable static releases, manifest/hash/changelog, typed graph,
  per-grade app bundles, dependency-free query API with review gates. One-time
  migration keeps canonical teaching fields in model JSON and legacy-only export
  fields in pack compat/. Both catalogs reconstruct byte for byte (732 lessons);
  ontology v1.0.0 frozen in this task branch. Full model population is still Phases 4–5.
- At implementation start PR #15 was OPEN; it merged as `7c9556a` during close-out.
  Synced the compiler branch with next and retained both the owner decisions and
  the proven v1.0.0 parity freeze while resolving two documentation conflicts.
- Local and both GitHub check runs PASS on `92663b9` (PR #16 is mergeable).
- 112 Node, 15 Python ingestion, 4 skill helper; content reproducibility/parity,
  design lock, syntax, source integrity and publication/preservation all PASS locally.
- No dist/design/storage/baseline/production deployment change. Static releases
  remain repo artifacts; no retrieval/bot/v2 UI or public content endpoint added.
- Task note: [content-compiler](tasks/content-compiler.md). Next: review PR/dependency,
  then Phase 4/5 population; preview and v2 screens retain their owner gates.


Newest first. Each entry: date, agent, branch/commit, what changed, checks run,
task note, and anything left undone.

### 2026-10-31 · Claude Code · `task/ontology-decisions` (PR to `next`)

- Owner walked through the content model's open points and decided: guide list primary for Hindi
  outcomes (workbook codes kept with a reviewed crosswalk); reviewed rule-derived links allowed;
  Math grouped by code family (no strand names); generic Hindi workbook steps → `hi-workbook-practice`;
  Math G1 weeks 1–8 school readiness; day types accepted; owner signs off (new review value
  `owner-approved`, not an academic review). Recorded in [CONTENT_MODEL.md §6](CONTENT_MODEL.md).
- Schemas: `owner-approved`, `outcomeList` vocabulary, outcome `list`/`family`/`equivalent`. New rule
  `workbook-activity-title`. Examples regenerated (all 7 Hindi example steps now linked).
- Ontology is a v1.0 release candidate; it freezes when Phase 3 reproduces the v1 catalogs.
  npm test 97/97.

### 2026-10-31 · Claude Code · `next` (merge of `main` after r61)

- r61 is live (PR #14, `49f873c`): lesson links without `?curriculum=` open the right subject.
  `release/v1` fast-forwarded and tagged `v1.0.4`; `main` merged into `next` (HANDOFF.md
  conflict resolved by keeping both sides).

### 2026-10-31 · Claude Code · `task/lesson-link-pack` (PR to `main`, release r61)

- A lesson link without `?curriculum=` (e.g. `#/lesson/g2-hindi-w19-d03`) showed "lesson not
  found". The app now reads grade and subject from the lesson id (`packForLessonId`), flushes
  notes and replaces the URL with that pack's, keeping route and step. No loop for ids with no
  lesson; the query-less Math default is unchanged.
- Checks: npm test 83/83, check, design:check, sw.js, verify:publication, ingestion 15/15,
  verify:sources, skill tests; browser checks. Task note: [v1 fixes](tasks/v1-fixes.md).

### 2026-10-31 · Claude Code · `next` (merge of `main` after r60)

- r60 is live (PR #13, `4be3376`): restored quoted vowel signs in 13 Hindi lessons.
  `release/v1` fast-forwarded and tagged `v1.0.3`; `main` merged into `next` (HANDOFF.md
  conflict resolved by keeping both sides).

### 2026-10-31 · Claude Code · `task/v1-fixes` (PR to `main`, release r60)

- v1 checks: 390 px (no overflow), keyboard-only (logical order, visible focus), offline Hindi
  lesson (loads from cache with the server stopped) all pass.
- Fixed: bare vowel signs in quotes are drawings, not text, so 21 places in 13 Hindi lessons
  (several lesson titles) showed ‘ ’. Each sign read from the page image and restored via a
  `sign` repair; nothing else changes. Third recorded baseline amendment; new pack test.
- Checks: npm test 82/82, check, design:check, sw.js, verify:publication, ingestion 15/15,
  verify:sources, skill tests. Left: lesson links without `?curriculum=`; lazy subject loading.
  Task note: [v1 fixes](tasks/v1-fixes.md).

### 2026-10-31 · Claude Code · `task/content-platform` (PR to `next`)

- Owner asked to structure the product so the content back end serves several front ends
  (website, chatbot) and new products (remedial plans, teacher tools). Wrote
  [CONTENT_PLATFORM.md](CONTENT_PLATFORM.md): content core → versioned, static content release
  (manifest, entities, graph, app/v1/retrieval views, changelog) → shared query library →
  products; contract (stable ids, pinned versions, provenance, review gates), generated-content
  rules, and owner decisions (content rights, first product, chatbot hosting, policy).
- Plan: Phase 3 emits the content release and query library for the website. Owner then
  decided (same day): don't build other products now; only keep the repository ready for them.
  Phase 10 became "later, not scheduled"; §8 decisions are deferred. Docs only; npm test 95/95.

### 2026-10-31 · Claude Code · `next` (merge of `main` after r59)

- r59 is live (PR #11, `cb6075b`): Hindi grid crops on the step printed in the same column.
  `release/v1` fast-forwarded and tagged `v1.0.2`; `main` merged into `next` (HANDOFF.md
  conflict resolved by keeping both sides).

### 2026-10-31 · Claude Code · `task/hindi-grid-columns` (PR to `main`, release r59)

- Owner approved after checking G2 w19 d2: the parser gave grids to the first step at their height,
  ignoring columns, so 132 grids printed in 3.2 showed on 3.1 (and one 2.2 grid on 2.1). Steps now
  record their column; 133 crops move, every lesson's text and steps are unchanged.
- Second recorded baseline amendment (r59). New tests: `tests/test_hindi_grids.py`, pack test.
- Checks: npm test 81/81, check, design:check, sw.js, verify:publication, ingestion 15/15,
  verify:sources, skill tests; browser 360/390 px, Hindi/English. Task note: [grid](tasks/hindi-grid-columns.md).

### 2026-10-31 · Claude Code · `next` (merge of `main` after r58)

- r58 is live (PR #10, `181a840`). `release/v1` fast-forwarded to `181a840` and tagged `v1.0.1`;
  `main` merged into `next` (HANDOFF.md conflict resolved by keeping both sides). Removed the
  `g2-hindi-w19-d03` exception from `curricula/up-hindi-2026/model/structure.json`: the lesson
  now fits `hi-new-skills`. Checks on `next`: see the merge commit.

### 2026-10-31 · Claude Code · `task/repair-g2-hindi-w19-d03` (PR to `main`, release r58)

- Source repair approved by the owner: `g2-hindi-w19-d03` had lost step 2.3 and all of period 3, and
  showed period 3's word grid on 2.1. Periods 2–3 transcribed from TG G2 PDF p124 into `repairs.json`;
  `build_pack.py` can now add a dropped period. Only this lesson changed; existing step ids kept.
- Reviewed baseline amendment (first use of the procedure, now in
  [CURRICULUM_EXPANSION.md](CURRICULUM_EXPANSION.md)): two hashes, recorded in `amendments`.
- Checks: npm test 80/80, check, design:check, sw.js, verify:publication, ingestion 12/12,
  verify:sources, skill tests; browser 360/390 px, Hindi/English, legacy link, Math unchanged.
  Task note: [repair](tasks/repair-g2-hindi-w19-d03.md). Left: deploy via merge; possible grid
  mis-attachment on other days (G2 w19 d2) needs a review.

### 2026-10-31 · Claude Code · `task/program-structure` (PR to `next`)

- Owner asked for the program structure first, because subjects differ and assessment days do not
  share the teaching-day shape. Added `structure.json` per pack (calendar → day types → periods and
  slots, period outline, exceptions), `structure.schema.json`, checker `scripts/content/structure.mjs`
  and `tests/structure.test.mjs`. Lessons now carry `dayType` (replaces `dayPurpose`) and step `slots`;
  calendar, cycle and periods moved out of `program.json`. See [CONTENT_MODEL.md §1a](CONTENT_MODEL.md).
- Findings: Hindi assesses on day 6 (G1 only from week 14); Math assesses on day 5 and its days 4–6
  are weekly templates; Math G3 days 4–6 have their own shape. `g2-hindi-w19-d03` lost step 2.3 and
  period 3 in v1 (needs a repair task on `main`).
- Checks: npm test 94/94, npm run check, skill preflight tests. Task note: [program-structure](tasks/program-structure.md).
- PR #8 (Phase 2) was squash-merged into `next` as `bb39abe`.

### 2026-10-31 · Claude Code · `task/phase2-content-model` (PR to `next`)

- Phase 2 drafted: [CONTENT_MODEL.md](CONTENT_MODEL.md) (files, ID rules, links/provenance,
  derivation rules, how Hindi and Math fit, worked examples, open points);
  `schemas/content-model/` (vocabularies + common + 9 entity schemas); dependency-free validator
  `scripts/content/schema.mjs`; `v1_lesson.mjs` (v1 record → model lesson, ids and text unchanged);
  examples for `g1-hindi-w09-d02` and `g1-math-w09-d01` in `docs/content-model/examples/`.
- Checks: npm test 87/87 (4 new content-model tests). No app or dist change.
- Left: review gate; Phase 3 compiler and v1 parity.

### 2026-10-31 · Claude Code · `task/phase1-program-profiles` (PR to `next`)

- Phase 1 drafted: `scripts/content/extract_matter.py` decodes all front/back matter (320 pages);
  `curricula/*/model/sections.json` maps each guide from its contents page; `build_pagemap.mjs`
  writes `pagemap.json` (every page → section → lessons) and `tests/pagemap.test.mjs` gates it.
  Draft profiles: `curricula/up-hindi-2026/model/PROGRAM_PROFILE.md`, `curricula/up-math-2026/model/PROGRAM_PROFILE.md`.
- Moved 38 macOS " 2" duplicate files out of the repo (nothing deleted; see task note).
- Checks: npm test 83/83; verify:sources ok. Left: review gate, article line-by-line reading, Math image-only pages.
- Later on the same branch: workbook front/back matter read. The workbooks list coded NIPUN LOs for
  all grades (guides do so only for G3), and Hindi workbook part 2 (reading/fluency practice) is not
  linked to any v1 lesson. Both are in the Hindi profile. Task note: [phase1](tasks/phase1-program-profiles.md).

### 2026-10-31 · Claude Code · `main` @ `25c50ac` (PR #5, squash-merged)

- Added the [content architecture plan](CONTENT_ARCHITECTURE_PLAN.md) for an ontology-led
  content model (program, outcomes, sequence, routines, materials, assessments, lessons,
  program guide from the front matter, page map, provenance) and app v2, phases 0–9 with
  owner gates; the owner approved it and chose a second GitHub Pages site for previews.
- Phase 0: [VERSIONING.md](VERSIONING.md) (branches `main`/`release/v1`/`next`, tags,
  rollback, teacher-data contract, cutover), tag `v1.0.0`, preview workflow template
  `docs/preview/pages-preview.yml`, branch rule in AGENTS.md. `release/v1` and `next`
  fast-forwarded to `25c50ac`.
- Checks: Checks and GitHub Pages workflows green; live worker still `r57`.
- Left: preview organisation and site (owner action first), then Phase 1.

### 2026-10-31 · Claude Code · `main` @ `4e7065d` (PR #3, squash-merged; live as r57)

- Added UP Hindi Grades 1–3 as pack `up-hindi-2026` beside Math in the same app (Subject
  menu: गणित / हिन्दी): 366 lessons, 2,752 timed steps, 332 workbook links, 175 grid
  crops, 972 page images; release r57. Math payloads, IDs, images and storage unchanged
  (preservation gate passes).
- Pack adapter in `curricula/up-hindi-2026/tools/` (legacy-font decoder, glyph-order
  rebuild, hidden-edit filter, grid/tip handling, workbook citation mapping, builder,
  one source-compared repair). Originals archived; G3 workbook via Git LFS.
- Small generic app edits (phase `role`, `worksheetPreview`, minute ranges); no protected
  design file changed. Checks: npm test 80/80, all gates; browser QA listed in task note.
- Left: line-by-line proofreading; review list; 390 px/keyboard/offline-Hindi/real-device
  checks; possible per-subject lazy loading. Task note:
  [up-hindi-ingestion](tasks/up-hindi-ingestion.md).

### 2026-10-31 · Claude Code · `main` @ `145d49d` (PR #1, squash-merged)

- Added this handoff log, the [design contract](DESIGN_CONTRACT.md), the design
  lock (`docs/design-lock.json`, `scripts/design_lock.mjs`,
  `tests/design-lock.test.mjs`, `npm run design:check` / `design:approve`) and
  `CLAUDE.md` (imports AGENTS.md so Claude Code and Codex share one rule set).
- Wired both into AGENTS.md, README, DEVELOPMENT, the task-note README and the
  skill (entry point, design and release references).
- Deleted the fully merged local branch `task/github-readiness`.
- No runtime, CSS, content, image or storage change.
- Before editing: live site checked in Hindi on every screen (no issues) and
  all seven checks passed on `main`.
- Checks: `npm test` 75/75 (6 new design-lock tests), `npm run check`,
  `npm run design:check`, `node --check dist/sw.js`, `npm run verify:publication`,
  `npm run test:ingestion` 7/7, skill tests 4/4, `npm run verify:sources --
  --require-complete`, skill preflight: all pass. Lock verified to fail on a
  palette change and to ignore a release-version bump.
- Status: merged to `main` as `145d49d` via
  [PR #1](https://github.com/anustup-nayak/teacher-guide-navigator/pull/1) after both
  GitHub checks passed; task branch deleted. Repository auto-merge is disabled,
  so the agent merged it on the owner's instruction.
- Task note: [agent-continuity-design-lock](tasks/agent-continuity-design-lock.md).

### 2026-10-31 · earlier agent session (agent not recorded) · `main` @ `e838c78`

- "Record verified source recovery and live Pages deployment": source archive
  of all seven PDFs with checksums, GitHub Pages workflow, live deployment.
- Task note: [github-readiness](tasks/github-readiness.md).

### 2026-10-31 · earlier agent session (agent not recorded) · `main` @ `86aa0e2`

- "Preserve complete source archive and prepare verified GitHub Pages app":
  initial repository import of the r56 app, docs, skill and tests.
- Earlier history (r18–r56: scrollable lesson, pack contract, source-led cards,
  modular runtime, UX audit, expansion contract) is recorded in the task notes
  under [docs/tasks/](tasks/) and summarised in [DEVELOPMENT.md](DEVELOPMENT.md).
