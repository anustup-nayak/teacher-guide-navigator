# Complete smart-card production handover

1 Nov 2026 · Codex taking over from Claude Code · task/cards-production-finish

Owner approval: all cards and production publication, “Yes approve everything. Publish and run all UI, UX, content tests, cleanup unnecessary files and make it clean production ready.”

Verified starting state: PR #27 head 7c9e7ad was green and open; HANDOFF claimed cutover prematurely. Merged #27 into next as 615f907. It contains 549 approved cards (183 Math, 366 Hindi), content 1.3.3, r69, removed empty drafts and superseded generators. No release rebuilt.

Owned work: deployment staging/script/test, workflow, current release documentation. Other agents’ original worktrees and uncommitted work remain untouched. Immutable earlier releases and decision mockups are retained.

Acceptance: full local gates and CI; approved card counts and coverage; mobile Hindi/English UI, links, reader, keyboard and console; PR next → main, successful Pages deployment; live r69 and /v1/r61 verified; freeze release/v1 and tag verified v2 cutover.

Progress: staging current website plus frozen v1.0.4 into an isolated artifact; no repository sources included. Full local gates pass: 137 Node tests, 16 ingestion tests, 5 skill helpers; program/content/site/publication/complete-source checks, worker/module syntax, 549-card workbench and all-card render sweep. Browser: 24 loaded card states (six grade-subject pairs × Hindi/English × 360/390px) plus 18 navigation screens; no overflow, broken loaded images or console errors. Fallback worker cache namespace is isolated during staging to prevent cross-version cache deletion on the shared origin; the staging test exercises that isolation. Deployment is now complete; see the verified production result below.

Limits: software verification is not independent academic review, teacher field testing, physical phone/TalkBack or physical printing.

## Production result — complete

PR #30 merged to main at `edd31db543ef9eceee39e97f69d5bd3f7cc6bbda`, tag `v2.0.0`. [Pages run 41279200254](https://github.com/anustup-nayak/teacher-guide-navigator/actions/runs/41279200254) and [Checks run 41279200249](https://github.com/anustup-nayak/teacher-guide-navigator/actions/runs/41279200249) succeeded. Root index/app/sw/lesson-cards match the tested r69 bytes. Frozen `/v1/app.mjs` matches v1.0.4; its deployed worker uses legacy-up-guide- cache ownership. release/v1 remains frozen.

Live browser: Hindi at 360px, English at 390px; smart card renders, first-step link focuses phase-title-0, workbook p5 loads at 1250px source width and returns to lesson, no overflow or console errors. The browser was opened on r61 before deployment; a temporary note survived upgrade to r69 and was then restored to its original value. v1 fallback loads the detailed lesson successfully.

Production release is complete. Next: the separate professional UI/design-spec and teacher-archetype UX audit; no redesigned UI was added to this release.
