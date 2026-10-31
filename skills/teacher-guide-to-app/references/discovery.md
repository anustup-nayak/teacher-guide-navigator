# Conversational discovery and requirements freeze

Applies when starting a new PDF-to-app task, not when merely editing this skill.

## First response

If sources are not supplied, ask only:
“Please upload or point me to the Teacher Guide and Workbook PDFs you want to use.”
Use normal conversation for attachment requests; a text-only question tool cannot
accept an upload. Do not bundle a state/grade/year/features questionnaire into that
first request. If files/links are already present, acknowledge and inspect them;
do not ask the user to supply them again. An absent workbook is clarified as an
explicitly scoped exception, not fabricated or an endless requirement loop.

## Inspect, then ask grounded questions

Read the repository PRD/architecture and the actual documents. Make an inventory
of pages, text quality, covers/contents, schedules, phases, weekly outlines,
workbook tasks, diagrams, source languages, editions, references and missing files.
Read-only extraction/rendering during discovery is allowed. Be comprehensive in
document structure/content understanding; do not equate sampling with complete
academic proofreading. Record ambiguous pages and what further review is needed.

Explain back the source structure in plain language and ask 1–3 questions per
round only about unresolved choices that affect the app. Examples:

- “This guide uses units rather than weeks. Should teachers browse by unit as the
  primary route, with topic search as the alternative?”
- “The workbook supplied covers only these grades. Should the other grades retain
  their guide activities with a visible missing-workbook notice?”
- “Should the new curriculum be selectable alongside UP in the same app, or a
  separate deployment using the same shared runtime?”

Infer obvious metadata from covers; ask the user to resolve conflicts rather than
re-enter everything. Clarify audience/setting, desired differences, source/ UI
languages, browse routes, scope, offline/file/notes needs, visual fidelity and
local versus public delivery. Reuse established product defaults when appropriate,
but state material assumptions. Do not ask the teacher/operator implementation
questions they do not need to decide. Continue independent document inspection
while waiting for answers; do not implement dependent product choices prematurely.

## Freeze a concrete brief

Use [requirements template](../templates/requirements-brief.md). Include actual
source identities/coverage and what the user wants; separate source facts from
product choices, assumptions and unresolved issues. Confirm every material choice
is resolved or the user has accepted a stated default/limitation.

Summarize the concrete brief and ask for a single confirmation to build when it
has not already been agreed: “This is the app I will build from these documents.
Shall I freeze this brief and start?” This gate is required by this user-requested
workflow, not a blanket deployment approval or academic sign-off. Explicit “build
using these defaults” after the concrete summary is sufficient; do not ask again.
Silence/time elapsed is not agreement. While waiting, source inspection and
reversible planning can continue; new app implementation/publication waits.

Record agreed status, date, user confirmation and version in the brief. Preserve
source-review limitations honestly. Then execute the skill end to end, reporting
verified milestones and repairing observed failures. A later correction reopens
only the affected requirement/test; explain any scope consequences and update the
brief. Do not restart unrelated discovery or stop for routine implementation choices.

## Existing-work exception

For UI/content repair with a fully specified request, use the existing PRD and
accepted task requirements; do not demand fresh PDF upload or a ceremonial freeze.
For a new pack where sources and a concrete accepted brief already exist, resume
from that state. The current product/skill/architecture work is already authorized
and should not trigger a request for new PDFs.

For UP expansion, explicitly discuss which new grade/subject pairs the supplied
PDFs cover and how they join the existing state app. Freeze an additive availability
matrix; do not treat a new subject as replacing the previous one or a new grade as
permission to regenerate earlier content. Consult docs/CURRICULUM_EXPANSION.md.
