# Program guide in the app — plan and design proposal

Status: **proposal for the owner's design approval**, 31 October 2026. Nothing is built.
Mockups: [docs/design/program-guide/index.html](design/program-guide/index.html) (open through a
local server from the repository root, e.g. `python3 -m http.server 8766`, then
`http://localhost:8766/docs/design/program-guide/`). This is the program-guide slice of plan
Phase 6 ([CONTENT_ARCHITECTURE_PLAN.md §4a](CONTENT_ARCHITECTURE_PLAN.md)).

## 1. The problem

Each Teacher Guide opens with about 18 pages that explain the whole program: the NIPUN learning
outcomes (p2), how to use the guide (p7–8), the year plan by week blocks (p15), the weekly cycle
(p16), materials (p17) and the three periods (p18), plus teacher articles; the back has the
activity library, weekly assessment and remediation. Today the app shows only the day plans.
A teacher can follow a day without knowing why day 6 is different, what “कालांश 2 एवं 3” means,
which outcome the week builds, or how to read a plan's steps, timings and colours.

## 2. What a teacher should be able to answer

In the order a teacher asks (plan principle 7):

1. **How does my week run?** Which days teach new skills, which revise, which assess; which weeks
   are revision weeks or school readiness.
2. **How does my day run?** The three कालांश, what each is for, how long, with what materials.
3. **How do I read a lesson plan?** Badge, section chips, period bands and their colours, step
   numbers, minutes, “बच्चों से पूछें”, worksheet, remedial time, weekly templates (Math days 4–6).
4. **What are the children learning?** The grade's outcomes by strand (Hindi) or code family
   (Math), and in which weeks they are taught, revised and assessed.
5. **How do I check, and what if a child is behind?** The weekly assessment, groups A and B,
   remedial work.

## 3. Principles (unchanged contract)

- **Never a gate.** No screen is put in front of a lesson. Topic → summary → lesson and
  week → day → lesson stay exactly as they are.
- **Source first.** Every section shows the guide's own text and its original page. Plain-language
  summaries are editorial: shown only when owner-approved (`review: owner-approved`), always labelled
  “सार · संदर्शिका से” and citing the source page.
- **Same components.** Banner, cards, chips, period colours (amber teaching, pink practice, purple
  support), source pages in the reader. One shared view for every subject and grade; the content
  comes from the pinned content release, never typed into the app.
- **Honest gaps.** Where the model does not yet hold something (outcome→week links for Hindi,
  activity library, assessment details), the section shows the original pages only.

## 4. Where the guide appears (entry points)

| Entry | What the teacher sees | Proposal |
|---|---|---|
| Find page | One card below the two browse tabs: “📘 संदर्शिका को समझें — सप्ताह, कालांश, पाठ योजना और सीखने के प्रतिफल” | **Recommended** |
| Lesson | The day label added on 31 Oct (“· साप्ताहिक आकलन”) becomes a link to that day type in the guide; a small “यह पाठ योजना कैसे पढ़ें?” link under the chips | **Recommended** |
| Help (मदद) | A line linking to the guide | **Recommended** |
| Header | A fourth header link “संदर्शिका” | **Not recommended** (header is frozen, phones are narrow) |

New route: `#/guide` (and `#/guide/<section>`), carrying the current grade and subject.

## 5. Screens (mockups 1–6)

1. **Guide home** (`#/guide`): banner “कक्षा 2 · हिन्दी · संदर्शिका को समझें”; five section cards in the
   question order: सप्ताह कैसे चलता है · हर दिन के कालांश · पाठ योजना कैसे पढ़ें · सीखने के प्रतिफल ·
   आकलन और सहायता. Each card says which guide pages it comes from.
2. **सप्ताह कैसे चलता है:** a six-day strip coloured by day type (दिन 1–4 नई दक्षताएँ, दिन 5 पुनरावृत्ति,
   दिन 6 साप्ताहिक आकलन, with “कालांश 2 एवं 3 मिलाकर” on day 6) and a 25-week year strip (कक्षा-1 की
   पुनरावृत्ति 1–4, शिक्षण, सावधिक पुनरावृत्ति 13 और 20). Tapping a day opens that day's lesson in the
   teacher's current week. Data: `structure.json` (exists).
3. **हर दिन के कालांश:** three period cards in the period colours: number, 40 मिनट, focus, materials,
   and the “अंतिम 20 मिनट रिमीडियल (दिन 1–5)” note. Math shows its कालांश and the weekly phases
   (अनुदेशात्मक कार्य, समेकन और आकलन, रिमीडियल और पुनरावृत्ति). Data: `periodOutline`, day types (exist).
4. **पाठ योजना कैसे पढ़ें:** a real day plan from the teacher's grade, shown with numbered call-outs:
   ① सप्ताह/दिन badge ② section chips ③ period band and colour ④ step and minutes ⑤ “क्या करें”
   ⑥ “बच्चों से पूछें” ⑦ worksheet ⑧ remedial step ⑨ मूल पृष्ठ. Math adds बातचीत → मैं करूँ → हम करें
   → आप करो → अभ्यास → खेल, and explains weekly templates. Data: lesson views (exist); the call-out
   wording is editorial (needs owner approval once).
5. **सीखने के प्रतिफल:** the grade's list by strand (Hindi: मौखिक भाषा, पढ़ना, लेखन, from the guide's own
   list per decision 1) or code family (Math: M201…); each outcome shows “इन सप्ताहों में” chips that
   open the week view. Data: outcomes and outcome links — **Phases 4–5** (Math codes on lessons are
   already stated; Hindi week links are rule-derived and need approval).
6. **आकलन और सहायता:** the weekly assessment (Hindi day 6, Math day 5), how groups A and B are formed,
   and the remedial plan; original pages. Data: assessments — **Phases 4–5**; until then original pages.

Every section has the three reading depths of plan §4a, as tabs: **सार** (owner-approved summary),
**पूरा पढ़ें** (the guide's text, source-compared), **मूल पृष्ठ** (page images in the existing reader).

## 6. Data and build plan

| Slice | Screens | Needs | Ready? |
|---|---|---|---|
| A | 1, 2, 3 and the original pages of every front-matter section | `structure.json`, `sections.json`, page images | Yes, in release 1.1.0 |
| B | 4 | Lesson views (exist) + editorial call-outs | Needs owner approval of the call-out text |
| C | 5, 6 and “पूरा पढ़ें” text | `outcomes.json`, `assessments.json`, `guide/<grade>.json` passages (source-compared) | **Phases 4–5** |
| D | Activity guide (routine library), stories/poems | `routines.json`, resources | Later |

Build route: `site:publish` generates a small per-pack guide bundle (`dist/packs/<pack>/guide.json`)
from the pinned release (as it already does for `day-types.mjs`); a new view `dist/views/program-guide.mjs`
renders it and loads only on `#/guide`. Offline: the guide bundle is cached with the shell; page images
follow the existing “बिना इंटरनेट के लिए रखें” rule. No new dependency or build step.

## 7. Contract changes this asks you to approve

1. New route `#/guide` and `#/guide/<section>` (design contract §1 route list).
2. The find-page entry card, the lesson's day-label link and “पाठ योजना कैसे पढ़ें?” link, and a Help line
   (contract §3, §4).
3. New screens built from existing components, plus small new styles for the week strip, the period
   cards and the numbered call-outs (protected `dist/guide-cards.css`; recorded with `design:approve`).
4. Editorial text: the section card blurbs and the lesson-plan call-outs, labelled as summaries.

Unchanged: header, browse tabs, lesson anatomy, palette, type, touch sizes, storage keys, routes.

## 8. Acceptance (when built)

Every screen in Hindi and English at 320, 360 and 390 px without horizontal scroll; keyboard-only;
no lesson reachable only through the guide; guide never shown before a lesson; every text block cites
its page; unapproved summaries hidden; offline guide after first visit; old routes and deep links
unchanged; tests for the guide bundle (generated from the release, hash-checked) and the view.

## 9. Decisions for you

1. Approve the entry points (§4) and route `#/guide`.
2. Approve the five sections and their order (§5).
3. Approve building slice A now, B after you approve the call-out text, C after Phases 4–5.
4. Who signs off editorial summaries and call-outs (you, as for the ontology?).
