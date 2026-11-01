# Smart lesson cards: specification and handoff

Status (1 Nov 2026): **design options drafted, not built.** Read this whole file before making any card.
It is written so that any agent can pick up the work, including after the previous agent ran out of tokens.
Background: [UX_REVIEW_2026-11.md](UX_REVIEW_2026-11.md). Track progress in the table at the end of this file
and in [HANDOFF.md](HANDOFF.md).

## 1. What a smart card is

Every lesson opens on one card that a teacher with weak planning skills can grasp in under a minute. The card
is a picture of how to follow the guide:

- **vertically:** the lesson's steps in order, as numbered lines;
- **horizontally:** what the lesson builds on and what comes next.

The full lesson stays below, unchanged. Tapping a line opens (scrolls to) that step. Nothing is gated or hidden.

## 2. Owner decisions (in the review doc, 1 Nov 2026)

| Decision | Answer |
|---|---|
| Who approves card text | **The owner (Anustup)**, in batches, as for the Math goal titles |
| Placement | **The card is the first thing a teacher sees.** The existing step chips stay **below** the card, so teachers can jump to a step or scroll |
| Header image | **The key diagram from the I do or We do step** (Math). See §5 for Hindi, which has no step illustrations |
| First samples | Grade 2–3 Math and Hindi (literacy) Grade 1–2; **then apply to all** |
| Layout | **Open: Option A or Option B** (§3). The owner has not yet chosen |

## 3. The two design options

Both use real lessons (week 14, day 1) and only those lessons' own text, minutes and images.
Sources: [docs/design/smart-cards/](design/smart-cards/) (`gen.py` + `style.css` + `cards-draft.json` regenerate the PNGs).

**Option A · steps in order** ([optA.png](design/smart-cards/optA.png)): up to five numbered lines, one per step
(Math folds “हम करें” and “बच्चे करें” into one line; Hindi groups its 7–9 steps into five).
Each line: step name, minutes or period, one sentence of about 15 words.

**Option B · three periods** ([optB.png](design/smart-cards/optB.png)): three coloured bands, one per कालांश,
each with the step names and minutes in small type and one line that strings the steps with arrows.

Recommendation: **A for Math** (it shows the I do → We do → You do order, which is the vertical habit we want).
For Hindi, A with five grouped lines or B both work; B mirrors how the Hindi guide itself is organised
(periods with numbered activities). The owner may choose A for both, B for both, or A for Math and B for Hindi.
**Do not build until the owner has chosen.**

Common to both, top to bottom:

1. **Chain line:** `पहले से: <priorKnowledge>` (Math) or `पिछला: <previous lesson title>` (Hindi, which has no
   priorKnowledge field) · `आगे: <next lesson short title> ›` (link). Previous/next come from
   `lessonChain()` in [dist/domain/progress.mjs](../dist/domain/progress.mjs).
2. **Blue header:** grade · subject · week · day · periods; the short title; the goal line from `lessonGoals()`
   (`🎯 <goal title> · पाठ k / n`). Hindi shows no goal line until the Hindi goal-to-week map is approved.
3. **Key image** with a caption naming its source and an enlarge action (the existing reader).
4. **The lines** (A) or **bands** (B), labelled `सार`.
5. **तैयार रखें** (materials) and **ध्यान दें** (commonMistake, Math only).
6. **“पाठ शुरू करें · चरण 1 →”**, which jumps to the first step section.
7. Below the card: the existing sticky step chips (unchanged component).

## 4. Volume

| Pack | Grade | Teaching-day cards | Day 4–6 weekly plans | Steps per lesson (avg) | Image source |
|---|---|---|---|---|---|
| up-math-2026 | 1 | 45 | 45 | 6.0 | I do crop on every teaching day |
| up-math-2026 | 2 | 69 | 69 | 6.0 | I do crop on every teaching day |
| up-math-2026 | 3 | 69 | 69 | 6.0 | I do crop on every teaching day |
| up-hindi-2026 | 1 | 90 | 0 | 7.3 | Workbook page on 90 of 90 |
| up-hindi-2026 | 2 | 138 | 0 | 7.6 | Workbook page on 111 of 138 |
| up-hindi-2026 | 3 | 138 | 0 | 7.6 | Workbook page on 112 of 138 |

That is **549 teaching-day cards** (183 Math, 366 Hindi; every Hindi day is a full daily plan) plus 183 Math
day 4–6 cards. Note: the UX review doc's earlier figure of “about 366” undercounted Hindi.
Day 4–6 cards are mostly assembled from the guide's weekly outline (`program-guide-data.mjs` day types and the
week's three lessons) and are a later slice.

## 5. Image rule

- Never redraw or edit source pixels. Show a crop of the original page through the existing CSS viewport
  (`cropGeometry()` in [dist/lesson-visuals.mjs](../dist/lesson-visuals.mjs)). No new image files in `dist/`.
- **Math:** use `phaseVisual(lesson, phase('i-do'))`. If that crop is missing or narrower than about 200 source
  pixels, use the We do crop. If both are missing, use the day's workbook page (top half).
- **Hindi:** the Hindi pack has **no step illustrations** (no I do / We do phases; `phaseVisual` returns null for
  teaching steps). The mock uses the top half of the day's workbook page. **Confirm with the owner**: workbook page,
  or a crop of the guide page around the main teaching activity (would need new crop rectangles, reviewed against
  the page image), or no image. Days without a workbook page (27 in G2, 26 in G3) need the same decision.
- Caption says what the image is: `मैं करूँ · संदर्शिका का चित्र` or `आज की कार्यपुस्तिका · पृष्ठ N` (printed page number).

## 6. Writing the lines (the only new text)

Each line compresses its step(s), in Hindi, in the guide's own terms. Rules:

1. One sentence, 10–18 words. Lead with the action the teacher does. Use “→” or “;” to join two actions.
2. Keep every concrete anchor the step has: poem, story and book names; objects; page numbers; numbers used
   as examples (26 + 13); group sizes (2-2, 4-4); the 70% rule.
3. Add nothing: no activity, material, question or timing that the step does not contain. Do not drop a
   condition the guide makes (for example “पाँच बार के बाद भूमिकाएँ बदलें” when that is the point of the step;
   “70% से कम” before the remedial).
4. Fix obvious OCR damage only against the page image (e.g. the Math G2 source text reads “26 $ 13” where the
   page prints “26 + 13”). Record every such fix in the review sheet as a source-repair candidate for `main`.
5. Labels: Math lines use the step names already in the app (बातचीत, मैं करूँ, हम करें, बच्चे करें, कार्यपत्रक,
   खेल और सहायता). Hindi lines use the guide's own activity names, shortened.
6. Minutes: copy from the phase (`p.minutes`; Hindi ranges such as `7–10` as printed). Combined lines add them
   (Math 13 + 10 = 23). Period lines say `कालांश 2` / `कालांश 3`.

Automatic checks for every draft line (put them in the generator and the test suite):
every number and every quoted name in a line must appear in the source step text or the page; no line over 18
words; no line without a label; every phase of the lesson is covered by exactly one line (or band).

## 7. Data model and build path (follow the goal-titles pattern)

Cards are an editorial layer of the canonical content, like the Math goal titles. Do not type them into the app.

1. **Model:** `curricula/<pack>/model/cards/g<grade>.json`, one entry per lesson:
   ```json
   {"lesson": "g2-math-w14-d01",
    "layout": "A",
    "image": {"phase": "i-do"} ,
    "lines": [{"phases": ["conversation"], "label": "बातचीत", "minutes": "10 मि",
               "text": "गिनलड़ी पर खाली टैग: “यह कौन-सी संख्या है? कैसे पहचाना?”"}],
    "provenance": {"assertion": "editorial", "review": "draft", "approvedBy": null, "date": null}}
   ```
   Option B uses `"bands": [{"period": 1, "phases": [...], "label": "...", "text": "..."}]` instead of `lines`.
   `image` is `{"phase": "i-do"|"we-do"}` or `{"worksheet": 0}`. Prep and watch-for are not stored: they come from
   the lesson's `materials` and `commonMistake`.
2. **Schema:** `schemas/content-model/cards.schema.json` (pattern: `outcomes.schema.json`).
3. **Compiler:** `scripts/content/compile.mjs` adds a `card` entity kind and a new content release (1.3.0,
   previous 1.2.0); bump `verify:content` in `package.json` and the pin in `content/website.json`.
4. **Site:** `scripts/content/publish_site.mjs` emits `dist/lesson-cards.mjs` with **approved cards only**
   (pattern: `lessonGoalsModule()`), and `verify:site` checks it.
5. **App:** a new view `dist/views/smart-card.mjs` (pure HTML builder, like `views/today.mjs`). In
   `lessonScreen()` in `dist/app.mjs`, when an approved card exists, render it in place of the banner and the
   `chainLine()`; keep `sectionChips()` directly below. Without a card the lesson renders exactly as in r65.
   Add a “पाठ एक नज़र में” anchor to `lessonSections()` only if the owner wants it as a chip.
6. **Review sheet:** `docs/review/smart-cards-<pack>-g<grade>.md`: one row per lesson with the drafted lines
   and the source step text side by side, and a link to the page image. The owner approves a batch in chat or in
   the sheet; then set `review: "owner-approved"`, `approvedBy`, `date` for that batch.
7. **Design lock:** new card styles go in `dist/guide-cards.css` and need `npm run design:approve` with the
   owner's approval of the chosen option (§3), recorded in HANDOFF.md.
8. **Release:** `npm run release:assets -- rNN`, then the full checks in [DEVELOPMENT.md](DEVELOPMENT.md#checks).

## 8. Drafting workflow for one batch

1. Pick the batch from the progress table (start: G2 Math, G3 Math, G1 Hindi, G2 Hindi, 3–5 lessons each).
2. Run the generator to assemble the fixed parts (chain, title, goal, image, minutes) from `dist/curricula.mjs`,
   `dist/lesson-goals.mjs` and `dist/domain/progress.mjs`.
3. Draft the lines from each phase's `actions` (and `questions`) with the rules in §6. An LLM prompt that works:
   “Compress this teaching step into one Hindi sentence of 10–18 words for a teacher. Keep every number, name,
   page number and group size. Add nothing. Step: <actions joined with ' | '>”. Then check every line by hand
   against the step and the page image.
4. Run the automatic checks (§6).
5. Render the batch (`gen.py`-style HTML or the real view) at 360 px and add the screenshot to the review sheet.
6. Ask the owner to approve. Only approved cards are published.
7. Update the progress table below and HANDOFF.md after every batch.

## 9. Acceptance

- A lesson with an approved card shows the card first, step chips directly below, then the unchanged lesson.
- A lesson without one is identical to r65.
- Every line maps to source phases; every number and name in a line exists in the source; no invented activity.
- Card text labelled `सार`; original pages one tap away; the image is a crop of an original page.
- Hindi and English UI at 320, 360 and 390 px with no horizontal scroll; keyboard reachable; enlarge works;
  “पाठ शुरू करें” focuses step 1; deep links `#/lesson/<id>/teach/<n>` still land on step n.
- `npm test`, `npm run check`, `verify:content`, `verify:site`, `design:check` pass.

## 10. Progress

| Batch | Pack · grade | Lessons | Draft | Owner approved | Published |
|---|---|---|---|---|---|
| Samples | Math G2, Math G3, Hindi G1, Hindi G2 | w14 d1 each (in `cards-draft.json`) | ✓ (both layouts) | Layout choice pending | — |
| 1 | Math G2 | first 5 teaching days | | | |
| 2 | Math G3 | first 5 teaching days | | | |
| 3 | Hindi G1 | first 5 days | | | |
| 4 | Hindi G2 | first 5 days | | | |
| Then | All remaining (549 + 183 day 4–6) | by grade, in week order | | | |
