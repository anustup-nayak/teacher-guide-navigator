# Protected design contract

Owner-approved look, feel and teaching flow of Sandarshika as released in r56, with later owner-approved amendments noted where they apply (latest: आज home and header tabs, 1 Nov 2026, see [UX_REVIEW_2026-11.md](UX_REVIEW_2026-11.md)).
No agent may change what this file protects without the owner's explicit
approval in chat. Detailed rationale lives in the skill's
[design reference](../skills/teacher-guide-to-app/references/design.md) and
[VISUAL_DESIGN.md](VISUAL_DESIGN.md); this file says what is frozen and how a
change is approved.

## Why it is protected

Teachers are Hindi-first, often new to smartphones, and learn the app once.
A changed layout, label or route forces them to relearn it, and several agents
working in turn would otherwise drift the design apart. Consistency is a
feature here, not a matter of taste.

## Frozen (owner approval required)

1. **Flow.** Grade/subject → topic → summary card → full lesson, and
   grade/subject → week → day card → the same lesson. No mandatory entrance,
   onboarding, login, sub-topic or Prepare/Teach gate. Routes `#/find`,
   `#/lesson/<id>`, `#/saved`, `#/help` and legacy `#/lesson/<id>/teach/<n>`
   keep working. The home and default route is `#/today` (आज): the next lesson in the guide's order,
   one tap from the lesson, never a gate (owner-approved 1 Nov 2026). The program guide `#/guide`, `#/guide/week|periods|pages` is a separate
   way in, never a gate before a lesson (owner-approved 31 Oct 2026; see
   [PROGRAM_GUIDE_DESIGN.md](PROGRAM_GUIDE_DESIGN.md)).
2. **Shell.** Header with brand, then the three tabs आज · पूरा साल · सभी पाठ
   (in this order; `#today-link` → `#/today`, `#year-link` → `#/guide`, `#find-link` → `#/find`;
   owner-approved 1 Nov 2026), then the language menu (हिन्दी first and default). मेरी सूची and मदद are
   linked from आज and सभी पाठ. Below the header, the sticky grade/subject context line; its chip opens the
   grade/subject controls. Skip link first. One reader dialog.
3. **Browse screen.** Two side-by-side route tabs, “पाठ के विषय से” and
   “सप्ताह / दिन से”; topic groups expand to summary cards; cards end with
   “पाठयोजना खोलें →” (or “साप्ताहिक रूपरेखा खोलें →” for weekly plans).
   Every subject's card uses one rule: the top line is “सप्ताह N · दिन N”, plus the day
   type's name on days other than new teaching (e.g. “· साप्ताहिक आकलन”), from
   `dist/day-types.mjs`; the summary is the workbook page, then the first material
   without its preparation note. (Owner-approved 31 Oct 2026; no style change.)
   The program guide is reached from the पूरा साल tab (the find-page guide card was removed, 1 Nov 2026);
   lessons keep the “सप्ताह कैसे चलता है” link inside “पाठ के विकल्प” and Help links to the guide.
4. **Lesson anatomy, in order.** Where an owner-approved smart card exists, the card comes first and replaces the
   banner and previous/next line ([SMART_CARDS.md](SMART_CARDS.md), owner-approved 1 Nov 2026). Otherwise: blue lesson
   banner with week/day badge and, where mapped, the goal with the lesson's position; the previous/next lesson line; wrapping sticky section chips; “पाठ के विकल्प” (my list,
   offline, text size, week guide), folded; (preparation, every source phase with its
   minutes, my note, original pages); preparation blocks; one card per source
   phase (coloured band with name and minutes, original artwork with
   enlarge action, numbered actions, question strip, worksheet preview in
   practice); my note; the explicit “पढ़ा दिया है · चिह्न लगाएँ” action with
   undo; original books and pages; other-day links. The whole lesson scrolls;
   nothing is collapsed or gated. Weekly plans keep one source phase and never
   gain invented I do / We do / You do sections.
5. **Palette tokens** in `dist/styles.css` `:root`: blue `#286f99`,
   blue-dark `#174d6c`, ink `#253d4c`, body `#334d5c`, muted `#586c78`,
   background `#f5f7f8`, line `#d4dfe5`, amber `#f0b35f`, pink `#df909d`,
   purple `#b5a0c9`, focus `#854900`; source-card overrides in
   `dist/guide-cards.css`. Role meaning is fixed: blue navigation, amber
   teaching, pink practice, purple support.
6. **Type and touch.** System UI font, body 17px / 1.65 line height, headings
   28 / 23 / 19px, controls at least 48px tall, 3px focus outline. Text-size
   control up to 200%. No horizontal scrolling at 320, 360 or 390px.
7. **Vocabulary.** The Hindi labels above and the action names in the design
   reference's “Meaning, action and reversal” table (मेरी सूची, बिना इंटरनेट
   के लिए रखें, मूल पृष्ठ, मेरा नोट, …). English labels are their translations,
   not separate designs.
8. **Trust behaviour.** Original pages always reachable; adaptations
   labelled; reading never marks a lesson taught; device-only storage
   disclosed in Help.

## Free to change without approval

- Bug fixes that restore the behaviour described above, without changing a
  protected file. If the fix needs a protected file, ask first.
- Content work inside a pack: new reviewed lessons, worksheets, images, pack
  palettes and illustration overrides in `CURRICULA[].visualStyle`, new
  grade/subject options that appear because reviewed data exists.
- Tests, docs, scripts and ingestion tooling.

A new subject (for example Hindi language) uses these same screens and cards.
If its source structure cannot be shown with the existing components, stop
and propose the new component to the owner first.

## How the lock works

`docs/design-lock.json` stores SHA-256 hashes of the protected files:
`dist/styles.css`, `dist/guide-cards.css` and the `dist/index.html` shell
(release `?v=rNN` tokens are ignored, so normal releases do not trip it).
`tests/design-lock.test.mjs` runs in `npm test` and fails when:

- a protected file's hash differs from the lock without a recorded approval;
- a frozen invariant breaks: palette tokens, base type and touch sizes,
  header links and order, Hindi default, route parsing, browse tabs, lesson
  chips, and the completion and note labels.

`app.mjs` is not hash-locked because pack and content work edits it; its
flow is guarded by the invariant tests instead.

## Approving a design change

1. Describe the change to the owner with before/after screenshots in Hindi at
   360px (and English if labels change). Wait for an explicit yes in chat.
2. Make the change on a task branch.
3. Record the approval:
   ```sh
   npm run design:approve -- --reason "what changed and why" --approved-by "owner, in chat, YYYY-MM-DD"
   ```
   This refreshes the hashes and appends the reason, approver, date and files
   to `docs/design-lock.json`. It refuses to run without both values.
4. If a frozen rule itself changes, update this file and the invariant test in
   the same commit, and add a HANDOFF log entry naming the approval.

Running the approve command without the owner's approval breaks the project
rules even though the test turns green. Reviewers check the approver field.
