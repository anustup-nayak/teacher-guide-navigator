# Agent handoff log

This file lets any coding agent (Claude Code, Codex or another) continue work
that a previous agent started, including when that agent ran out of tokens
mid-task. It is the first file to read and the last file to update.

## Protocol

1. **Read first.** Read this file, then [AGENTS.md](../AGENTS.md) and the
   [design contract](DESIGN_CONTRACT.md), before editing anything.
2. **Claim before working.** Add a row to *Active work* with your agent name,
   branch, owned files and status `in progress`. Do not edit files another
   active row owns.
3. **Write as you go.** After each meaningful step (a file group written, a
   check run, a decision made), update your *Active work* row's "Last step /
   next step" cell. Assume you can be cut off at any moment: the next agent
   must be able to continue from this file and your task note alone.
4. **Log when done.** Add a *Change log* entry at the top of that section,
   move your row out of *Active work*, and refresh *Current state* if the
   facts changed. Never delete or rewrite older log entries; correct them with
   a new entry.
5. **Keep detail elsewhere.** Long evidence belongs in the task note under
   `docs/tasks/`; log entries link to it. Never record credentials, signed
   URLs, private email or student data here.
6. **Picking up someone else's task.** Read their task note and row, run
   `git status` and `git log` on their branch, rerun the checks it names, and
   then continue. Record the takeover in the row ("taken over by … from …").
7. **Protected design.** Never change the look, feel or flow defined in
   [DESIGN_CONTRACT.md](DESIGN_CONTRACT.md) without the owner's explicit
   approval in chat. `npm test` fails when a protected file changes without a
   recorded approval.

## Current state

*Update this section when the facts change; it is not a log.*

| Item | Value |
|---|---|
| Live app | https://anustup-nayak.github.io/teacher-guide-navigator/ (deployed from `main` by `.github/workflows/pages.yml`); v2 r69 / content 1.3.3 deployed from `main` at `edd31db` on 1 Nov 2026 |
| Repository | github.com/anustup-nayak/teacher-guide-navigator (public). Branches: `main` (production), `release/v1` (frozen at v1.0.4), `next` (v2 integration) — see [VERSIONING.md](VERSIONING.md) |
| v1 release | r61 @ `49f873c`, tag `v1.0.4`; `release/v1` stays there for rollback |
| v2 line | Content releases up to 1.3.3 (pinned in `content/website.json`); आज home, पूरा साल guide, goals, chains, and 549 owner-approved smart cards (183 Math, 366 Hindi); release token r69. Live on `main` at `edd31db`, tag `v2.0.0`; frozen r61 at `/v1/` |
| Published content | UP Mathematics `up-math-2026` and UP Hindi `up-hindi-2026`, Grades 1–3: 366 day plans each; 990 + 972 page images |
| Teacher-data namespaces | Math `up-sandarshika-2026-v1`, Hindi `up-hindi-sandarshika-2026-v1` (permanent) |
| Checks | See [DEVELOPMENT.md](DEVELOPMENT.md#checks); last full run 1 Nov 2026 (r69): npm test 137/137, ingestion 16, skill helpers 5/5, all verify gates pass, cards check 549/549, Playwright UI sweep 0 failures |
| Design lock | `docs/design-lock.json`; see [design contract](DESIGN_CONTRACT.md) |
| Known open checks | Independent academic review, real teachers, physical phones/TalkBack, physical printing |
| Other agents' work | Codex worktree `…/Codex/2026-10-31/un/work/metadata-worktree` on `task/query-backed-runtime` has uncommitted work, not on GitHub; owner said leave it untouched |

## Next up

Production cutover is complete: PR #30, `edd31db`, tag `v2.0.0`; [Pages deployment](https://github.com/anustup-nayak/teacher-guide-navigator/actions/runs/41279200254) succeeded and live root/fallback were verified. The next iteration is the owner's requested professional [UI review and design specification](UI_DESIGN_NEXT_ITERATION.md), with the [teacher-archetype UX protocol](TEACHER_UX_AUDIT_PROTOCOL.md). Review first; implement only after agreeing the design direction. Recover the original Claude archetypes; do not substitute invented profiles. Day-5 counts and usage counts remain deferred; independent academic review, physical-device/TalkBack and teacher field tests remain open.

## Active work

| Agent | Branch | Owned files | Status | Last step / next step |
|---|---|---|---|---|
| Claude Code | `task/production-polish` | see [task note](tasks/production-polish-r70.md) | In progress | Audit done ([AUDIT_2026-11-PRODUCTION.md](AUDIT_2026-11-PRODUCTION.md)); executing T1–T6. |
| Codex | `task/query-backed-runtime` (local worktree only) | unknown | Paused | Other agent's uncommitted work; do not touch. |

## Change log

### 2026-11-01 · Codex · post-cutover documentation consistency

- Corrected current agent rules, branch/release flow, documentation map, architecture/compiler/platform status, Hindi source-archive status and reusable release instructions after the v2 cutover. Marked older plans and approval questions as historical rather than current deployment instructions.
- Engineering documentation is kept in the repository; both public root and `/v1/` publish website files only. Frozen v1 content is intentionally unchanged. No runtime, model, immutable release or source asset changed. [Task record](tasks/docs-post-cutover.md).

### 2026-11-01 · Codex · verified v2 production release

- Merged owner-approved PR #30 to `main` as `edd31db543ef9eceee39e97f69d5bd3f7cc6bbda`; tagged `v2.0.0`. Pages run `41279200254` and Checks run `41279200249` both succeeded.
- Verified live index/app/worker/card module byte-for-byte against r69, 549 approved cards, frozen v1.0.4 app at `/v1/` and isolated fallback worker cache namespace. Browser smoke: Hindi 360px and English 390px, card → detailed step focus, loaded workbook reader and return, no overflow/console errors. A reversible v1 note survived the upgrade; original note restored.
- Full validation: 137 Node tests, 16 ingestion tests, 5 skill helpers, 549-card checker and renderer sweep, program/content/site/publication/complete-source checks. Physical devices, TalkBack, teachers and independent academic review remain unverified.
- Saved the owner's next-iteration UI/UX brief and teacher-archetype audit protocol; no redesign implemented. [Release evidence](tasks/cards-production-finish.md).

### 2026-11-01 · Codex · production handover from Claude Code

- Verified PR #27 was open despite the preceding entry claiming it had cut over. Merged its green, approved head `7c9e7ad` into `next` as `615f907`; no production deployment had occurred at that point. Earlier entries are retained as historical records, corrected by this entry.
- Completing the authorized cutover with a frozen v1.0.4 `/v1/` artifact and the full v2 validation gate in Pages. Cleanup preserves immutable releases, decision mockups and other agents' worktrees. Evidence: [task note](tasks/cards-production-finish.md).

### 2026-11-01 · Claude Code · `task/cards-all-drafts` (all cards live; content 1.3.3, r69; v2 cutover)

- Owner, chat: “Yes approve everything. Publish and run all UI, UX, content tests, cleanup unnecessary files and
  make it clean production ready.” `approve` Hindi G1 (90), G2 (138), G3 (138); release 1.3.3 (previous 1.3.2),
  pinned; `dist/lesson-cards.mjs` carries 549 cards; `release:assets r69`.
- Checks: `npm test` 136 pass; `check`, `verify:program`, `verify:content`, `verify:publication`, `verify:site`,
  `verify:sources` pass; ingestion 16 OK; skill tests OK; `cards.mjs check` 549/549; sw.js syntax ok.
  Playwright sweep: 17 routes × {360, 390 px} × {हिन्दी, English} with no overflow, no console errors and card
  touch targets ≥ 44 px; all 549 cards render with the right line count; legacy `#/`, `#/unknown`, `teach/N` links
  resolve; first Tab is the skip link; Enter on the start button opens the teach view; offline reload via the
  service worker shows the lesson card; storage keys unchanged.
- Cleanup: removed the six empty draft files and the superseded mockup generator (`gen.py`, `style.css`,
  `cards-draft.json`, crops, preview); kept option A/B mockups as the decision record. Earlier content releases
  stay (immutable publication record).
- Integration: Codex's PR #26 (15 Hindi G1 cards, release 1.3.2, r68) reached `next` meanwhile. Kept its
  published 1.3.2 unchanged and its 15 hand-written cards in place of my drafts for w09–w11; rebuilt my release as
  1.3.3 (previous 1.3.2) with all 549 cards, r69. My earlier, never-merged “1.3.2 Math” build was discarded.
- Cutover: owner asked to publish to production; `next` merged into `main` by PR per VERSIONING.md (v1 stays at
  `v1.0.4` on `release/v1`). `/v1/` copy not built; rollback = revert the cutover merge.

### 2026-11-01 · Claude Code · `task/cards-all-drafts` (all Math cards approved; release later renumbered to 1.3.3, see above)

- Owner chose option 1 in chat: approve all Math now; rework Hindi period lines by hand first. `approve` for Math
  G1 (45), G2 (53), G3 (69); 183 Math cards in `model/`. Content release 1.3.2 (previous 1.3.1), pinned;
  `site:publish` → `dist/lesson-cards.mjs` carries 183 Math cards, no Hindi. `release:assets r68`.
- Checks: `npm test` 136 pass; `check`, `verify:program`, `verify:content`, `verify:publication` pass; sw.js syntax ok.
- Hindi rework: `draft` now builds each period line from whole instructions only (verb-ending clauses, balanced
  quotes/brackets, no questions or pronoun starts), ranked for lesson-specific content; a step with no such clause
  keeps only its title in `steps`. One line hand-fixed (G2 w03 d2). `check` 549/549.
- Left: owner approval of Hindi → release 1.3.3; then ask the owner about `next` → `main`.

### 2026-11-01 · Claude Code · `task/cards-all-drafts` (all remaining cards drafted)

- Owner: “Complete all cards – dont stop”. Math G3 w01–w05 hand-written from the full lesson text. Every other
  lesson drafted by the new `cards.mjs draft` command: lines are whole short sentences from the guide's own steps
  (clause-aware clipping, no dangling postpositions; numbers and quoted names must occur in the source). Two
  OCR-damaged Math G1 lines hand-fixed (w11 d1, w23 d3).
- Checks: `cards.mjs check` 549 cards, 0 problems; `npm test` pass; `verify:content` unchanged (drafts are not
  compiler input). Review sheets for all six pack·grades in `docs/review/cards/`.
- Left: owner approval (bulk or per grade). Then `approve` → release 1.3.2 → pin → `site:publish` →
  `release:assets r68` → full checks → merge. Then ask the owner about `next` → `main` (go live).
### 2026-11-01 · Codex · Hindi cards H1, PR #26 (r68)

- Drafted and source-compared 15 Grade 1 Hindi cards (w09 d01–w11 d03); owner approved in chat (“Go ahead”) and requested completion. Only these 15 moved to model; w14 sample stays unreviewed.
- Built immutable release 1.3.2 after 1.3.1, pinned website/check together, published generated modules and coordinated r68. Existing Math approvals preserved. Next remains the integration target; no main deployment.
- Checks and remaining limits: see [task note](tasks/cards-hindi-g1-a.md).


### 2026-11-01 · Claude Code · `task/cards-release-1` (first cards live on `next`, r67)

- Owner approved batch M1 (“Go Ahead”, chat, 1 Nov 2026) after reviewing the 16 rendered Math G2 cards (w01–w05 and
  w14 d1). `cards.mjs approve` moved them to `curricula/up-math-2026/model/cards/g2.json`; content release 1.3.1
  (previous 1.3.0), website pinned to it, `dist/lesson-cards.mjs` now carries 16 cards. Release tokens r67.
- Checks: `npm test`, `check`, `verify:site`, `verify:content`, `verify:program`, `verify:publication`, `design:check`.
- Next: Math G3 batch (Claude Code); Hindi batches (Codex, SMART_CARDS.md §8).

### 2026-11-01 · Claude Code · `task/smart-cards` (r66, smart-card component and workbench)

- Owner decisions (chat, 1 Nov 2026): layout A (`steps`) for Math, B (`periods`) for Hindi; card first, step chips
  below; Hindi image = top of the workbook page, none when absent; `next` → `main` after cards. **Design approval
  recorded** (guide-cards.css) and contract §4 amended.
- Built: `dist/views/smart-card.mjs` and `smartCard()` in `app.mjs` (shown only when an owner-approved card exists);
  `cards.schema.json`, compiler `card` entity (schema 1.3.0), content release 1.3.0 (no approved cards yet, so
  `dist/lesson-cards.mjs` is empty), `publish_site` card module, `scripts/content/cards.mjs` (scaffold, source, check,
  sheet, approve). Drafts live in `curricula/<pack>/drafts/cards/` so editing them never breaks the immutable
  release check; `approve` moves cards to `model/cards/`, then the integrator builds a release.
- Checks: `npm test` 136/136 (new `tests/smart-cards.test.mjs`), `check`, `verify:site`, `verify:content`. Browser
  with a temporary local approval (not committed): Math and Hindi cards at 320/360/390 px, Hindi and English, line
  taps jump to the step, no overflow or errors.
- Next: Math batch M1 (Claude Code) and Hindi batch H1 (Codex) in parallel; see SMART_CARDS.md §8 and §10.

### 2026-11-01 · Claude Code · `task/today-home` (r65, UX review changes)

- Owner reviewed the [UX review](UX_REVIEW_2026-11.md) and asked to “work all the other enhancements other than smart
  cards” (chat, 1 Nov 2026); header tabs approved in the review doc. **Design approval recorded** in
  `docs/design-lock.json` (guide-cards.css, index.html) and the [design contract](DESIGN_CONTRACT.md) (§1–4 amended).
- Built: `#/today` आज home as the default route (next lesson in order from the device's taught marks, “did you
  teach it?” prompt, this week's days, goal line with position, school-readiness note for weeks 1–8); header tabs
  आज · पूरा साल · सभी पाठ; grade/subject controls behind the context chip; lesson banner goal and position, previous/
  next line, “पाठ के विकल्प” fold; end-of-lesson goal progress and next link; year view words before codes, legend,
  teacher position; school readiness as a week option. New storage keys only (`-opened-by-grade`,
  `-taught-prompt`); no existing key changed. Release tokens r65.
- Checks: `npm test` 132/132 (new `tests/today.test.mjs`), `check`, `verify:site`, `verify:content`, `design:check`.
  Browser at 320/360/390 px, Hindi and English: no overflow, no console errors; prompt, mark-taught, next and
  grade switch flows exercised. Not done: real phones, TalkBack.
- Smart cards: two layouts drafted on four real lessons, spec and handoff in [SMART_CARDS.md](SMART_CARDS.md).

### 2026-10-31 · Claude Code · `task/math-goals` (program guide slice G-Math)

- Owner approved [review/math-goal-titles.md](review/math-goal-titles.md) (“Approve both”): titles and the
  `same-week-template-days` rule. Model: `curricula/up-math-2026/model/outcomes.json` (42 outcomes with the guide's
  statements, 23 goals with owner-approved titles); lessons gain 182 stated links (incl. two codes v1 missed,
  checked on the page images: G1 w9 d2 and G2 w1 d2 print M101.1; G1 w23 d3 prints none) and 327 rule links on days
  4–6. Schema 1.2.0 adds the `goal` entity kind; content release 1.2.0 (previous 1.1.0); website pinned to it.
- App: `#/guide/goals` (goal cards with year strips, lesson counts, “आपने N पढ़ाए” from the device's taught marks),
  `#/guide/goal/<id>` (the guide's statements, how the guide gets there, “अगला पाठ”, week rows with day buttons and
  lesson titles), goals first on the guide home, and lesson goal chips (`dist/lesson-goals.mjs`). Hindi shows the
  NIPUN list until its goal-to-week map is approved. Design approval recorded (guide-cards.css). Release tokens r64.
- Browser (fresh origin, 320/360 px, Hindi and English): Math G2/G3 goals and detail, mixed-week chips, next-lesson
  and taught loop (test mark undone), missing goal, Hindi fallback; no overflow or console errors.
- v1 follow-up: the two printed codes v1 missed (G1 w9 d2, G2 w1 d2) can be repaired on `main` (lesson card shows
  “स्रोत में कोड नहीं दिया है” today).

### 2026-10-31 · Claude Code · `task/math-goal-titles` (draft for approval)

- Drafted [review/math-goal-titles.md](review/math-goal-titles.md): one goal per printed code family (G1 6,
  G2 8 incl. Class 1 review, G3 9 incl. Class 2 review), short Hindi and English titles written only from the
  guide's statements, the weeks and teaching days each is stated on, and the verbatim statements. Also the
  “same week” rule (days 4–6 link to the week's day 1–3 goals): all 183 template days, 18 mixed weeks.
  Flagged three teaching days without a printed code for a page check.
- iCloud made a third round of copies (43 files incl. `.git/index 2`), all identical or empty except an older
  `docs/README 2.md`; moved to `../teacher-guide-navigator-duplicates-2026-10-31b/round3/`. The docs test
  caught them.

### 2026-10-31 · Claude Code · `task/program-guide-a` (program guide slice A)

- Owner approved [PROGRAM_GUIDE_DESIGN.md](PROGRAM_GUIDE_DESIGN.md) revision 2 (“Approve and build A”); recorded in
  `docs/design-lock.json` (guide-cards.css) and the design contract (§1 routes, §3 entry links).
- Built: `#/guide` home (goals box opening the NIPUN list until slice G; how-the-guide-works cards),
  `#/guide/week` (six day tiles opening that week's lessons, day types with periods/slots, 25-week year strip,
  revision-week guidance), `#/guide/periods`, `#/guide/pages` (every guide section's original pages).
  Entry points: find-page card, lesson link under the chips (with the day label), Help line. Data
  `dist/program-guide-data.mjs` generated by `site:publish` from release 1.1.0; the view and data load on demand
  and are in the offline shell. Release tokens r63.
- Browser (fresh origin, 320/360 px, Hindi and English): Hindi G2, Math G1 and G3 (sequence days), lesson and
  Help links, reader opens guide pages and returns, no overflow or console errors. Tests:
  `tests/program-guide.test.mjs`. Full gate in the PR.

### 2026-10-31 · Claude Code · `task/program-metadata-layout` (took over PR #17 from Codex; docs cleanup; program-guide design)

- Owner asked to clean up local and GitHub documentation and skills, and to plan the program guide
  (TG front matter in the app) for design approval first. Codex's open PR #17 already rewrote the
  skill, README/AGENTS and layout docs but conflicted with `next`; owner chose to take it over.
  Merged `next` by three-way merging each conflict against `bcd106e`; rebuilt release 1.1.0 on 1.0.1
  (unpublished, so rebuildable); website and `verify:content` pin 1.1.0.
- Cleanup: new concise README and DEVELOPMENT guides (old text kept verbatim in `docs/history/`);
  `docs/README.md` documentation map; MVP acceptance, first QA report, transfer manifest and old
  image moved to `docs/history/`; stale status lines fixed (architecture, design contract, plan);
  HANDOFF current state refreshed and active work trimmed to open items; task index with outcomes;
  skill gains today's lessons (day-type audit, column-aware regions, bare vowel signs, website
  pinning, release tokens on `next`, sync copies); placeholder links in the skill's history record
  fixed. New `tests/docs.test.mjs`: every relative doc/skill link resolves and no `… 2.*` sync copies.
  It immediately caught three more iCloud copies, moved to the duplicates folder.
- Program guide (revision 2 after owner feedback: the year's learning goals first, each with its
  week-by-week path and deep links to lessons): [PROGRAM_GUIDE_DESIGN.md](PROGRAM_GUIDE_DESIGN.md) and seven phone mockups in
  `docs/design/program-guide/` (built with the app's own CSS). Awaiting owner approval; nothing built.
- Checks: npm test 121/121, verify:program, verify:content, verify:site, check, design lock,
  publication, ingestion 16, sources, skill tests, diff check. Not done: deleting the merged remote
  branch `task/content-compiler` (blocked by a safety check; owner can delete it on GitHub).

### 2026-10-31 · Claude Code · `task/week-cards` (PR to `next`)

- Owner noticed Hindi and Math week views rendered differently. Causes: the card summary
  concatenated every material and prep note (Hindi lists one per period, so its workbook page
  was cut off), and only Math weekly templates were marked, so Hindi revision/assessment days
  looked like teaching days. Owner approved one rule for both (design contract §3 updated):
  workbook page first, then the first material; the top line names the day type on non-teaching
  days. Labels come from `dist/day-types.mjs`, generated from the pinned release's structure.
- No CSS/protected-file change. Release tokens bumped to r62 on `next` (the browser's HTTP cache
  kept r61 modules otherwise). Browser: Hindi G1/G2 and Math G2 weeks at 360/390 px, Hindi and
  English, no overflow or console errors.
- iCloud sync again left copies (`lessons/1 2.json`, `compat/v1 2.json`, empty `content/* 2/`) that
  doubled the Math lessons for the compiler. Moved (not deleted) to
  `../teacher-guide-navigator-duplicates-2026-10-31b/`; `loadPack` now refuses such files with a
  clear message. Keep this repository out of iCloud "Optimise Mac Storage"/Desktop & Documents
  sync, or check `git status` for `* 2*` files before building. npm test 115/115.

### 2026-10-31 · Claude Code · `task/content-compiler` (took over PR #16 from Codex)

- Codex ran out of credits; its branch was clean and green. Found that the app bundles lacked 412
  of 650 cited workbook pages; added lesson-level `workbook` links to the model and built content
  release 1.0.1 (1.0.0 immutable; v1 views byte-identical). The website is now pinned to the
  release (`content/website.json`, `site:publish`/`verify:site`); a new test proves `dist/` equals
  the release and the app bundles carry everything the site shows for all 732 lessons.
- Browser: query library runs on the hash-verified release; release-driven site QA passes (366
  Hindi + 122 Math lessons at 390 px). Checks: see the [task note](tasks/content-compiler.md).

### 2026-10-31 · Codex · `task/program-metadata-layout` ([PR #17](https://github.com/anustup-nayak/teacher-guide-navigator/pull/17) to `next`)

- Required whole-program metadata: nine evidence-backed dimensions, per-grade
  source coverage, explicit readiness/review/questions and pack/program/release
  pointers. New-pack scaffolds cannot pass until inspected and documented.
- Additive 1.1.0 releases snapshot profiles, understanding and section/page maps;
  shared query accessor preserves calendars and hides unapproved editorial/link
  assertions. Existing 1.0.0 releases and all 732 v1 lessons remain unchanged.
- Isolated historical Math tooling under its pack, preserved shared font decoder
  and Hindi integration. Reworked core skill/templates and canonical folder,
  program-metadata, product/architecture/compiler/agent documentation together.
- Local checks PASS: Node 116, ingestion 16, skill helpers 5, both strict pack
  preflights, complete 13-PDF archive, both compiler/parity gates, publication
  preservation (1,962 page assets), design lock, module/worker/tool syntax,
  skill validation and diff checks. GitHub CI runs on the final PR head; consult
  PR checks before merging. No live UI/deploy, baseline, IDs or namespace changes.
- Review/merge #16 before #17. Full LO/sequence/routine/material/assessment/guide
  authoring remains Phases 4–5; existing profiles remain editorial/unreviewed.
  Details: [task note](tasks/program-metadata-layout.md).

### 2026-10-31 · Codex · `task/content-compiler` ([PR #16](https://github.com/anustup-nayak/teacher-guide-navigator/pull/16) to `next`)

- Phase 3: validated immutable static releases, manifest/hash/changelog, typed graph,
  per-grade app bundles, dependency-free query API with review gates. One-time
  migration keeps canonical teaching fields in model JSON and legacy-only export
  fields in pack compat/. Both catalogs reconstruct byte for byte (732 lessons);
  ontology v1.0.0 frozen in this task branch. Full model population is still Phases 4–5.
- At implementation start PR #15 was OPEN; it merged as `7c9556a` during close-out.
  Synced the compiler branch with next and retained both the owner decisions and
  the proven v1.0.0 parity freeze while resolving two documentation conflicts.
- Local and both GitHub check runs PASS on `92663b9` (PR #16 is mergeable).
- 112 Node, 15 Python ingestion, 4 skill helper; content reproducibility/parity,
  design lock, syntax, source integrity and publication/preservation all PASS locally.
- No dist/design/storage/baseline/production deployment change. Static releases
  remain repo artifacts; no retrieval/bot/v2 UI or public content endpoint added.
- Task note: [content-compiler](tasks/content-compiler.md). Next: review PR/dependency,
  then Phase 4/5 population; preview and v2 screens retain their owner gates.


Newest first. Each entry: date, agent, branch/commit, what changed, checks run,
task note, and anything left undone.

### 2026-10-31 · Claude Code · `task/ontology-decisions` (PR to `next`)

- Owner walked through the content model's open points and decided: guide list primary for Hindi
  outcomes (workbook codes kept with a reviewed crosswalk); reviewed rule-derived links allowed;
  Math grouped by code family (no strand names); generic Hindi workbook steps → `hi-workbook-practice`;
  Math G1 weeks 1–8 school readiness; day types accepted; owner signs off (new review value
  `owner-approved`, not an academic review). Recorded in [CONTENT_MODEL.md §6](CONTENT_MODEL.md).
- Schemas: `owner-approved`, `outcomeList` vocabulary, outcome `list`/`family`/`equivalent`. New rule
  `workbook-activity-title`. Examples regenerated (all 7 Hindi example steps now linked).
- Ontology is a v1.0 release candidate; it freezes when Phase 3 reproduces the v1 catalogs.
  npm test 97/97.

### 2026-10-31 · Claude Code · `next` (merge of `main` after r61)

- r61 is live (PR #14, `49f873c`): lesson links without `?curriculum=` open the right subject.
  `release/v1` fast-forwarded and tagged `v1.0.4`; `main` merged into `next` (HANDOFF.md
  conflict resolved by keeping both sides).

### 2026-10-31 · Claude Code · `task/lesson-link-pack` (PR to `main`, release r61)

- A lesson link without `?curriculum=` (e.g. `#/lesson/g2-hindi-w19-d03`) showed "lesson not
  found". The app now reads grade and subject from the lesson id (`packForLessonId`), flushes
  notes and replaces the URL with that pack's, keeping route and step. No loop for ids with no
  lesson; the query-less Math default is unchanged.
- Checks: npm test 83/83, check, design:check, sw.js, verify:publication, ingestion 15/15,
  verify:sources, skill tests; browser checks. Task note: [v1 fixes](tasks/v1-fixes.md).

### 2026-10-31 · Claude Code · `next` (merge of `main` after r60)

- r60 is live (PR #13, `4be3376`): restored quoted vowel signs in 13 Hindi lessons.
  `release/v1` fast-forwarded and tagged `v1.0.3`; `main` merged into `next` (HANDOFF.md
  conflict resolved by keeping both sides).

### 2026-10-31 · Claude Code · `task/v1-fixes` (PR to `main`, release r60)

- v1 checks: 390 px (no overflow), keyboard-only (logical order, visible focus), offline Hindi
  lesson (loads from cache with the server stopped) all pass.
- Fixed: bare vowel signs in quotes are drawings, not text, so 21 places in 13 Hindi lessons
  (several lesson titles) showed ‘ ’. Each sign read from the page image and restored via a
  `sign` repair; nothing else changes. Third recorded baseline amendment; new pack test.
- Checks: npm test 82/82, check, design:check, sw.js, verify:publication, ingestion 15/15,
  verify:sources, skill tests. Left: lesson links without `?curriculum=`; lazy subject loading.
  Task note: [v1 fixes](tasks/v1-fixes.md).

### 2026-10-31 · Claude Code · `task/content-platform` (PR to `next`)

- Owner asked to structure the product so the content back end serves several front ends
  (website, chatbot) and new products (remedial plans, teacher tools). Wrote
  [CONTENT_PLATFORM.md](CONTENT_PLATFORM.md): content core → versioned, static content release
  (manifest, entities, graph, app/v1/retrieval views, changelog) → shared query library →
  products; contract (stable ids, pinned versions, provenance, review gates), generated-content
  rules, and owner decisions (content rights, first product, chatbot hosting, policy).
- Plan: Phase 3 emits the content release and query library for the website. Owner then
  decided (same day): don't build other products now; only keep the repository ready for them.
  Phase 10 became "later, not scheduled"; §8 decisions are deferred. Docs only; npm test 95/95.

### 2026-10-31 · Claude Code · `next` (merge of `main` after r59)

- r59 is live (PR #11, `cb6075b`): Hindi grid crops on the step printed in the same column.
  `release/v1` fast-forwarded and tagged `v1.0.2`; `main` merged into `next` (HANDOFF.md
  conflict resolved by keeping both sides).

### 2026-10-31 · Claude Code · `task/hindi-grid-columns` (PR to `main`, release r59)

- Owner approved after checking G2 w19 d2: the parser gave grids to the first step at their height,
  ignoring columns, so 132 grids printed in 3.2 showed on 3.1 (and one 2.2 grid on 2.1). Steps now
  record their column; 133 crops move, every lesson's text and steps are unchanged.
- Second recorded baseline amendment (r59). New tests: `tests/test_hindi_grids.py`, pack test.
- Checks: npm test 81/81, check, design:check, sw.js, verify:publication, ingestion 15/15,
  verify:sources, skill tests; browser 360/390 px, Hindi/English. Task note: [grid](tasks/hindi-grid-columns.md).

### 2026-10-31 · Claude Code · `next` (merge of `main` after r58)

- r58 is live (PR #10, `181a840`). `release/v1` fast-forwarded to `181a840` and tagged `v1.0.1`;
  `main` merged into `next` (HANDOFF.md conflict resolved by keeping both sides). Removed the
  `g2-hindi-w19-d03` exception from `curricula/up-hindi-2026/model/structure.json`: the lesson
  now fits `hi-new-skills`. Checks on `next`: see the merge commit.

### 2026-10-31 · Claude Code · `task/repair-g2-hindi-w19-d03` (PR to `main`, release r58)

- Source repair approved by the owner: `g2-hindi-w19-d03` had lost step 2.3 and all of period 3, and
  showed period 3's word grid on 2.1. Periods 2–3 transcribed from TG G2 PDF p124 into `repairs.json`;
  `build_pack.py` can now add a dropped period. Only this lesson changed; existing step ids kept.
- Reviewed baseline amendment (first use of the procedure, now in
  [CURRICULUM_EXPANSION.md](CURRICULUM_EXPANSION.md)): two hashes, recorded in `amendments`.
- Checks: npm test 80/80, check, design:check, sw.js, verify:publication, ingestion 12/12,
  verify:sources, skill tests; browser 360/390 px, Hindi/English, legacy link, Math unchanged.
  Task note: [repair](tasks/repair-g2-hindi-w19-d03.md). Left: deploy via merge; possible grid
  mis-attachment on other days (G2 w19 d2) needs a review.

### 2026-10-31 · Claude Code · `task/program-structure` (PR to `next`)

- Owner asked for the program structure first, because subjects differ and assessment days do not
  share the teaching-day shape. Added `structure.json` per pack (calendar → day types → periods and
  slots, period outline, exceptions), `structure.schema.json`, checker `scripts/content/structure.mjs`
  and `tests/structure.test.mjs`. Lessons now carry `dayType` (replaces `dayPurpose`) and step `slots`;
  calendar, cycle and periods moved out of `program.json`. See [CONTENT_MODEL.md §1a](CONTENT_MODEL.md).
- Findings: Hindi assesses on day 6 (G1 only from week 14); Math assesses on day 5 and its days 4–6
  are weekly templates; Math G3 days 4–6 have their own shape. `g2-hindi-w19-d03` lost step 2.3 and
  period 3 in v1 (needs a repair task on `main`).
- Checks: npm test 94/94, npm run check, skill preflight tests. Task note: [program-structure](tasks/program-structure.md).
- PR #8 (Phase 2) was squash-merged into `next` as `bb39abe`.

### 2026-10-31 · Claude Code · `task/phase2-content-model` (PR to `next`)

- Phase 2 drafted: [CONTENT_MODEL.md](CONTENT_MODEL.md) (files, ID rules, links/provenance,
  derivation rules, how Hindi and Math fit, worked examples, open points);
  `schemas/content-model/` (vocabularies + common + 9 entity schemas); dependency-free validator
  `scripts/content/schema.mjs`; `v1_lesson.mjs` (v1 record → model lesson, ids and text unchanged);
  examples for `g1-hindi-w09-d02` and `g1-math-w09-d01` in `docs/content-model/examples/`.
- Checks: npm test 87/87 (4 new content-model tests). No app or dist change.
- Left: review gate; Phase 3 compiler and v1 parity.

### 2026-10-31 · Claude Code · `task/phase1-program-profiles` (PR to `next`)

- Phase 1 drafted: `scripts/content/extract_matter.py` decodes all front/back matter (320 pages);
  `curricula/*/model/sections.json` maps each guide from its contents page; `build_pagemap.mjs`
  writes `pagemap.json` (every page → section → lessons) and `tests/pagemap.test.mjs` gates it.
  Draft profiles: `curricula/up-hindi-2026/model/PROGRAM_PROFILE.md`, `curricula/up-math-2026/model/PROGRAM_PROFILE.md`.
- Moved 38 macOS " 2" duplicate files out of the repo (nothing deleted; see task note).
- Checks: npm test 83/83; verify:sources ok. Left: review gate, article line-by-line reading, Math image-only pages.
- Later on the same branch: workbook front/back matter read. The workbooks list coded NIPUN LOs for
  all grades (guides do so only for G3), and Hindi workbook part 2 (reading/fluency practice) is not
  linked to any v1 lesson. Both are in the Hindi profile. Task note: [phase1](tasks/phase1-program-profiles.md).

### 2026-10-31 · Claude Code · `main` @ `25c50ac` (PR #5, squash-merged)

- Added the [content architecture plan](CONTENT_ARCHITECTURE_PLAN.md) for an ontology-led
  content model (program, outcomes, sequence, routines, materials, assessments, lessons,
  program guide from the front matter, page map, provenance) and app v2, phases 0–9 with
  owner gates; the owner approved it and chose a second GitHub Pages site for previews.
- Phase 0: [VERSIONING.md](VERSIONING.md) (branches `main`/`release/v1`/`next`, tags,
  rollback, teacher-data contract, cutover), tag `v1.0.0`, preview workflow template
  `docs/preview/pages-preview.yml`, branch rule in AGENTS.md. `release/v1` and `next`
  fast-forwarded to `25c50ac`.
- Checks: Checks and GitHub Pages workflows green; live worker still `r57`.
- Left: preview organisation and site (owner action first), then Phase 1.

### 2026-10-31 · Claude Code · `main` @ `4e7065d` (PR #3, squash-merged; live as r57)

- Added UP Hindi Grades 1–3 as pack `up-hindi-2026` beside Math in the same app (Subject
  menu: गणित / हिन्दी): 366 lessons, 2,752 timed steps, 332 workbook links, 175 grid
  crops, 972 page images; release r57. Math payloads, IDs, images and storage unchanged
  (preservation gate passes).
- Pack adapter in `curricula/up-hindi-2026/tools/` (legacy-font decoder, glyph-order
  rebuild, hidden-edit filter, grid/tip handling, workbook citation mapping, builder,
  one source-compared repair). Originals archived; G3 workbook via Git LFS.
- Small generic app edits (phase `role`, `worksheetPreview`, minute ranges); no protected
  design file changed. Checks: npm test 80/80, all gates; browser QA listed in task note.
- Left: line-by-line proofreading; review list; 390 px/keyboard/offline-Hindi/real-device
  checks; possible per-subject lazy loading. Task note:
  [up-hindi-ingestion](tasks/up-hindi-ingestion.md).

### 2026-10-31 · Claude Code · `main` @ `145d49d` (PR #1, squash-merged)

- Added this handoff log, the [design contract](DESIGN_CONTRACT.md), the design
  lock (`docs/design-lock.json`, `scripts/design_lock.mjs`,
  `tests/design-lock.test.mjs`, `npm run design:check` / `design:approve`) and
  `CLAUDE.md` (imports AGENTS.md so Claude Code and Codex share one rule set).
- Wired both into AGENTS.md, README, DEVELOPMENT, the task-note README and the
  skill (entry point, design and release references).
- Deleted the fully merged local branch `task/github-readiness`.
- No runtime, CSS, content, image or storage change.
- Before editing: live site checked in Hindi on every screen (no issues) and
  all seven checks passed on `main`.
- Checks: `npm test` 75/75 (6 new design-lock tests), `npm run check`,
  `npm run design:check`, `node --check dist/sw.js`, `npm run verify:publication`,
  `npm run test:ingestion` 7/7, skill tests 4/4, `npm run verify:sources --
  --require-complete`, skill preflight: all pass. Lock verified to fail on a
  palette change and to ignore a release-version bump.
- Status: merged to `main` as `145d49d` via
  [PR #1](https://github.com/anustup-nayak/teacher-guide-navigator/pull/1) after both
  GitHub checks passed; task branch deleted. Repository auto-merge is disabled,
  so the agent merged it on the owner's instruction.
- Task note: [agent-continuity-design-lock](tasks/agent-continuity-design-lock.md).

### 2026-10-31 · earlier agent session (agent not recorded) · `main` @ `e838c78`

- "Record verified source recovery and live Pages deployment": source archive
  of all seven PDFs with checksums, GitHub Pages workflow, live deployment.
- Task note: [github-readiness](tasks/github-readiness.md).

### 2026-10-31 · earlier agent session (agent not recorded) · `main` @ `86aa0e2`

- "Preserve complete source archive and prepare verified GitHub Pages app":
  initial repository import of the r56 app, docs, skill and tests.
- Earlier history (r18–r56: scrollable lesson, pack contract, source-led cards,
  modular runtime, UX audit, expansion contract) is recorded in the task notes
  under [docs/tasks/](tasks/) and summarised in [DEVELOPMENT.md](DEVELOPMENT.md).
