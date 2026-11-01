# Workflows (runbooks)

These are short, ordered procedures for the jobs agents and maintainers repeat. Each one links to the canonical
contract instead of copying it. Start every session with [HANDOFF.md](HANDOFF.md) and follow
[AGENTS.md](../AGENTS.md).

| # | Workflow | When |
|---|---|---|
| 1 | [Ship a release](#1-ship-a-release) | Any change that should reach teachers |
| 2 | [Change the UI](#2-change-the-ui) | Styling, layout, components, screens |
| 3 | [Write or revise smart cards](#3-write-or-revise-smart-cards) | Card text for any lesson |
| 4 | [Repair lesson content](#4-repair-lesson-content) | OCR damage, wrong numbers, source errors |
| 5 | [Add a grade, subject or state](#5-add-a-grade-subject-or-state) | New Teacher Guide PDFs |
| 6 | [Roll back production](#6-roll-back-production) | A release broke something |
| 7 | [Hand off to another agent](#7-hand-off-to-another-agent) | End of every session |

## 1. Ship a release

1. Branch `task/<name>` from `next` and claim it in HANDOFF *Active work*. Write `docs/tasks/<name>.md`.
2. Make the change. If content changed, build a new immutable release and pin it ([CONTENT_COMPILER.md](CONTENT_COMPILER.md)).
3. `npm run release:assets -- rNN`. This bumps every `?v=` token and the worker shell, including fonts.
4. Run the full gate ([DEVELOPMENT.md](DEVELOPMENT.md#checks)) and `npm run test:e2e`.
5. PR into `next`, then merge. Then open a release PR from `next` to `main`. Pages deploys `main`
   ([GITHUB_PAGES.md](GITHUB_PAGES.md)).
6. Verify the live site: open it, check the release token in `sw.js`, and run `BASE=<live url> npm run test:e2e`.
7. Write a HANDOFF change log entry and refresh *Current state*.

## 2. Change the UI

1. Read [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) and [DESIGN_CONTRACT.md](DESIGN_CONTRACT.md).
2. Reuse a component. If you need a new value, add a **token** in `dist/styles.css` `:root` first.
3. New screens go in `dist/views/` as pure HTML builders. Keep `app.mjs` to data and events.
4. Protected files need the owner's approval in chat. Record it with `npm run design:approve -- --reason … --approved-by …`.
5. Run `npm test`, then `npm run test:e2e`. Take screenshots at 320 and 390 px in हिन्दी and English.

## 3. Write or revise smart cards

Follow [SMART_CARDS.md](SMART_CARDS.md): draft in `curricula/<pack>/drafts/cards/` with `scripts/content/cards.mjs`
(`scaffold`, `source`, `draft`, `check`, `sheet`). The owner approves the text, then `approve` moves the cards to
`model/`. Then build a content release and publish. Only owner-approved cards ship.

## 4. Repair lesson content

1. Compare against the original page (`curricula/<pack>/originals`). Never repair from memory.
2. Add the repair as described in [DEVELOPMENT.md](DEVELOPMENT.md#changing-things) (source repairs), and build a new content
   release.
3. Open defects are listed in [review/ocr-matra-defects.md](review/ocr-matra-defects.md) (detached vowel signs, 150
   strings).

## 5. Add a grade, subject or state

Use the skill [skills/teacher-guide-to-app/SKILL.md](../skills/teacher-guide-to-app/SKILL.md) together with
[CURRICULUM_EXPANSION.md](CURRICULUM_EXPANSION.md) and [PROGRAM_METADATA.md](PROGRAM_METADATA.md). New screens reuse the
existing components.

## 6. Roll back production

Revert the release merge on `main` by PR. Pages redeploys the previous build. No data migration is needed because lesson IDs
and storage keys never change ([VERSIONING.md](VERSIONING.md)). The frozen v1 stays at `/v1/`.

## 7. Hand off to another agent

Keep your *Active work* row current after each meaningful step. At the end, add a dated change-log entry with what
changed, the checks you ran with their results, and what is left. Leave the task note's unchecked items as the next
agent's to-do list. Push the branch, even unfinished, so nothing is local-only.
