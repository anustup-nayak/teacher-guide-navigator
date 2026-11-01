# Production polish (UI system, UX journeys, engineering, docs) · r70

1 Nov 2026 · Claude Code · branch `task/production-polish` (from `next` = `main` @ `f59cd45`)

**Goal and plan:** [AUDIT_2026-11-PRODUCTION.md](../AUDIT_2026-11-PRODUCTION.md) §1 and §4. The owner approved
unsupervised execution in chat on 1 Nov 2026.

**Owned files:** `dist/styles.css`, `dist/guide-cards.css`, `dist/index.html`, `dist/fonts/`, `dist/app.mjs`,
`dist/views/*`, `dist/sw.js` (shell list), `tests/design-*.test.mjs`, `tests/e2e/`, and these docs: DESIGN_SYSTEM,
DESIGN_CONTRACT, PRD, ARCHITECTURE, DEVELOPMENT, README index, HANDOFF.

**Acceptance:** the "Done when" column of the audit's §1, the full gate, and the E2E journey sweep.

## Progress
- [x] Audit written (`docs/AUDIT_2026-11-PRODUCTION.md`)
- [ ] T1 tokens and fonts · [ ] T2 components · [ ] T3 screens · [ ] T4 guards · [ ] T5 docs · [ ] T6 release

## If you pick this up (Codex)
Work through the unchecked tasks in order. Every visual value must come from the `:root` tokens in
`dist/styles.css`. Run `npm test`, then `npm run test:e2e` with a server on :8765.
