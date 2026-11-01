# Post-cutover documentation consistency

1 Nov 2026 · Codex · task/docs-post-cutover

Owner asked whether documentation was clean on both sites, following the authorized release/cleanup work. Audit found stale current instructions despite correct release records. Corrected current status and publishing/build instructions; kept dated history and immutable release records intact. Engineering docs are repository-only: root and /v1/ return 404 for README.md and docs/HANDOFF.md by design, and 200 for each website index.

Owned files: AGENTS, current docs and the reusable release reference. No app or curriculum change. Checks: documentation links, skill-helper tests and staged diff check; full CI before merge. Current pins checked against package.json, website.json and release manifests. Next: teacher-centred UI/UX audit, not a redesign implementation.

Local sparse-checkout PNGs were restored from their tracked bytes to run link checks. Two new iCloud optA/optB sync copies were moved outside the worktree, not committed. Documentation tests: 2/2; skill helpers: 5/5. No runtime change or new release/version bump.
