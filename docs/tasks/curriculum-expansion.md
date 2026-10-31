# Unified state app: levels and subjects

Goal: one UP app spanning reviewed Balvatika/Grades 1–5 and subjects (Hindi, Math,
etc.), with shared top navigation and additive delivery that preserves previous
content/data. Owner: one agent; transferred checkout has no Git metadata.
Plan: selection model → canonical Balvatika level → global selectors and switching
→ immutable publication baseline/all-pack gate → fixtures and browser regression
→ PRD/architecture/skill/templates/CI handover. No new real sources supplied;
never ship fake Hindi/Balvatika/Grade4–5 content just to populate the menu.
Scope: domain/selector view/context/validation/import level support, app wiring,
publication verification scripts/baseline, tests, linked product/workflow docs.
Keep existing UP IDs, storage keys, source images and reviewed bytes unchanged.
Acceptance: choose grade/subject from any screen; retain grade/subject when covered;
only actual valid pairs selectable; independent delivery packs may share state/
subject/year with disjoint grades; conflicting coverage rejected; grade0 is labelled
Balvatika throughout. New content and release cannot silently rewrite old payloads.

## Results — local release r51

Added shared top-level Grade/Subject controls on Find, lessons, My list and Help,
with a deep-lesson shortcut. Availability aggregates state/edition delivery packs;
selection retains valid grade/subject and carries grade/UI locale across pack
contexts. Balvatika0 supported by importer, catalog validation, context, labels,
reader/notes and navigation. Existing Math pack remains unchanged.

Published-baseline guard protects existing identity, coverage, source/visual
configuration, four parsed files and all 990 page hashes. All-pack publication
verification and tests reject drift/removed deliveries/overlapping coverage.
New deliveries append to the baseline only after previous entries verify.
Source-specific UP count sentinels remain scoped to UP while global asset hash
validation permits additional packs. PRD/architecture/skill/references/templates/
AGENTS/README/ingestion and release commands link the common expansion contract.

Validation: 66 Node tests, 4 ingestion tests (including actual Balvatika0 CLI),
4 skill-helper tests, syntax, skill frontmatter, all-pack publication checks pass.
Browser: real UP Grades1–3, top controls on all screens, deep switch shortcut,
Hindi/English, 320px normal/200% instructions without horizontal overflow, source
lesson navigation and clean console. Isolated synthetic registry on port8004
verified Grades0–5, Hindi/Math cross-delivery switching, grade/subject retention,
Balvatika labels, unavailable subject filtering and independent notes. Those
fixtures are not published/committed as curriculum. Temporary fixture notes were
restored and viewport reset. Only current reviewed Math1–3 appears in the real app;
new Balvatika/Hindi/Grades4–5 sources were not supplied in this task.
