# आज home and UX review changes (r65) — 1 Nov 2026

Goal: build every change from the [UX review](../UX_REVIEW_2026-11.md) except smart cards, and hand smart cards off.

Branch: `task/today-home`, from `task/math-goals` (PR #21). Owner: Claude Code. Approval: owner in chat, 1 Nov 2026
(“First work all the other enhancements other than smart cards”), tabs approved in the review doc.

## Owned files

`dist/views/today.mjs` (new), `dist/domain/progress.mjs` (new), `dist/app.mjs`, `dist/index.html`, `dist/core.mjs`
(route), `dist/guide-cards.css`, `dist/views/program-guide.mjs`, `dist/views/current-context.mjs`,
`dist/domain/app-context.mjs` (return target), release tokens r65 (`release:assets`), tests
(`today`, `design-lock`, `current-context`, `program-guide`), docs (`UX_REVIEW_2026-11`, `SMART_CARDS`,
`DESIGN_CONTRACT`, `HANDOFF`), `docs/design/smart-cards/`, `docs/design/r65-overview.png`.

## What changed

See the table in [UX_REVIEW_2026-11.md](../UX_REVIEW_2026-11.md#built-in-r65-branch-tasktoday-home). Behaviour notes:

- Position = the lesson after the furthest lesson marked taught in this grade (`teacherPosition`). Skipped days
  never pull “next” backwards.
- The prompt asks about the lesson last opened in this grade (`-opened-by-grade`, written when a lesson renders),
  at most once a day, and stops after three “अभी नहीं” in a row; a “हाँ” resets it (`-taught-prompt`).
- Goal position counts teaching lessons only; days 4–6 show the goal without a position.
- School readiness: on आज when nothing is taught yet and the program calendar has a `school-readiness` block
  (Grade 1, both subjects, weeks 1–8); in सभी पाठ as a “सप्ताह 1–8 · स्कूल रेडिनेस” week option when a grade's
  lessons start after week 1.
- Grade/subject: the switcher is hidden until the context chip is tapped; a change returns lesson and saved
  screens to आज. A subject change keeps आज or पूरा साल as the screen.

## Checks

`npm test` 132/132, `npm run check`, `verify:site`, `verify:content`, `design:check` pass. Playwright at 320, 360 and
390 px (Hindi and English): आज, lesson top, mark taught and next, आज after marking, guide home, goals, goal,
सभी पाठ, grade switch, prompt; no horizontal overflow, no console errors. Screens: `docs/design/r65-overview.png`.

## Open

- Real phones and TalkBack; keyboard pass on आज and the switcher chip done in code (native buttons and links) but
  not tested with a screen reader.
- Lazy loading of the chosen subject only, automatic offline for this week, multigrade: not started.
- Smart cards: [SMART_CARDS.md](../SMART_CARDS.md).
