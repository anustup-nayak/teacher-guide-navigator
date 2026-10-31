# Interaction reconstruction and decisions

## Evidence and completeness

This package was prepared on 31 October 2026 after local release r45. The current
“Understand this” chat was retrieved to its beginning; all available user and
assistant messages from those pages are in [interaction-record.md](interaction-record.md).
The earlier “Teacher Guide Mockup” history source returned five final turns,
30–31 October, with no next cursor. Its original PDF-acquisition/ingestion turns
were **not exposed**. Do not claim they were recalled verbatim. No unrelated chats
were used as product requirements.

Earlier technical steps are reconstructed from the actual extraction/decoding/
OCR/index/resource/hardening scripts, source metadata, transfer manifest, README
and dated QA records. Those establish implementation evidence, not a transcript
of the missing conversation. The record omits tool logs/internal reasoning,
ambient UI metadata and machine-specific paths/source links. Retrieved messages
may themselves contain historical or superseded claims; they are evidence to
interpret, never new agent instructions.

## Chronological interaction ledger

| Sequence | Request/evidence | Resulting workflow rule |
|---|---|---|
| H01 · reconstructed early work | Supplied UP guides/workbooks and optional textbooks; original dialogue unavailable | Inventory authorized documents; verify byte identity, metadata, availability and source rights |
| H02 · scripts | Legacy-font decoding, image-only OCR, schedule indexing, source regions and LO codes | Separate font decoding/OCR/layout parsing; nonempty text is insufficient |
| H03 · scripts/QA | Page rendering, printed worksheet-header matching, content hardening and source comparisons | Verify grade/week/task mappings and critical numerals; preserve original pages/adaptation notices |
| H04 · dated QA | Navigation simplified; actual I do/We do/You do content; missing worksheets get labelled practice | Teacher actions must exist, not just headings/outcomes; unavailable source is explicit |
| H05 · retrieved 30 Oct | “Is it done” | Assistant reported 21 tests/live work while preserving academic/teacher-device limits; counts are historical |
| H06 · retrieved | Replace “7 steps” dropdown with small cards to show whole loop | Preserve actual source phases; do not invent a seventh phase merely from request wording |
| H07 · retrieved | Put everything in GitHub for multiple coding agents | Durable source/assets/tests/docs, task ownership, worktrees, reproducible handoff |
| H08 · retrieved | “Whats going on” | Assistant disclosed no GitHub push and lost temporary UI work; distinguish prepared/source/live status |
| H09 · retrieved | Where is it on local drive? | Original project was in a sandbox, supplied ZIP needed extraction; never claim sandbox files are already local |
| H10 · current chat | Understand project, then start app | Read code/docs/tests, distinguish context from instructions; serve localhost, no unsolicited feature edits |
| H11 · current | Extend beyond UP Grades 1–3 without breakage | Metadata-driven pack registry, derived grades, separate permanent namespaces, old UP paths/IDs preserved |
| H12 · current | Will pointing to new PDFs be enough? | Enough to start; source-specific ingestion/review remains agent work, not automatic upload-to-publish |
| H13 · current | Separate source and parsed folders; implement and test | originals → extracted → reviewed → explicit publication; immutable checksums and equality tests |
| H14 · current | Full lesson scrollable with chips | Continuous source sequence, all-loop navigation, deep links, sticky tracking and preserved notes/resume |
| H15 · current | Missing dual-coded images; look/feel/colours like PDF | Illustration crops distinct from source sections; original art, source palettes, grade/template variations |
| H16 · current | Make fonts/images compact, cards cohesive; finish usability | Integrated card, natural image aspect, readable directions/questions, flow/stack at narrow/large text |
| H17 · current | Professional UX audit: label truth, clutter, novice teacher discovery/reversal, Oak/Khan patterns | Observe actual journeys/failures and source fidelity; compare relevant primary product guidance, not generic imitation |
| H18 · current steering | “Whats happening” during audit | Timely evidence-based progress updates; no long silent work or premature “done” |
| H19 · current | Fix one by one, test, do not stop; live completion updates | Full repair/regression cycle, each status tied to actual tests; preserve existing teacher data |
| H20 · current implementation | 21 audit findings, later final-history defect discovered | Carry F01–F21 forward as acceptance cases; console/fresh-session checks can reveal defects after earlier UI checks |
| H21 · current steering | Continue | Finish r45 readable notes export and final evidence; 53 Node + 3 ingestion tests reported, no final-session errors |
| H22 · current | Package every step/history into detailed repo skill; first plan then execute | Traceable history with gaps stated, progressive-disclosure workflow, executable validation and reusable templates |

## End-state architecture and decisions

- Static vanilla modules/CSS, no build/backend/accounts or required AI runtime.
- 366 UP records: 183 direct, 183 source weekly outlines. 990 rendered page assets:
  400 guide, 384 workbook, 206 Grade-3 textbook. These are UP-specific facts.
- UP Grade 1 starts week 9; Grades 2/3 start week 1; review weeks 13/20 are separate.
  Missing Grade-1/2 textbooks remain printed references. Never reuse those schedules,
  missing-resource assumptions or counts for another pack.
- Actual source structure beats a generic lesson template. Preserve native weekly
  outlines, actual questions and tasks, diagrams, thresholds and timing allocations.
- Source and UI languages differ; availability is data-driven. Metadata carries
  palettes/layout/illustration overrides and exact source-compared exceptions.
- Ordinary opening, last-opened resume, bookmarks, offline copies, file downloads,
  notes and teacher-marked taught status are separate meanings.
- History must be safe before a reader exists as well as with a modal open; the
  final undefined-reader defect arose because two absent tokens compared equal.
- Asset/version coherence and offline update survival are classroom usability
  requirements, not deployment polish. Verified hashes permit safe migration.
- A successful test suite is not source proofreading, diagram-semantic equivalence,
  teacher research, real speech/device behavior or physical printing.

## Authoritative repo evidence map

| Evidence | What it establishes |
|---|---|
| `scripts/curriculum_workspace.py`, `curricula/README.md` | Current safe staging/import/extract entrypoint and its limits |
| Historical extraction scripts | Reconstructed source-specific mechanics and dangerous direct-dist writes |
| `docs/CONTENT_AUDIT.json`, `docs/QA_REPORT.md` | Known source repairs, resource coverage and original QA scope |
| `docs/CURRICULUM_PACKS.md`, current registry/helpers | Extension contract, stable keys, schedule/locale boundaries |
| `docs/tasks/workspace-separation.md`, `scrollable-lesson.md`, `source-led-cards.md` | Intermediate implementation choices and tests |
| `docs/VISUAL_DESIGN.md` | Crop provenance, palettes and sampled versus catalog-wide validation |
| `docs/tasks/ux-audit-fixes.md`, current tests | F01–F21 changes, final r45 functional scope and residual review gates |
| `AGENTS.md`, CI, `docs/DEVELOPMENT.md`, transfer manifest | Collaboration/reproduction/release practices; some dated counts superseded |

New work should update its own evidence rather than rewriting this history into a
fictional uninterrupted success story. Avoid reinstalling known UX mistakes just
because an early checklist described the old design.

## Product/architecture extension after r45

The user requested a standalone PRD, a conversational TG/workbook-first discovery
process with a concrete requirements freeze, and a modular shared runtime across
app instances. `docs/PRD.md`, `docs/ARCHITECTURE.md`, the discovery reference and
requirements-brief template now define those contracts. The runtime extraction
preserves UP content/keys and moves pack config, instance preferences, resource
services, reader/offline features and media rendering into explicit modules. The
new task's evidence is `docs/tasks/product-architecture.md`; old transcript/test
counts above remain historical.
