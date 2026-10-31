# Agent continuity and design lock — 31 October 2026

Goal: let any coding agent (Claude Code, Codex or another) pick up work where the
previous one stopped, and stop any agent from changing the app's look, feel or
teaching flow without the owner's explicit approval. Prepare a clean baseline
before the UP Hindi Grade 1–2 ingestion.

Branch: `task/agent-continuity-design-lock` (single agent, main checkout; no
parallel agent active). Agent: Claude Code.

Owned files: `docs/HANDOFF.md` (new), `docs/DESIGN_CONTRACT.md` (new),
`docs/design-lock.json` (new), `scripts/design_lock.mjs` (new),
`tests/design-lock.test.mjs` (new), `CLAUDE.md` (new), `package.json`,
`AGENTS.md`, `README.md`, `docs/DEVELOPMENT.md`, `docs/tasks/README.md`,
`skills/teacher-guide-to-app/SKILL.md`,
`skills/teacher-guide-to-app/references/design.md`,
`skills/teacher-guide-to-app/references/release.md`.
Not touched: runtime modules, CSS, reviewed content, images, storage keys.

## Acceptance criteria

- One shared handoff file holds the current state, active claims, next step and
  an append-only change log; every agent entry point (AGENTS.md, CLAUDE.md, skill)
  says to read it first and update it during work, not only at the end.
- A canonical design contract names the protected flow, layout, palette,
  typography, vocabulary and the approval procedure.
- `npm test` fails if a protected UI file changes without a recorded approval,
  and fails if fundamental flow/shell/token invariants are broken.
- Approval is recorded with reason, approver and changed files; it cannot run
  without both a reason and an approver.
- Existing tests, publication and source checks still pass; no runtime change.

## Checks

All pass: npm test 75/75 (6 new), check, design:check, sw.js syntax, verify:publication, test:ingestion 7/7, skill tests 4/4, verify:sources --require-complete, preflight. Lock fails on a palette change and ignores a release-version bump.

## Documentation impact

AGENTS.md, CLAUDE.md, README, DEVELOPMENT, task-note README, skill entry point,
skill design and release references now point to HANDOFF.md and
DESIGN_CONTRACT.md as the single sources for continuity and protected design.
The design rules themselves remain in the skill design reference and
VISUAL_DESIGN.md; the contract lists what is frozen and links there for detail.

## Unresolved risks

- The lock is a tripwire, not access control: an agent can still run the
  approve command without asking. AGENTS.md and the contract forbid that, and
  each approval is recorded with its approver in git history for review.
- `app.mjs` is not hash-locked because content and pack work legitimately edits
  it; its fundamental flow is guarded by the semantic tests instead.
