# Housekeeping after the r71 release (2 Nov 2026)

- **Agent:** Claude Code
- **Branch:** `task/housekeeping-2026-11-02`
- **Owned files:** `docs/HANDOFF.md`, `docs/VERSIONING.md`, this note
- **Goal:** Owner, chat: "Do the housekeeping", after a status check that listed the
  unpushed tag, the stale *Active work* row, draft PR #28, the main checkout on an old
  branch and merged remote task branches.

## Done

| Item | Result |
|---|---|
| Tag `v2.1.0` | Annotated tag pushed; `refs/tags/v2.1.0^{}` = `9259ec807eff4a4e49e89c161cd4696a0469274f` (release PR #34, r70) |
| HANDOFF *Active work* | Finished `task/production-polish` row removed; Codex paused row kept |
| VERSIONING.md | `v2.1.0` no longer marked "to be pushed" |
| Main checkout | Clean; switched from `task/today-home` (r65) to `next`, fast-forwarded to `5b2cb43` |

## Not done: needs the owner

The permission classifier refused GitHub writes from this session. Run these yourself or
allow them:

```bash
gh pr close 28 --comment "Superseded: the Hindi G1 w09–w11 cards were published by PR #26 (content 1.3.2, r68)."
```

Remote branches fully merged into `main`, not checked out in any worktree. SHAs are
recorded so each can be restored with `git push origin <sha>:refs/heads/<branch>`:

| Branch | SHA |
|---|---|
| task/cards-all-drafts | 7c9e7ad |
| task/cards-math-g2-a | dbd34af |
| task/cards-production-finish | ae85612 |
| task/cards-release-1 | dda62b7 |
| task/docs-post-cutover | 06cdb2b |
| task/final-ui-ux-r70 | 7fc1745 |
| task/handoff-r70 | a9f4911 |
| task/math-goal-titles | bb57abf |
| task/math-goals | e213aac |
| task/production-polish | 4242d0a |
| task/program-metadata-layout | 1fa0aab |
| task/r71-review-fixes | f4ebaee |
| task/release-r69-evidence | b9b3a58 |
| task/smart-cards | 4e41e94 |

```bash
git push origin --delete task/cards-all-drafts task/cards-math-g2-a task/cards-production-finish task/cards-release-1 task/docs-post-cutover task/final-ui-ux-r70 task/handoff-r70 task/math-goal-titles task/math-goals task/production-polish task/program-metadata-layout task/r71-review-fixes task/release-r69-evidence task/smart-cards
```

Intentionally kept:
- Merged, but checked out in a worktree: `task/cards-hindi-g1-a`, `task/r71-release-record`
  (Codex) and `task/today-home` (main checkout's old branch).
- Not merged into `main`: `task/cards-hindi-g1-a-draft` (PR #28), `task/content-compiler`,
  `task/program-guide-a`, `task/ui-ux-audit-r69`.
- All Codex worktrees on disk, including uncommitted work on `task/query-backed-runtime`.

## Open question for the owner

r71 (`main` @ `d575b47`, release PR #39) has no tag. VERSIONING.md defines no name for it;
`v2.1.1` would fit, since r71 contains review fixes and header changes. Not tagged until you choose.

## Checks

`npm test` 145/145; `check`, `verify:program`, `verify:content`, `verify:publication`,
`verify:site` pass. Docs only: no runtime, content or design files changed.

## Documentation impact

Only HANDOFF.md and VERSIONING.md were affected; no workflow, contract or skill changes.
