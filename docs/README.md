# Documentation map

Current contracts first; dated records last. If two documents disagree, the contract in the
first table wins and the other should be corrected in the same change.

## Start here

| Document | Use it for |
|---|---|
| [../README.md](../README.md) | What the app is, how to run it, how content flows |
| [../AGENTS.md](../AGENTS.md) | Rules for every coding agent (CLAUDE.md imports it) |
| [HANDOFF.md](HANDOFF.md) | Current state, next steps, active work, change log |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Commands, checks, changing and releasing |
| [VERSIONING.md](VERSIONING.md) | Branches (`main` production, `next` integration, frozen `release/v1`), tags and rollback |
| [WORKFLOWS.md](WORKFLOWS.md) | Runbooks: release, UI change, smart cards, content repair, new packs, rollback, handoff |

## Product and design

| Document | Use it for |
|---|---|
| [PRD.md](PRD.md) | Users, requirements, priorities, exclusions |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | **Canonical UI specification**: tokens, type, colour roles, components, accessibility |
| [DESIGN_CONTRACT.md](DESIGN_CONTRACT.md) | Frozen look, feel and flow (owner approval to change) |
| [VISUAL_DESIGN.md](VISUAL_DESIGN.md) | Source-led lesson card geometry (values now come from DESIGN_SYSTEM tokens) |
| [PROGRAM_GUIDE_DESIGN.md](PROGRAM_GUIDE_DESIGN.md), [review/math-goal-titles.md](review/math-goal-titles.md) | Approved design record: guide structure and Math goals are live; Hindi goal mapping and later slices remain separate work |
| [SMART_CARDS.md](SMART_CARDS.md) | Published card contract, review/approval and future card authoring |
| [AUDIT_2026-11-PRODUCTION.md](AUDIT_2026-11-PRODUCTION.md) | Production audit (UI, UX, engineering, docs): goals, issue register, what r70 fixed |
| [TEACHER_UX_AUDIT_PROTOCOL.md](TEACHER_UX_AUDIT_PROTOCOL.md) | Protocol for the human teacher study (still open) |
| [UI_DESIGN_NEXT_ITERATION.md](UI_DESIGN_NEXT_ITERATION.md) | The brief that the production audit answered (record) |
| [review/ocr-matra-defects.md](review/ocr-matra-defects.md) | Open content defects: detached vowel signs to repair against the source |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Runtime modules, data flow, curriculum instances |

## Content system

| Document | Use it for |
|---|---|
| [REPOSITORY_LAYOUT.md](REPOSITORY_LAYOUT.md) | Which folder owns what |
| [PROGRAM_METADATA.md](PROGRAM_METADATA.md) | Whole-program understanding required for every pack |
| [CONTENT_MODEL.md](CONTENT_MODEL.md) | Entities, IDs, links, provenance, program structure, owner decisions |
| [CONTENT_COMPILER.md](CONTENT_COMPILER.md) | Building and verifying content releases; query library; website pinning |
| [CONTENT_PLATFORM.md](CONTENT_PLATFORM.md) | One content back end for many products (website first) |
| [CONTENT_ARCHITECTURE_PLAN.md](CONTENT_ARCHITECTURE_PLAN.md) | The phased v2 plan and its decisions |
| [CURRICULUM_PACKS.md](CURRICULUM_PACKS.md) | v1 pack contract |
| [CURRICULUM_EXPANSION.md](CURRICULUM_EXPANSION.md) | Adding grades/subjects; preservation baseline and amendments |
| [SOURCE_ARCHIVE.md](SOURCE_ARCHIVE.md) | Archiving original PDFs and checksums |
| [../CONTENT_RIGHTS.md](../CONTENT_RIGHTS.md) | Content and software rights |
| [../curricula/README.md](../curricula/README.md) | Curriculum workspace |
| Program profiles: [Hindi](../curricula/up-hindi-2026/model/PROGRAM_PROFILE.md), [Math](../curricula/up-math-2026/model/PROGRAM_PROFILE.md) | What each guide contains |

## Quality and release

| Document | Use it for |
|---|---|
| [QA_QC_RELEASE_CHECKLIST.md](QA_QC_RELEASE_CHECKLIST.md) | Release checklist |
| [GITHUB_PAGES.md](GITHUB_PAGES.md) | Deployment |
| [CONTENT_AUDIT.json](CONTENT_AUDIT.json) | Math content audit output (legacy pipeline) |
| [design-lock.json](design-lock.json) | Protected-file hashes and approvals |

## Reusable workflow

[../skills/teacher-guide-to-app/SKILL.md](../skills/teacher-guide-to-app/SKILL.md) — new Teacher
Guide PDFs to an app: intake, program understanding, modelling, compiling, design and QA.

## Records (not instructions)

- [tasks/](tasks/README.md) — dated evidence for each task.
- [history/](history/) — earlier README, development log, MVP acceptance, first QA report, original
  transfer manifest.
- [content-model/examples/](content-model/examples/) — Phase 2 worked examples.
