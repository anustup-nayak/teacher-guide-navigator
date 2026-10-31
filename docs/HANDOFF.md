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
| Repository | github.com/anustup-nayak/teacher-guide-navigator (public), default branch `main` |
| Release | r56 (app, worker and import URLs) |
| Published content | UP Mathematics Grades 1–3, pack `up-math-2026`: 366 day plans (183 direct, 183 weekly), 990 page images |
| Teacher-data namespace | `up-sandarshika-2026-v1` (permanent) |
| Checks | `npm test` (75, includes design lock), `npm run check`, `node --check dist/sw.js`, `npm run verify:publication`, `npm run test:ingestion` (9), skill script tests, `npm run verify:sources -- --require-complete` |
| Design lock | `docs/design-lock.json`; see [design contract](DESIGN_CONTRACT.md) |
| Known open checks | Independent academic review, real teachers, physical phones/TalkBack, physical printing |

## Next up

**UP Hindi (language subject), Grades 1–3.** Discovery in progress (see *Active work*). Sources: Renu Chauhan's Drive folder “UP Literacy TG & WB” (TG G1–G3, Workbooks Sarangi G1–G2 and Veena 1 G3).
Follow [skills/teacher-guide-to-app/SKILL.md](../skills/teacher-guide-to-app/SKILL.md)
from its discovery step: obtain the Hindi Teacher Guide and Workbook PDFs,
inspect them, agree a requirements brief with the owner, then build a **new,
separate pack** under the rules in [CURRICULUM_EXPANSION.md](CURRICULUM_EXPANSION.md).
The Math pack, its paths, images, IDs and storage keys must stay byte-identical.
The new subject must reuse the existing screens and lesson card components; any
new visual component needs owner approval under the design contract.

## Active work

| Agent | Branch | Owned files | Status | Last step / next step |
|---|---|---|---|---|
| Claude Code | `task/up-hindi-ingestion` | `curricula/up-hindi-2026/`, `dist/packs/up-hindi-2026*`, `dist/curricula.mjs`, small generic edits in `dist/app.mjs` (phase `role`, `worksheetPreview`), `dist/lesson-visuals.mjs`, `dist/core.mjs` (minutes ranges), `tests/hindi-pack.test.mjs`, `tests/test_hindi_decoder.py`, docs listed in task note, this file | in progress: build | Builder `tools/build_pack.py` renders 972 WebPs into dist/packs/up-hindi-2026/ and writes reviewed/. Pack registered in curricula.mjs (Math first). If interrupted: rerun parse_guides → parse_workbooks → build_pack (it skips existing images), then `node scripts/publish_curriculum.mjs up-hindi-2026`, `npm run record:additions`, `npm run manifest`, `npm run release:assets -- r57`, full checks, browser test Hindi/English 360/390. tests/hindi-pack.test.mjs fails until publish. |

## Change log

Newest first. Each entry: date, agent, branch/commit, what changed, checks run,
task note, and anything left undone.

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
