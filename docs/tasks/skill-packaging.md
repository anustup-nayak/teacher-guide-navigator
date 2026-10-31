# Package PDF-to-teacher-app workflow

Objective: preserve the available 30–31 October interaction history and turn the
source ingestion, app design and QA work into a portable repo-local skill.
Owner: one agent. Branch: none; this transferred checkout has no Git metadata.
Scope: skills/teacher-guide-to-app, AGENTS.md and README discovery links; this
note. App code/content and teacher storage remain unchanged by this task.

Plan (written before implementation):
1. Retrieve current-chat and Teacher Guide Mockup history; separate primary
   messages from script/document reconstruction and explicitly mark missing turns.
2. Write a concise SKILL.md with staged workflow and acceptance gates.
3. Add detailed ingestion/schema/design/QA/release/history references and templates.
4. Add a read-only preflight helper; expose package through AGENTS.md and README.
5. Validate links/frontmatter/helper; walk commands against isolated synthetic
   PDFs and run the existing app, syntax, ingestion and publication checks.
6. Record exact validation scope and remaining human review requirements.

Acceptance: another agent can start from authorized PDF paths, identify metadata,
use separated staging, select/adapt a parser, review against page images, register
an isolated pack, retain source visual/teaching structure and teacher data, run
both positive and failure-path QA, and deliver a reproducible handover without
claiming missing PDFs, unperformed tests or automatic production publication.
No new production pack, deployment or runtime-framework migration is authorized
by packaging this workflow.

History limits: the current chat is retrievable to its beginning. The earlier
Teacher Guide Mockup source returned only five final turns and reported no next
page; its original ingestion conversation is not exposed. Reconstruct those
mechanics from the transferred scripts and dated records; do not call it a full
verbatim transcript of unavailable messages.

## Execution result

Packaged the skill with six detailed reference guides plus the recovered
interaction record, three templates, UI metadata, preflight helper and helper
tests. AGENTS.md and README link the entrypoint for repo discovery. No application
code, published content, source images or teacher-storage keys changed.

History extraction: 18 retrieved turn records across the two relevant chats;
all returned user/assistant messages preserved with ambient/tool/internal items
omitted and local paths/source links redacted. Earlier unavailable ingestion
turns are reconstructed and labelled, not invented as verbatim dialogue.

Validation: bundled skill validator passes; instructional Markdown links resolve;
no unfinished entrypoint scaffold or machine-specific workspace paths in the
workflow references. Four preflight tests pass. Isolated synthetic guide/workbook
execution passes import idempotency, immutable-source checking, blank/raster-page
OCR flagging, unreviewed publication rejection, explicit byte-equal publication
and drift/tamper rejection. It does not validate an unseen adapter or publish a
new real curriculum. UP preflight passes reviewed/publication checks while
correctly warning that original PDFs were absent from the transfer.

Regression: 53 Node tests, 3 ingestion tests, syntax checks and all four UP
reviewed/publication byte matches pass. Source-faithful academic/diagram review,
real teachers/devices/printers and production delivery remain task-specific gates,
not claims made by validating this skill package.
