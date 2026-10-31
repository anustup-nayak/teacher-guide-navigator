# Sandarshika product requirements

Status: reusable product baseline, 31 October 2026. A new curriculum's agreed
requirements brief specializes this PRD; it does not silently replace it.
Implementation boundaries: [architecture](ARCHITECTURE.md). Execution process:
[teacher-guide-to-app skill](../skills/teacher-guide-to-app/SKILL.md). Validation:
[skill QA matrix](../skills/teacher-guide-to-app/references/qa.md).

## Problem and product promise

Government-school teachers must locate, prepare and teach source lessons from
large guides/workbooks, often on a phone with intermittent connectivity and low
familiarity with complex apps. PDFs preserve teaching diagrams and structure but
are difficult to search, navigate and use during teaching. An app that loses
source meaning, hides the lesson loop or promises unavailable worksheets creates
extra work and can mislead the teacher.

The product is the teacher's existing guide made easier to teach from: authentic
content and illustrations, familiar source visual identity, readable mobile
cards, predictable navigation and explicit offline preparation. It is a teaching
companion, not a replacement curriculum or a student mastery system.

## Users and situations

Primary user: classroom government-school teacher, initially Hindi-speaking UP
Grades 1–3 mathematics, using a phone. Digital confidence may be low. Do not assume
fast data, a personal laptop, login literacy or knowledge of browser storage.
Future packs serve their actual state, subject, grade, language and edition.
Secondary user: academic/content reviewer inspecting fidelity and source errors.
Operator: a user supplies authorized PDFs and discusses desired app behavior with
an agent; the agent ingests/reviews/configures/builds/tests a separate pack.

Jobs:

- Before class: find the intended lesson, see materials/prerequisites, understand
  the whole teaching sequence, write preparation and store required pages offline.
- During class: see what to do/ask, enlarge authentic art, jump/reverse sections,
  use worksheets/source references and return without losing class/day context.
- After class: retain notes and explicitly mark taught with undo; reopen later.
- Across editions/curricula: switch supported packs without mixing resources or
  teacher data and without breaking existing links.

## Entry and agent-operated discovery

The operator's first step is providing/uploading or pointing to the Teacher Guide
and Workbook PDFs; an optional textbook is requested only when references require
it. If already supplied, inspect them instead of asking again. Do not start with
a long requirements questionnaire. Infer cover metadata, schedule, language,
source structure and resource relationships from evidence, then converse in small
rounds about ambiguity and desired product differences.

Before implementation, record and confirm a requirements brief: goals, audience,
source set/checksums/edition, coverage, native schedule/phase structure, languages,
browse routes, visual identity, adaptations, resources, offline/persistence,
deployment scope, acceptance criteria and explicit exclusions. Preview representative
source pages/read-only extraction while clarifying; do not build/publish a new pack
until the brief is frozen. A correction after freeze updates the brief and affected
acceptance tests; it is not ignored or treated as permission for unrelated work.

## Core experience and requirements

| ID | Requirement and observable acceptance |
|---|---|
| P01 | Discover by class/topic or class/week/day. Both routes resolve the same source record; no unnecessary subtopic/entrance gates |
| P02 | Cards have full meaningful titles, truthful summaries/material/resource signals, grade/week/day and explicit weekly-outline status |
| P03 | Ordinary opening starts at overview; a separate class-scoped last-opened action resumes. Reading/downloading never marks taught |
| P04 | Full lesson scrolls: preparation, actual native phases, notes and sources. All-loop chips jump, track reading, retain sticky class/day and list return |
| P05 | Integrated source-led cards combine coloured heading/time, original illustration, actual teacher actions and relevant questions/checks. Compactness never removes teaching content |
| P06 | Source wording, quantities, operators, thresholds, timings, diagrams and references remain faithful. Adaptation/uncertainty is visible; templates never receive fabricated daily activities |
| P07 | Images visibly enlarge; labels/speech bubbles survive; full source context and reliable Back/Forward/Escape/focus return remain available |
| P08 | Workbooks map by printed grade/week/task evidence. No-sheet plans have honest source-supported alternatives. Unknown/unavailable books/pages never masquerade as verified content |
| P09 | Printed-page identities remain consistent; relevant page is primary, full books secondary. Current-page file/print preview targets the viewed resource, not a default guide |
| P10 | My list, checked offline copy, portable page file, note and taught status are separate concepts with explicit actions/status/retry/removal/undo |
| P11 | Notes/bookmarks/taught/resume survive reload in the same browser; pack isolation and stale-tab note safety hold. Storage denial is disclosed, never falsely durable |
| P12 | Explicit offline preparation stores all required lesson/worksheet assets, verifies readiness and shows progress/failure. Updates preserve unchanged pages and shared pages survive selective removal |
| P13 | Hindi-first current UI plus English controls; source language remains explicit. Future language support is scoped and tested, not inferred from source metadata |
| P14 | Optional contextual help explains browser-local limits, files/offline/list, source errors and recovery. Notes export is readable, context reports omit private notes and do not auto-send |
| P15 | Cold-start import failure/stall offers static retry. Cached operation handles network throws and HTTP 5xx. Recovery never requires clearing teacher data |
| P16 | Phone layouts are readable at 360/390px and reflow ordinary text at 320px/200% lesson text. Keyboard focus is visible; touch controls comfortable; diagrams have meaningful equivalents or explicit review limits |
| P17 | Separate packs derive grades/resources from data and share runtime modules. Stable namespaces/IDs and legacy UP links remain; adding content must not fork the entire app |
| P18 | Authorized sources progress through immutable originals, unreviewed extraction, reviewed content and explicit publication with checksums/provenance and reproducible adapters |

## Priorities and exclusions

P0/release blockers: wrong critical teaching content or source mapping, teacher-data
loss, broken main navigation, required content unavailable without honest handling.
P1/core: P01–P18 for supported source scope, including recovery and usable mobile
reading. A source-specific unsupported schedule/language must be adapted or scoped
out explicitly before freeze. P2: optional enhancements justified by actual needs.

New product lines on the same content (chatbot, remedial-plan builder, print tools) are
not being built; the content repository is designed so they can be added later
([CONTENT_PLATFORM.md](CONTENT_PLATFORM.md)). Each would need the owner's approval and its own
brief, and keeps the exclusions below unless that brief changes them.

Not in the default scope: accounts/cloud sync, student records/mastery scoring,
AI-generated replacement curriculum, automatic full lesson translation, mandatory
tours, videos/gamification, public PDF upload portal, fully automatic academic
approval, or a framework/backend migration. The operator-assisted skill is not an
in-app upload-and-auto-publish feature. No collection of student personal data is
needed. No analytics service is required for baseline success measurement.

## Source, state and architecture contracts

One immutable delivery pack per source bundle; disjoint grade bundles share a
state × subject × edition group; its storage identity is permanent. Raw
PDFs/OCR stay out of the served/committed bundle. Reviewed records and source
images carry page provenance. Source-native structure overrides UP-specific layout
assumptions. UP's current namespace, lesson identities and image paths are durable.
[Pack contract](CURRICULUM_PACKS.md) and [content schema](../skills/teacher-guide-to-app/references/content-contract.md)
define concrete data fields. Shared domain/services/features/views are scoped to
an injected pack context; browser startup composes one active instance per page.

## Success measures and validation

Proposed product targets to validate with teachers, not claims of achieved results:

- After class selection, find/open a known topic lesson in two meaningful actions;
  measure task completion, wrong-lesson selection, time and requests for help.
- Teacher can identify class/day, full loop, next action and how to reverse it
  without coaching; test wording in the actual language/context.
- Required prepared lesson/source/worksheet opens during offline use; download
  status matches stored assets; upgrade does not lose prepared pages or notes.
- No P0/P1 defects in supported automated/browser acceptance journeys; record
  PASS/FAIL/LIMITED/NOT RUN and denominators, not a universal zero-bug claim.
- Critical source mapping/numeral/diagram review coverage is recorded explicitly;
  no independent academic sign-off inferred from automated test success.

Use automated catalog/resource/identity checks plus browser journeys, screenshots,
keyboard/locales, fault injection and previous-version upgrade tests. Real teacher
research, physical printers/devices/TalkBack, full independent academic review and
production transfer performance remain distinct evidence requirements. Define
study thresholds/sample with the operator before claiming field success.

## Evolution and change control

Current: UP source packs and shared offline-first teacher runtime; operator-assisted
new-pack workflow. Next: onboard actual additional PDFs through a frozen brief and
source-specific adapters. Later options (only when requested/validated): additional
schedule systems/UI languages, richer accessible diagram descriptions or sync.

Record product changes in the task brief; update PRD/contracts/tests together when
behavior changes. The PRD owns what/why, architecture owns module boundaries, pack
contracts own data, the skill owns execution, and tests/evidence establish what was
actually verified. Historical dialogue informs these documents but cannot override
the current user's agreed scope.

## Unified grade and subject expansion

[Curriculum expansion contract](CURRICULUM_EXPANSION.md) is authoritative for multi-grade/subject
UP growth: one state app with top Grade/Subject controls, Balvatika as level0,
metadata-derived valid pairs and disjoint immutable deliveries. New content must
not overwrite any previous published payload, image path or teacher-data identity.
Run all-delivery publication checks and the preservation baseline gate; never
reset the baseline to bypass a failure.

## Persistent identity and location

The selected grade/level and subject are prominent in a bold header and remain
pinned at the viewport top on every screen. A compact location line identifies
browsing week/topic/search, My list/Help, or lesson week/day/current section as
reading progresses. Source-native all-loop chips remain visible below it, with
measured offsets so anchors and keyboard focus are not hidden. Identity provides
a direct way to reach the selectors. Avoid duplicate sticky context rows. My list
and its offline collection are scoped to the selected grade/subject; other saved
records remain stored and accessible by selecting their grade.
