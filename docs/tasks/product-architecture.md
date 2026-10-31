# Product contract, conversational skill intake and modular runtime

Scope: PRD, architecture, skill/reference/templates, runtime module extraction,
registry/UP descriptor, release/check integration and meaningful module tests.
Owner: one agent. No Git metadata in transferred checkout; local backup retained
outside served tree. No production deployment or source content changes.

Plan: baseline → PRD/intake freeze → isolate pack/config/domain/preferences →
resource/offline services → reader/offline/media features → composition wiring →
module and compatibility tests → browser journeys → final evidence/package refresh.
Acceptance: new-source skill asks first for TG/workbook, inspects then clarifies
requirements until a recorded agreed freeze; build starts after that gate. PRD,
architecture, skill, templates and implementation cross-reference each other.
Shared runtime supports independent pack contexts; UP data, IDs, paths and saved
keys remain unchanged. Readers/offline data scoped to selected pack, modules cached
transitively. Existing behavior preserved and verified. No fabricated second pack.

## Result

Implemented PRD P01–P18, conversational discovery reference and requirements-brief
template; wired AGENTS, README, skill, content/release references and CI. Extracted
UP descriptor, pure curriculum helpers, per-instance context, resource repository,
worker client, reader/offline features and source-media view. Added recursive
module syntax checks and a coordinated version/shell-generation command. Shared
module factories remain compatible with one active pack per page; separate packs
use distinct context/namespace, not duplicated applications. No raw/source catalog
or page-image changes, no storage reset, no deployment. Release r48.

Validation: 59 Node tests, 3 ingestion tests, 4 skill-preflight tests, module syntax,
skill frontmatter and all four UP publication-byte comparisons pass. New module
tests cover context/key isolation, null preferences, source-derived default week,
resource dedup/retry/isolation, offline ledger/shared references and injected
source-media language. Existing dependency-cache traversal covers all modules.

Browser: Grades 1/2/3, Hindi/English, 390px and 320px with 32px instruction text,
source art reader, Back/Forward/close, correct worksheet page7/PDF9 print preview,
offline readiness, note save/reload/restoration passed. A missing injected prefs
reference surfaced in the first integration run and was fixed with a regression
test. Prepared pages remained checked/available after r47→r48; the temporary
offline copy was removed and temporary note restored. Normal viewport restored.

Scope limits: this is a functional modularization, not a framework migration,
full renderer rewrite, multi-widget mount system or proof of an unseen PDF adapter.
Real teacher/physical printer/TalkBack/academic gates remain as stated in PRD/QA.

Final fresh-session checks: ordinary Back before any reader exists, Enter artwork
opening, Escape/focus return and final console passed without warnings/errors.
Release generator repeated at r48 produced byte-identical runtime outputs;
PRD/architecture/skill Markdown links resolve. Skill validator and updated
preflight/helper tests pass; CI now includes skill-helper tests.
