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
- [x] T1 tokens and fonts · [x] T2 components · [x] T3 screens · [x] T4 guards (design-system test, `npm run test:e2e` 594 checks, 0 failures) · [x] T5 docs · [x] T6 released: PR #33 → `next`, PR #34 → `main` @ `9259ec8`, Pages success; tag `v2.1.0` pending (proxy refused the push)

## If you pick this up (Codex)
Work through the unchecked tasks in order. Every visual value must come from the `:root` tokens in
`dist/styles.css`. Run `npm test`, then `npm run test:e2e` with a server on :8765.
