# Task notes

Dated evidence for each task: what was done, checks and results, and what was left. They are
records, not instructions; the current rules are in the contracts listed in [../README.md](../README.md).

| Note | Task | Outcome |
|---|---|---|
| [ux-audit-fixes](ux-audit-fixes.md) | UX audit fixes | v1, merged |
| [scrollable-lesson](scrollable-lesson.md) | Full scrollable lesson with section chips | v1, merged |
| [source-led-cards](source-led-cards.md) | Compact source-led lesson cards | v1, merged |
| [workspace-separation](workspace-separation.md) | Separate source and parsed content | v1, merged |
| [curriculum-extensibility](curriculum-extensibility.md) | Curriculum packs | v1, merged |
| [curriculum-expansion](curriculum-expansion.md) | One state app with grade/subject controls | v1, merged |
| [persistent-context](persistent-context.md) | Persistent curriculum context line | v1, merged |
| [product-architecture](product-architecture.md) | PRD, skill intake, modular runtime | v1, merged |
| [skill-packaging](skill-packaging.md) | Package the PDF-to-app workflow | merged |
| [github-readiness](github-readiness.md) | GitHub archive and Pages | v1, merged |
| [agent-continuity-design-lock](agent-continuity-design-lock.md) | Handoff log and design lock | merged |
| [documentation-maintenance](documentation-maintenance.md) | Standing documentation rule | standing rule |
| [up-hindi-ingestion](up-hindi-ingestion.md) | UP Hindi Grades 1–3 pack | v1 r57, merged |
| [repair-g2-hindi-w19-d03](repair-g2-hindi-w19-d03.md) | Source repair of one Hindi day | v1 r58, merged |
| [hindi-grid-columns](hindi-grid-columns.md) | Grid crops on the right step | v1 r59, merged |
| [v1-fixes](v1-fixes.md) | Vowel signs, lesson links, 390 px/keyboard/offline checks | v1 r60–r61, merged |
| [phase1-program-profiles](phase1-program-profiles.md) | Phase 1: program profiles, section and page maps | v2, merged |
| [program-structure](program-structure.md) | Program structure: calendar, day types | v2, merged |
| [content-compiler](content-compiler.md) | Phase 3: compiler, releases, website pinned to release | v2, merged |
| [program-metadata-layout](program-metadata-layout.md) | Program metadata, repository layout, docs cleanup | v2, PR #17 |

## Writing a task note

For each agent task, create a Markdown note with objective, branch, owner, exclusive file scope, dependencies, acceptance criteria, checks run, results and unresolved issues. Do not include secrets or personal data. Agree scope before editing shared files.

Task notes hold the detail; [HANDOFF.md](../HANDOFF.md) holds the running state shared by all agents. Claim the task in HANDOFF's *Active work* table when you start, update it after each step, and add a change-log entry linking this note when you finish.

Suggested skeleton:

```markdown
# <Task name> — <date>

Goal:
Branch / agent:
Owned files:
Not touched:

## Acceptance criteria
## Checks (commands and results)
## Documentation impact
## Design impact (none, or the owner approval recorded in docs/design-lock.json)
## Unresolved risks / next step
```
