# Program guide in the app — plan and design proposal

Status: revision 2 **approved by the owner** (31 October 2026, “Approve and build A”). **Slice A is built** on `next` (see §7);
the other slices wait for the approvals listed there.
Mockups: [docs/design/program-guide/index.html](design/program-guide/index.html) (serve the repository
root, e.g. `python3 -m http.server 8766`, then open `http://localhost:8766/docs/design/program-guide/`).
This is the program-guide slice of plan Phase 6 ([CONTENT_ARCHITECTURE_PLAN.md §4a](CONTENT_ARCHITECTURE_PLAN.md)).

Revision 2 (owner, 31 Oct 2026): **the year's learning goals come first**, each with its week-by-week path
and deep links to the lessons that build it.

## 1. The problem

Teachers do not use the Teacher Guide because they do not see how it helps them reach their learning
goals, or how its weeks and days add up to those goals; the whole guide feels overwhelming. The guide's
front matter does hold that answer (NIPUN outcomes p2, the year plan by week blocks, the weekly cycle,
the periods) but it is 18 dense pages, and the app today shows only the day plans.

So the guide layer starts from the teacher's goal, not from the guide's chapters: **“what must my
children be able to do by the end of the year, and which weeks and lessons get them there?”**

## 2. What a teacher should be able to answer

1. **What are my goals this year?** A short list of the grade's key outcomes in plain words.
2. **How does the guide get my class there?** For each goal: the weeks that teach it, the days that
   check it (weekly assessment) and revise it, and the lessons, one tap away. What is next for me.
3. **How does my week run?** New-skill, revision and assessment days; revision weeks.
4. **How does my day run?** The three कालांश and their purpose.
5. **How do I read a lesson plan?** Steps, minutes, colours, questions, worksheet, remedial time.
6. **How do I check, and what if a child is behind?** Weekly assessment, groups A and B, remedial work.

## 3. Principles (unchanged contract)

- **Never a gate.** Nothing is put in front of a lesson; topic → summary → lesson and week → day →
  lesson stay exactly as they are. Goals are a third way in, not a replacement.
- **Small first, depth on demand.** A goal is one line and a strip of weeks; the guide's full text and
  original pages are one tap further, never the first thing shown.
- **Source first.** Goal statements and codes are the guide's own. Short goal titles and summaries are
  editorial: shown only when owner-approved, always labelled and citing the source page.
- **Honest links.** A lesson is linked to a goal only where the guide prints it (stated) or by a named,
  approved rule (derived); otherwise the goal shows its original page and no invented lessons.
- **Same components and data path.** Existing cards, chips, colours and reader; content comes from the
  pinned content release, never typed into the app. The teacher's progress reuses the device's existing
  “पढ़ा दिया है” marks (read-only; no new storage).

## 4. Where it appears (entry points)

| Entry | What the teacher sees | Proposal |
|---|---|---|
| Find page | One card below the browse tabs: **“🎯 इस साल के लक्ष्य — बच्चे क्या सीखेंगे, और कौन-से सप्ताह व पाठ उन्हें वहाँ पहुँचाते हैं”** | **Recommended** |
| Lesson | A goal chip near the banner (“🎯 लक्ष्य: दो अंकों का जोड़”) back to its goal; the day label (“· साप्ताहिक आकलन”) links to the week section; “यह पाठ योजना कैसे पढ़ें?” under the chips | **Recommended** |
| Help (मदद) | One line linking to the guide | **Recommended** |
| Header | A fourth link | **Not recommended** (frozen, narrow phones) |

Routes: `#/guide` (home), `#/guide/goals`, `#/guide/goal/<id>`, `#/guide/<section>`, each carrying grade
and subject like other routes.

## 5. Screens (mockups 1–7)

1. **Entry** (find page card, lesson goal chip and links).
2. **Guide home** (`#/guide`): **इस साल के लक्ष्य** on top with the first goals and their week strips, then
   “संदर्शिका कैसे काम करती है”: week, periods, reading a lesson plan, assessment and support.
3. **सप्ताह कैसे चलता है:** six-day strip by day type and the 25-week year strip (from `structure.json`).
4. **हर दिन के कालांश:** three period cards in the lesson colours (from `periodOutline`).
5. **पाठ योजना कैसे पढ़ें:** a real day plan with numbered call-outs (editorial wording, needs approval).
6. **इस साल के लक्ष्य** (`#/guide/goals`): 5–10 key goals for the grade (Math: by code family M201–M207;
   Hindi: by strand, from the guide's own list per decision 1). Each card: short title, codes, number of
   lessons, a 25-week strip with the teaching weeks in green and revision weeks 13/20 in purple, and
   “आपने N पढ़ाए” from the teacher's own marks. “पूरी निपुण सूची” opens every code and statement.
7. **एक लक्ष्य** (`#/guide/goal/<id>`): the guide's statements; the year strip; one line on how the guide
   gets there (days 1–3 teach, 4 practise/explore, 5 check with ‘मैंने सीख लिया’, 6 remedial; revision
   week); **“अगला पाठ”** (the first lesson for this goal not yet marked taught); then week rows, each with
   day chips that open the lessons and the week's objective line. Sub-goals (e.g. addition, subtraction)
   are listed in teaching order.

Sections 3–5 keep the three reading depths of plan §4a as tabs: **सार** (owner-approved summary),
**पूरा पढ़ें** (the guide's text), **मूल पृष्ठ** (page images in the existing reader).

## 6. Data: what exists, what needs approval, what needs Phases 4–5

| Need | Math | Hindi |
|---|---|---|
| Goal list and statements | Stated: NIPUN codes on guide p2 and on the lessons (`loCode`, `loStatement`) | Stated: the guide's own uncoded list p2 (decision 1); needs source-compared text |
| Goal → teaching days | **Stated** on each teaching day: e.g. G2 M202.1 = weeks 14–17, 10 lessons; 68 of 138 G2 days coded | **Not printed.** Needs a goal-to-week-block map drafted from the year plan (p15) and lesson titles, approved by the owner (Phase 4) |
| Goal → days 4–6, assessment, revision weeks | Rule “same week” (template days and the week's assessment belong to that week's goals); revision weeks 13/20 cover earlier blocks | Same rules, after the map exists |
| Short goal titles (“दो अंकों का जोड़ और घटाव”) | Editorial, owner approval | Editorial, owner approval |
| Week/day structure, periods, original pages | In release 1.1.0 | In release 1.1.0 |

## 7. Build order

| Slice | What | Ready when |
|---|---|---|
| **A** | Screens 1–4 (entry, home, week, periods) and original pages for every guide section | **Built** (31 Oct 2026): `dist/views/program-guide.mjs`, `dist/program-guide-data.mjs`, routes `#/guide`, `#/guide/week`, `#/guide/periods`, `#/guide/pages`; the goals box opens the NIPUN list page until slice G |
| **G-Math** | Screens 6–7 for Math: goals, week strips, lesson links from stated codes; progress | **Built** (31 Oct 2026) after approval of [review/math-goal-titles.md](review/math-goal-titles.md): `#/guide/goals`, `#/guide/goal/<id>`, lesson goal chips; content release 1.2.0 |
| **B** | Screen 5 (how to read a lesson plan) | After you approve the call-out wording |
| **G-Hindi** | Screens 6–7 for Hindi | After the Hindi goal-to-week map (Phase 4 task) is drafted and approved |
| **C** | Full guide text (पूरा पढ़ें), assessment and support details, activity guide | Phases 4–5 |

Build route: `site:publish` generates a small per-pack guide bundle (`dist/packs/<pack>/guide.json`: goals,
goal→lesson links with their assertion and review status, structure, section page refs) from the pinned
release, like `day-types.mjs`; a new view `dist/views/program-guide.mjs` loads it only on `#/guide…`.
Progress reads the existing completion key. Offline: the bundle is cached with the shell.

## 8. Contract changes this asks you to approve

1. New routes `#/guide…` (design contract §1).
2. Find-page goal card, lesson goal chip, day-label and “how to read” links, Help line (§3, §4).
3. New screens from existing components, with small new styles (goal cards, week strips, period cards,
   call-outs) in the protected `dist/guide-cards.css`, recorded with `design:approve`.
4. Editorial text: short goal titles, section blurbs, call-outs, labelled as summaries.

Unchanged: header, browse tabs, lesson anatomy, palette, type, touch sizes, storage keys, existing routes.

## 9. Acceptance (when built)

Every screen in Hindi and English at 320, 360 and 390 px without horizontal scroll; keyboard-only; no
lesson reachable only through the guide; nothing shown before a lesson; every goal link carries its
assertion and is hidden unless stated or approved; “अगला पाठ” and progress match the device's marks; old
routes and deep links unchanged; tests that the guide bundle is generated from the release and that each
goal's lessons equal the release's stated/approved links.

## 10. Decisions for you

1. Approve the entry points (§4) and the goals-first home (§5).
2. Approve slice A now, and the order of the remaining slices (§7).
3. Approve the short goal titles for Math G1–G3 (I will draft them from the guide's statements) and the
   “same week” rule for days 4–6 and the weekly assessment.
4. Approve starting the Hindi goal-to-week map (Phase 4 task) for your review.
5. Sign-off for editorial text: you, as for the ontology?
