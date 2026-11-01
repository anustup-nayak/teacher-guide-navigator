# UX review of the whole app, November 2026

The full review, with screenshots, archetypes, the audit table and the owner's answers, is a Claude doc:
[Sandarshika: a UX review of the whole app](https://claude.ai/artifact/7SFoVEEQGDYgdgQn8d9QJ2) (owner's account).
This file records what the repository needs from it.

## The behaviour the app must build

- **Horizontal following:** teachers follow the guide's scope and sequence of learning outcomes, week by week and
  day by day, so each concept builds on the last.
- **Vertical following:** teachers follow a lesson's steps in order, so children master each step.
- **What happens instead:** most teachers don't open the guide, or open a random page and lift one activity.
  Lesson plans are dense (Math: 6 steps, about 32 instructions, 440 words; Hindi: 7–8 steps, 370 words).
- The government recruits and trains teachers, unevenly; CSF has no role. The app must teach the habit itself.

## Owner decisions (1 Nov 2026)

| Question | Decision |
|---|---|
| Header | Three tabs **आज · पूरा साल · सभी पाठ** (approved; built in r65) |
| “अगला पाठ” | The next lesson **in the guide's order** |
| Day-5 counts of children needing help | Later, as part of planning and delivering through the app |
| Weeks 1–8 (school readiness) | **Show school readiness** (built in r65 as a note on आज and a week option) |
| On-device usage counts | Acceptable; keep simple; add later |
| `main` on r61 or ship r63/r64 | Depends on the rest |
| Smart cards | Owner approves the text; card first, step chips below; header image from I do / We do; samples for Math G2–3 and Hindi G1–2, then all. See [SMART_CARDS.md](SMART_CARDS.md) |
| “Work all the other enhancements other than smart cards” | Built in r65 (below) |

## Built in r65 (branch `task/today-home`)

| Change | Where |
|---|---|
| `#/today` (आज) is the home and default route: next lesson in order, “did you teach it?” prompt (once a day, stops after three “not yet”), this week's six days, goal line with position, school-readiness note, links to पूरा साल and सभी पाठ | `dist/views/today.mjs`, `dist/domain/progress.mjs`, `dist/app.mjs` |
| Header tabs आज · पूरा साल · सभी पाठ; मेरी सूची and मदद linked from आज and सभी पाठ; routes `#/saved`, `#/help`, `#/find` unchanged | `dist/index.html`, `dist/app.mjs` |
| Grade and subject controls open from the context chip instead of always showing | `dist/index.html`, `dist/app.mjs` |
| Lesson banner shows the goal and the lesson's position (“पाठ 1 / 6”); a previous/next line under it; text size, list, offline and the week guide folded into “पाठ के विकल्प” | `dist/app.mjs`, `dist/guide-cards.css` |
| End of lesson: goal progress and “अगला: सप्ताह · दिन →” once marked taught; the toast reports goal progress | `dist/app.mjs` |
| Year view: plain words before NIPUN codes, a legend, the teacher's own position marked, no internal process wording | `dist/views/program-guide.mjs` |
| The find screen no longer carries the guide box | `dist/app.mjs` |

Not done, deliberately: smart cards (next); day 4–6 cards (with smart cards); loading only the chosen subject's
lesson data (first load fetches both catalogs, about 0.8 MB compressed); keeping this week offline automatically;
multigrade view.
