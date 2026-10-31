# Curriculum extensibility

Goal: allow future state/subject/grade editions without changing current UP data.
Owned files: dist/app.mjs, dist/curricula.mjs, dist/sw.js, package.json,
tests/curricula.test.mjs, docs/CURRICULUM_PACKS.md and handoff documentation.

Acceptance: registry-driven labels/grades/reviews/resources; pack-scoped storage;
UP remains the legacy default; no changes to catalog or existing lesson IDs;
conditional pack picker; independent source phase titles for future packs.

Checks: 27 Node tests pass, including five new compatibility/extensibility tests;
syntax checks include new registry and worker. Synthetic Grade 8 science pack
exercises registry selection, week 13 daily content, navigation and isolated notes.
Browser smoke: Hindi/English rendering, legacy phase deep link, phone layout at
360/390px without horizontal overflow, and keyboard skip link retaining phase.
Worker regression also verifies offline document navigation with curriculum queries.

Risks/limits: no new source content supplied; synthetic pack is test-only.
Hindi/English UI and week/day schedules remain the supported contract. UP
extraction scripts are not universal importers. Add future module dependencies
to the offline shell. Full future-pack browser/content review is required when
actual content is onboarded. Source folder has no Git metadata, so no task branch
or worktree was created. Transfer manifest predates these local changes.
