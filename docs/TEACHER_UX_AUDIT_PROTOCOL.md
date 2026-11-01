# Sandarshika — teacher-centred UI/UX audit protocol

Next iteration after the production release. Owner requested a thorough audit of every workflow for teachers with low digital confidence, limited understanding of structured pedagogy, and low motivation to use the TG. This extends UI_DESIGN_NEXT_ITERATION.md; it is not a completed audit or approval to change the design.

## Source and archetype fidelity

The earlier review is referenced in docs/UX_REVIEW_2026-11.md. Its full screenshots and teacher archetypes are in the owner's Claude artifact: https://claude.ai/artifact/7SFoVEEQGDYgdgQn8d9QJ2. Repository evidence establishes the two intended behaviours: follow the year/week/day learning sequence and follow the lesson's teaching steps in order. It also records that teachers may avoid the TG or lift one isolated activity.

The artifact requires Claude sign-in; the exact archetype names/profiles have not yet been retrieved. Recover those original profiles before claiming an archetype-complete audit. Do not invent names or claim an AI simulation represents observed teachers. The profile specified directly by the owner is the primary stress case; original archetypes should add differentiated needs rather than assume every teacher has identical difficulties.

## Audit method

For every task, walk through as a first-time or returning teacher without expert knowledge, verbal hints, hidden controls, route guessing or prior knowledge of the TG. Record:

1. Does the teacher recognise what to do and why it helps right now?
2. Is the correct next action visible and understandable in their language?
3. Does the label predict what happens, including what will be saved or changed?
4. Is the result clear, and can the teacher locate themselves and recover?
5. Can the teacher explain the next classroom action without knowing technical pedagogy terms?
6. What would make a reluctant, busy teacher stop, skip steps or lift an isolated activity?

Use unassisted first attempts before testing help. Record wrong turns, backtracking, abandonment, accidental actions and recovery as findings. Do not treat fast expert navigation, lack of console errors or a passing automated test as evidence that a novice teacher succeeds.

## Exhaustive workflow inventory

Build a route × control × state × transition registry from the released app. Every discoverable workflow must map to a scenario below, with direct links to any additional scenarios required by the inventory. Mark not applicable or not tested explicitly; do not silently omit hidden options, template days, empty states or failure paths.

| Journey | Tasks and variants | Evidence required |
|---|---|---|
| First use | Open an unfamiliar link; identify grade/subject/day; discover Today, year and all-lessons paths; find help without mandatory onboarding | First-click prediction, task outcome, errors, time, teacher explanation |
| Before class | Find intended week/day by topic, search and calendar; check objective, materials and prerequisites; understand today's whole plan | Correct lesson identity; explain plan and preparation in own words |
| In class | Move from smart card to detailed step; model, guide and allow independent practice where the source specifies it; ask questions; see support conditions; return to overview | Correct teacher/child actions, source anchors and sequence; detect summary omissions or misleading emphasis |
| Resources | Open workbook, guide, illustration and full book; enlarge/zoom; close with visible control, Back and Escape; find printed page; print current page | Correct resource/page; readable content; retained lesson/step/focus; honest unavailable-resource handling |
| Notes and saved list | Create/edit/save/reopen note; bookmark/unbookmark; distinguish saved list from offline download and taught status | Persistent correct lesson note; understandable feedback; no wrong expectations about cloud sync |
| Completion | Mark taught, undo and return; distinguish reading from teaching; inspect next lesson recommendation | No accidental completion; correct next lesson and grade/subject; comprehension of device-only progress |
| Continuity | Switch day/week/grade/subject; resume after another lesson was inspected; recover from wrong selection; skip missed school day; browser Back/Forward; old deep link | Correct context at every transition; reversible choices; no false recommendation presented as official calendar truth |
| Whole year | Locate learning goal and sequence; understand where this lesson fits; move to prior/next concept without choosing at random | Explain what builds on what; reach correct lesson; separate learning progress from taught marks |
| School readiness and exceptions | G1 weeks 1–8, revision, assessment, Math weekly templates, Hindi combined periods, no-image/no-workbook days | Day type understood; no invented teaching stages or false resource promise |
| Connectivity and updates | First visit on poor network; slow/missing image; prepare offline; progress/retry; reopen offline; update old installation; remove download shared with another lesson | Honest readiness and retry; available lesson works; unchanged downloaded assets and teacher data survive |
| Accessibility | Hindi/English, long titles, Devanagari rendering, large text, keyboard, focus, screen reader, touch and one-handed use | Readable hierarchy; no clipping; controls findable and named; no hover-only essentials |
| Recovery and trust | Unknown route, missing lesson, import failure, denied/full storage, stale tab, interrupted save, accidental taps and report-error/export | Useful explanation and next action; no false success, silent loss or need to clear teacher data |
| Return over time | Next morning after a missed/partial lesson; repeated prompts; interrupted class; low motivation | Resume context makes sense; prompt fatigue and unnecessary effort documented; no coercive or misleading progress incentives |

## Pedagogical usefulness checks

Evaluate horizontal and vertical following independently. A teacher should be able to identify the intended lesson in the sequence and explain its native teaching steps, not merely open a page. Use teach-back prompts tied to the selected real lesson:

- What will you do first, and what will children do?
- What happens next, and why would skipping it matter for this activity?
- What example, question, timing or material do you need?
- How will you notice children need support, and what does the source tell you to do?
- Which next lesson follows, and what does it build on?

Assess whether card summaries improve understanding or encourage reading only an isolated attractive activity. Compare card-only interpretation with the full instructions. Flag omitted conditions, misleading verbs, vague summaries, inconsistent numbers/pages and actions that are hard to translate into classroom practice. Never invent pedagogy or assume a standard GRR structure where the source uses another format.

## Realistic conditions

Cover Math/Hindi and Grades 1–3, both languages, short/long lessons and every day type. Review at 320/360/390px and tablet/desktop, 200% text, low-end phone performance, intermittent connection, glare/low contrast, limited attention, noise, interruptions and little preparation time. Use real devices and teachers where available; flag simulated conditions accurately. Include accessibility expertise and actual assistive-technology use rather than claiming a DOM check proves TalkBack usability.

## Scoring and issue evidence

For every scenario and archetype record: pass unassisted / pass with help / wrong outcome / abandoned / not tested; elapsed time and taps; wrong turns; explanation accuracy; confidence; observed confusion; recovery; screenshot/video reference; release/device/language/network state. Keep comments and timestamps free of private teacher/student data.

Severity: critical = data loss, misleading teaching action or blocked core teaching journey; major = repeated confusion, wrong lesson, severe reading/discovery/recovery barrier; moderate = extra effort or inconsistency; minor = polish. Keep pedagogical severity distinct from software severity. Do not average away a critical failure in one archetype behind good results in others.

AI/expert walkthrough findings are hypotheses or observed interface defects. A human study is a separate evidence layer. Recruit teachers matching the recovered archetypes, use neutral scenario prompts without coaching, collect consent, and record assistance verbatim. Set task-time and success targets before those sessions using the baseline/pilot and explain sample uncertainty; do not invent a success percentage without a study design.

## Completion gates and deliverables

- All workflows and significant states/transitions inventoried and mapped; coverage gaps explicit.
- Critical paths tested unassisted with the intended teacher profiles; failed or assisted outcomes reported honestly.
- No unresolved critical or major defect in an agreed core journey before calling that journey ready.
- Content/teaching comprehension assessed alongside interaction success.
- Findings carry reproducible evidence, impact, priority, recommendation and retest method.
- UI findings feed the canonical design specification, token/component system and real-content reference screens.
- Proposed changes reviewed with the owner before protected design changes or implementation.
- Retest fixes and adjacent journeys; preserve content fidelity, routes, offline behaviour and teacher data.

Deliver: archetype/source record, workflow coverage matrix, cognitive walkthroughs, human study plan/results (or an explicit untested gap), annotated issue register, prioritised redesign backlog, design-spec requirements and regression/retest plan. The goal is a rigorous, traceable audit; no audit can guarantee an interface is literally bulletproof for every teacher and situation.
