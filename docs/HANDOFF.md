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
| Release | r57 (live). `main`, `release/v1` and `next` all at `25c50ac` (docs-only commits after r57; live worker still r57) |
| Published content | UP Mathematics Grades 1–3, `up-math-2026`: 366 day plans, 990 page images. UP Hindi Grades 1–3, `up-hindi-2026`: 366 day plans, 972 page images |
| Teacher-data namespaces | Math `up-sandarshika-2026-v1`, Hindi `up-hindi-sandarshika-2026-v1` (both permanent) |
| Checks | `npm test` (80, includes design lock), `npm run check`, `node --check dist/sw.js`, `npm run verify:publication`, `npm run test:ingestion` (12), skill script tests, `npm run verify:sources -- --require-complete` |
| Design lock | `docs/design-lock.json`; see [design contract](DESIGN_CONTRACT.md) |
| Known open checks | Independent academic review, real teachers, physical phones/TalkBack, physical printing |

## Next up

**Ontology-led content system and app v2**, plan in [CONTENT_ARCHITECTURE_PLAN.md](CONTENT_ARCHITECTURE_PLAN.md)
(approved by the owner; branch rules in [VERSIONING.md](VERSIONING.md)). Do the phases in
order and stop at every ✋ gate for the owner.

1. **Finish Phase 0 (blocked on the owner).** The owner creates a free GitHub organisation
   and tells you its name (suggested `sandarshika-preview`). Then, with the owner's go-ahead:
   create the public repo `<org>/<org>.github.io`, add `docs/preview/pages-preview.yml` as
   `.github/workflows/pages-preview.yml`, set Pages source to GitHub Actions, run the
   workflow once, and confirm `https://<org>.github.io/` serves the `next` build. Record the
   URL in *Current state* and the plan §9.
2. **Phase 1** (read all front and back matter of both programs; program profiles, section
   map, page map). Work on `task/*` branches from `next`; PRs go to `next`, never `main`.
3. Open plan decisions §9.2–5 (derived LO links, reviewers, v2 additions, program-guide
   placement) need the owner's answers before the phases that use them.

v1 follow-ups (on `main`, then fast-forward `release/v1` and merge `main` into `next`):
proofread the review list in `docs/tasks/up-hindi-ingestion.md`; 390 px, keyboard-only,
offline-Hindi and real-phone checks; load each subject's lessons only when selected.

## Active work

| Agent | Branch | Owned files | Status | Last step / next step |
|---|---|---|---|---|
| Claude Code | `task/phase2-content-model` (from `next`) | `docs/CONTENT_MODEL.md`, `schemas/content-model/`, `scripts/content/schema.mjs`, `scripts/content/v1_lesson.mjs`, `docs/content-model/examples/`, `tests/content-model.test.mjs` | Phase 2 in progress | Done: vocabularies, common + 9 entity schemas, dependency-free validator. Next: worked examples (Hindi g1-hindi-w09-d02, Math g1-math-w09-d01), CONTENT_MODEL.md, test, PR to `next`. Owner said “Start work” after Phase 1 merge; the profile review gate is still open. |
| Claude Code | `task/phase1-program-profiles` (from `next`) | `scripts/content/*`, `curricula/*/extracted/matter/`, `curricula/*/model/*`, `tests/pagemap.test.mjs`, `docs/tasks/phase1-program-profiles.md` | Phase 1 drafted; PR to `next` open | Done: extractor, section maps, page maps + coverage test (npm test 83/83), both PROGRAM_PROFILE.md drafts, workbook matter. Next: owner/academic review gate ✋ of both profiles; then Phase 2. Any agent may take over. |
| Claude Code | `task/ontology-plan` (merged as PR #5) | `docs/CONTENT_ARCHITECTURE_PLAN.md`, `docs/VERSIONING.md`, `docs/preview/pages-preview.yml` | Phase 0 waiting on owner | Done: tag `v1.0.0`, branches `release/v1` and `next`, branch rules, plan, preview workflow template. Waiting: owner names the preview organisation. Next: step 1 of *Next up*. Any agent may take this over. |

## Change log

Newest first. Each entry: date, agent, branch/commit, what changed, checks run,
task note, and anything left undone.

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
