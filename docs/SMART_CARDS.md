# Smart lesson cards: specification and handoff

Status (1 Nov 2026): **component, data path and workbench built (r66); drafting split between Claude Code (Math) and Codex (Hindi), §8.** Read this whole file before making any card.
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
| Layout | **Option A for Math, Option B for Hindi** (owner, chat, 1 Nov 2026) |
| Hindi header image | **Top half of the day's workbook page** (owner, 1 Nov 2026) |
| Hindi days without a workbook page (27 in G2, 26 in G3) | **No image**; the card starts with the title and bands |
| Going live | `next` → `main` **after smart cards** ship, as one release |

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
**Decided: A for Math, B for Hindi.**

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
- **Hindi:** the Hindi pack has **no step illustrations**. Use the **top half of the day's workbook page**
  (owner decision). Days without a workbook page show **no image** (owner decision).
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

## 7. Data model, tool and build path (built in r66)

| Piece | Where |
|---|---|
| Drafts (agents write here; **not** a compiler input, so CI stays green) | `curricula/<pack>/drafts/cards/g<grade>.json` |
| Owner-approved cards (only `approve` writes here) | `curricula/<pack>/model/cards/g<grade>.json` |
| Schema | `schemas/content-model/cards.schema.json` (layout `steps` or `periods`; lines name the lesson's own step ids) |
| Compiler | `scripts/content/compile.mjs` reads `model/cards/`, checks lessons and steps, emits `entities/card.json` (schema 1.3.0) |
| Site | `scripts/content/publish_site.mjs` → `dist/lesson-cards.mjs`, owner-approved cards only |
| View | `dist/views/smart-card.mjs`; `smartCard()` in `dist/app.mjs` replaces the banner when a card exists; chips stay below |
| Workbench | `scripts/content/cards.mjs` (below) |
| Tests | `tests/smart-cards.test.mjs` |

```sh
node scripts/content/cards.mjs scaffold <pack> <grade> 5     # add skeletons (steps grouped, minutes, image) for the next 5 lessons
node scripts/content/cards.mjs source   <pack> <grade>       # print the steps of every card still marked TODO
#   …edit the drafts file: replace every TODO (Hindi: also the band names after "कालांश N · ")…
node scripts/content/cards.mjs check    <pack> <grade>       # rules of §6; must print "0 with problems" before a sheet goes out
node scripts/content/cards.mjs sheet    <pack> <grade>       # docs/review/cards/<pack>-g<grade>.md for the owner
node scripts/content/cards.mjs approve  <pack> <grade> --checked --by "owner, chat, YYYY-MM-DD"   # only after the owner says yes
```

The `check` rules: layout matches the owner's decision; every step on exactly one line; no TODO; 6–20 words (bands 24);
every number and every quoted name must occur in the lesson's own text. It cannot judge meaning: the drafter still
reads each line against the step and, where the text looks damaged (OCR), against the page image.

**Releases.** Content releases are immutable and each adds about 35 MB, so **only the integrating agent** builds them,
and only after an approval batch: `npm run content:build -- --version 1.3.N --previous 1.3.(N-1)`, bump `verify:content`
in `package.json` and `content/website.json` together, `npm run site:publish`, `npm run release:assets -- rNN`, full checks.
Drafting agents never run `content:build`, never touch `content/`, `dist/` or `model/`.

## 8. Working in parallel: Claude Code and Codex

The split is by file, so the two agents never touch the same file.

| Agent | Owns (drafts) | Layout | Cards | Branch pattern |
|---|---|---|---|---|
| **Claude Code** | `curricula/up-math-2026/drafts/cards/g{1,2,3}.json`, `docs/review/cards/up-math-2026-*` | `steps` (Option A) | 183 | `task/cards-math-<batch>` |
| **Codex** | `curricula/up-hindi-2026/drafts/cards/g{1,2,3}.json`, `docs/review/cards/up-hindi-2026-*` | `periods` (Option B) | 366 | `task/cards-hindi-<batch>` |
| **Integrator** (Claude Code unless the owner says otherwise) | `model/cards/`, `content/`, `dist/`, `package.json`, `content/website.json`, releases | — | — | `task/cards-release-<n>` |

Protocol for each agent:

1. Read this file, [AGENTS.md](../AGENTS.md) and HANDOFF.md. Branch from the latest `next`.
2. Claim the batch in the progress table below (agent, grade, lesson range) in the same PR as the drafts.
3. Batch size: one grade, 10–15 lessons, in week order. `scaffold`, `source`, write, `check` until clean, `sheet`.
4. Open a PR into `next` with the drafts file and the review sheet only. Title: `Cards draft: <pack> G<grade> w<a>–w<b>`.
5. The owner reviews the sheet (in the PR or in chat). Edits asked for are made in the drafts file; then the owner says yes.
6. Approval: the agent that drafted runs `approve … --by "owner, <where>, <date>"` in the same PR, re-runs `check`, and the PR merges.
7. The integrator collects merged approvals into one release (§7) and publishes; the owner decides when `next` goes to `main`.
8. Update your row in HANDOFF.md and the progress table after every batch. If you run out of tokens, the next agent
   continues from the table, the drafts file (TODO marks unfinished cards) and `check` output.

Never edit the other agent's drafts file, `model/`, releases or `dist/` from a drafting branch.

### Prompt for Codex (paste as is)

> You are drafting smart lesson cards for the Hindi pack of Sandarshika (repo anustup-nayak/teacher-guide-navigator).
> Read AGENTS.md, docs/HANDOFF.md and docs/SMART_CARDS.md fully before anything else; they are the rules.
> Your files only: `curricula/up-hindi-2026/drafts/cards/g{1,2,3}.json` and `docs/review/cards/up-hindi-2026-*`.
> Layout is `periods` (three bands, one per कालांश). Start with Grade 1, weeks 9–11 (15 lessons): branch
> `task/cards-hindi-g1-a` from `next`; run `node scripts/content/cards.mjs scaffold up-hindi-2026 1 15`, then
> `source up-hindi-2026 1`; for each card replace every TODO: the band name after "कालांश N · " (2–4 words naming the
> period's work, e.g. "मौखिक भाषा", "वर्ण और ग्रिड", "पठन और सहायता"), tidy `steps` (short activity names with their minutes,
> as printed), and `text`: one Hindi sentence, 10–24 words, stringing the period's activities in order with "→",
> keeping every name, number and page from the step and adding nothing (§6). Shorten the `title` if it is longer than
> about 8 words, using only its own words. Run `check` until it prints 0 problems, then `sheet up-hindi-2026 1`.
> Claim your batch in the §10 table, open a PR into `next` titled "Cards draft: up-hindi-2026 G1 w09–w11" containing only
> those files, and stop for the owner's review. Do not run `content:build`, `site:publish` or `approve` unless the
> owner has approved in writing; do not touch `model/`, `content/`, `dist/` or any Math file.

## 9. Acceptance

- A lesson with an approved card shows the card first, step chips directly below, then the unchanged lesson.
- A lesson without one is identical to r65.
- Every line maps to source phases; every number and name in a line exists in the source; no invented activity.
- Card text labelled `सार`; original pages one tap away; the image is a crop of an original page.
- Hindi and English UI at 320, 360 and 390 px with no horizontal scroll; keyboard reachable; enlarge works;
  “पाठ शुरू करें” focuses step 1; deep links `#/lesson/<id>/teach/<n>` still land on step n.
- `npm test`, `npm run check`, `verify:content`, `verify:site`, `design:check` pass.

## 10. Progress

| Batch | Agent | Pack · grade | Lessons | Drafted | Owner approved | Released |
|---|---|---|---|---|---|---|
| Samples | Claude Code | Math G2, G3; Hindi G1, G2 | w14 d1 each (drafts files) | ✓ | layouts chosen; text not yet approved | — |
| M1 | Claude Code | Math G2 | w01–w05 (15) | in progress | | |
| H1 | Codex | Hindi G1 | w09–w11 (15) | not started | | |
