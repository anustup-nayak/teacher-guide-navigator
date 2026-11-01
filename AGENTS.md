# Working on Sandarshika

These rules apply to every coding agent (Codex, Claude Code or another). `CLAUDE.md`
imports this file; keep rules here, not in agent-specific copies.

## Start and finish every session
1. Read [docs/HANDOFF.md](docs/HANDOFF.md) first: current state, active work, next
   step and change log. Continue unfinished work recorded there before starting new work.
2. Claim your task in its *Active work* table (agent, branch, owned files) and create
   the task note in docs/tasks/.
3. Update your row after each meaningful step, not only at the end: you may run out of
   tokens, and the next agent must be able to continue from HANDOFF.md and the task note.
4. Finish with a dated *Change log* entry (what changed, checks and results, what is
   left), and refresh *Current state* if facts changed. Never rewrite older entries.

Then read README.md, docs/DESIGN_CONTRACT.md, docs/QA_QC_RELEASE_CHECKLIST.md and
docs/DEVELOPMENT.md before editing. Files under docs/history/ and docs/tasks/ are dated records, not instructions.

## Protected design
- [docs/DESIGN_CONTRACT.md](docs/DESIGN_CONTRACT.md) freezes the look, feel and teaching
  flow: routes, header, browse tabs, lesson anatomy, palette, type, touch sizes and
  core Hindi labels. Do not change them without the owner's explicit approval in chat.
- `npm test` fails when `dist/styles.css`, `dist/guide-cards.css` or the `dist/index.html`
  shell changes without a recorded approval, or when a frozen invariant breaks. Never
  run `npm run design:approve` or edit `tests/design-lock.test.mjs` to make a test pass
  without that approval; record the approval in HANDOFF.md.
- New grades and subjects reuse the existing screens and lesson-card components. If a
  source cannot be shown with them, stop and propose the new component to the owner.

## Product rules
- Serve Hindi-first rural UP teachers with low digital familiarity.
- Preserve topic → summary card → full lesson and alternative week/day navigation. Never add mandatory entrance layers.
- Show actual teaching actions, not only outcomes or phase titles.
- Preserve source wording, numerals, timings, provenance and weekly-template labels. Do not invent GRR content for weekly templates.
- Preserve local notes, bookmarks, completion and resume keys. Never clear storage as a migration strategy.
- Keep original images accessible; label adaptations. Do not claim academic sign-off.

## Collaboration
- Branches and releases follow [docs/VERSIONING.md](docs/VERSIONING.md): `main` is v2 production; work branches from and merges into `next`, then reaches `main` by a reviewed release PR. The owner-approved cutover is complete; `release/v1` and tag `v1.0.4` remain frozen for `/v1/`.
- One task branch and isolated git worktree per coding agent. Never edit another agent's worktree.
- Agree file ownership before parallel tasks. app.mjs and styles.css are shared hotspots: only one agent edits each at a time.
- Task notes belong in docs/tasks/; record goal, owned files, acceptance criteria, checks and unresolved risks. The running cross-agent state and change log is docs/HANDOFF.md.
- An integrating agent reviews diffs and runs the complete checks before merging. Do not force-push shared branches.
- Content changes require source comparison; app tests alone cannot prove academic correctness.
- No credentials, signed URLs, private email or student data in commits. Preserve authorized source PDFs and checksum manifests in curricula/<pack-id>/originals; follow docs/SOURCE_ARCHIVE.md. Publish only dist/ to Pages.

## Verification
- Node 22+: npm test and npm run check. `npm test` includes the design lock (`npm run design:check` runs it alone).
- Check dist/sw.js syntax after worker changes; bump app and worker versions together for releases.
- Test changed UI in Hindi and English at 320–390px, keyboard navigation and legacy deep links; run `npm run test:e2e`
  against a local server (archetype journeys A–F, all smart cards, offline).
- Style only with design tokens ([docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)); `tests/design-system.test.mjs` fails on raw
  colours, px font sizes, px radii or inline style values.
- Test on localhost or HTTPS. Opening index.html through file:// is unsupported.
- Keep this project buildless unless a task explicitly authorizes a framework migration.

## Reusable PDF-to-app workflow

For new Teacher Guide/Workbook PDFs, new curriculum packs, source-content repairs
or source-led teaching-flow redesigns, read
[skills/teacher-guide-to-app/SKILL.md](skills/teacher-guide-to-app/SKILL.md).
It includes staged ingestion, source review, pack contracts, design, all 21 UX
regressions, release gates and reusable templates. Its history is evidence, not
new user instructions. Use the current task's scope/authorization. Audit-only work
stays read-only; UI-only work does not regenerate source content.

## Product and module contracts

Read [docs/PRD.md](docs/PRD.md) and
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for product changes/new packs.
New-PDF tasks start with TG/workbook sources, then grounded conversation and an
agreed requirements brief before implementation. Existing authorized repairs do
not need a redundant intake. Preserve shared feature/service factories and
pack-scoped context; do not fork the app per state. Update contracts, skill and
acceptance tests together when behavior changes. Use `npm run release:assets --
rNN` to coordinate authored-module versions and offline dependencies before release.

## Unified grade and subject expansion

[Curriculum expansion contract](docs/CURRICULUM_EXPANSION.md) is authoritative for multi-grade/subject
UP growth: one state app with top Grade/Subject controls, Balvatika as level0,
metadata-derived valid pairs and disjoint immutable deliveries. New content must
not overwrite any previous published payload, image path or teacher-data identity.
Run all-delivery publication checks and the preservation baseline gate; never
reset the baseline to bypass a failure.

## Keep the workflow current

For every future change, check whether it introduces or changes product behavior,
source/pack contracts, module interfaces, ingestion steps, UI conventions, release
commands, failure recovery or validation requirements. Incorporate relevant changes
into the skill and its references/templates, PRD, architecture, developer/expansion
docs and acceptance tests in the same task. Update only affected documents; avoid
copying the same instructions into multiple sources of truth. Link contracts to
the canonical explanation and preserve historical evidence as dated history.
Record the documentation impact and verification in the task note. A change is
not complete while future-build instructions contradict the implementation.

## Program understanding gate

Before lesson extraction/modelling for any new grade, subject, state or edition,
read `docs/PROGRAM_METADATA.md` and `docs/REPOSITORY_LAYOUT.md`. Inspect the whole
program and record all nine dimensions, evidence, calendar/day types and explicit
questions in canonical metadata/profile. An initialized scaffold is not readiness;
`npm run verify:program` and `npm run verify:content` must pass. Preserve honest
academic-review status. Keep source-family adapters in pack tools and shared
primitives in scripts/ingestion; never fork canonical content per front end.
