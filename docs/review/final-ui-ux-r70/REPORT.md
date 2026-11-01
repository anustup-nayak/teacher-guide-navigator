# Independent final UI/UX check — r70

1 November 2026 · Codex · review only

## Verdict

The sampled core journeys work and r70 has a much more consistent visual foundation. The card and detailed lesson are connected correctly in the two lessons checked: tapping a summary opens and focuses the corresponding teaching phase. **A clean final sign-off is withheld:** teaching text is visibly corrupted, the summary does not respect the reading-size setting, and the existing E2E coverage claim needs stronger assertions. No application changes or deployment were made during this review.

This is an expert walkthrough and test-source review, not observation of real teachers. It does not certify all 549 cards, all workflows, WCAG conformance, physical phones or offline readiness.

## Baseline and independent verification

- Production: https://anustup-nayak.github.io/teacher-guide-navigator/
- Reviewed checkout: main `0bce1626b3785fae37b799977cea5320ceec8978`, runtime release commit `9259ec807eff4a4e49e89c161cd4696a0469274f`, r70, content 1.3.3.
- Six fetched production files match the checkout byte for byte: index.html, styles.css, guide-cards.css, app.mjs, sw.js and lesson-cards.mjs.
- Independent `npm test`: **143 passed, 0 failed**. Initial sparse-checkout failures were missing local source assets; restoring 1,979 unchanged tracked assets resolved them without code changes.
- Claude's recorded E2E result is 594 checks / 0 failures. That browser suite was **not rerun** in this review. Its assertions were inspected; see F3.
- Browser checks used the actual deployed app. Phone viewport 360×800; sampled Math lesson also checked at widths 320, 390 and 1024. Hindi UI and English navigation were checked. No document-wide horizontal overflow in those sampled lesson layouts; the Math lesson's images were loaded at all three additional widths.

## Findings for Claude

### F1 — High: corrupted detailed teaching instructions

**Reproduce:** Mathematics, Grade 2, week 14 day 1, open “मैं करूँ”, then “हम करें” and “बच्चे करें”. Route: `?curriculum=up-math-2026&grade=2&ui=hi#/lesson/g2-math-w14-d01/teach/1`.

The card correctly says `26 + 13`, but the detailed instructions say `26 $ 13`, `26 $ 13 = 39`, and `35 $ 12`. Independent work includes `38 $ 9, 25 $ 13, 27 $ 20`. Questions include `गिनलडी़ पर कानै-सी सख्ंया पहल ेदख्ेाी?` and `क्या जाडे ़बडी़ सख्ंया स ेशरूु किया?`.

This damages the actual instructional script and trust in the summary/detail relationship, particularly for B (textbook loyalist) and C (willing novice). It is not a font-loading problem. The existing [OCR inventory](../ocr-matra-defects.md) records 150 suspect strings, not necessarily 150 distinct lessons; symbol substitution needs review too.

**Repair:** compare affected text against original source pages, correct the source extraction/content model, regenerate through the normal pipeline, and verify both summary and detail. Avoid global character replacement without source comparison. Add targeted meaningful regression checks for repaired examples. Do not represent the full corpus as academically validated.

Evidence: [detail screenshot](evidence/03-detail-content-defects.png). Browser DOM independently confirmed the exact strings above.

### F2 — Medium: summary card ignores reading enlargement

**Reproduce:** same Math lesson → lesson options → text size 200%.

Computed detail list text becomes **34px**, while `.card-line` remains **15px**. No page overflow was observed at 360px. The teacher's first summary remains small after they request larger reading text. This is a product accessibility gap; this check alone does not establish a WCAG failure because browser zoom and the app's reading preference are different mechanisms.

**Repair:** apply the reading preference consistently to essential summary text and period bands, preserve wrapping and usable links at 320/360px, and check both Math and Hindi cards plus keyboard navigation. Restore the selected preference on reload. Audit screenshot: [200% state](evidence/04-large-text-360.png); it records the viewport, while the computed measurements above establish the mismatch.

### F3 — Medium: E2E assertions can report false confidence

In `tests/e2e/journeys.cjs`, the subject-switch assertion ends with `|| true` (line 74 at this baseline), so it always passes. The actual Grade 2 Math/Hindi switch worked in this review, but the test would miss a regression.

The 549-card loop (line 97) waits for the URL to contain an ID and for the number of card lines/bands to match. Consecutive cards can have equal counts, allowing the previous rendered DOM to satisfy the wait after the hash changes. It does not reliably establish that the requested card rendered.

**Repair:** remove the unconditional pass; assert selected subject and rendered curriculum. For every card, wait for a rendered identity/title tied to the requested lesson and assert expected content, not only line count. Assert image completion where expected. Add guide `periods`/`pages` routes and 200% reading mode to the matrix. A workbook-link check is not a successful workbook-reader journey; assert the loaded page too. Treat 594 as an assertion count, not 594 teacher workflows or independent certification.

## Confirmed working in this walkthrough

| Journey | Observed result |
|---|---|
| Multigrade switch (E) | Grade 1 Hindi → Grade 2 Hindi → Grade 2 Math. Panel stayed open after grade change; actual context and lesson changed correctly. |
| Find a lesson (B/D) | Search is visible at the top. Searching `जोड़` returned 52 relevant results; opened Grade 2 Math week 14 day 1. |
| Math summary → detail (C) | “मैं करूँ” opened `/teach/1`, scrolled to the phase, and focused “मैं करके दिखाऊँ”. |
| Hindi period → detail (C) | Grade 1 Hindi week 9 day 1, period 2 opened `/teach/3` and focused “गतिविधियों की संकल्पना पर कार्य”. All images subsequently loaded. |
| Workbook (A/B/C) | Math workbook page 61 loaded at natural width 1132; zoom changed 100% → 125%. Escape closed the reader and returned focus to “कार्यपत्रक खोलें”. |
| Math goal (D/F) | Goal link opened M202, with weeks, day links and next-lesson link rendered. |
| Hindi year/period explanation | Year overview and daily-period page loaded, with three 40-minute periods and original-source-page action. |
| Language and responsive reading | English navigation changed correctly while source teaching content remained Hindi. Sampled lesson had no page overflow at 320/360/390/1024; detail text enlarged at 200%. |

The updated Noto typography, consistent blue header, captions below illustrations, clear search label and grade/subject context improve visual coherence. [Hindi card screenshot](evidence/05-hindi-card-360.png) shows the current hierarchy; this is not an endorsement of every screen's contrast, spacing or typography.

## Teacher-centred follow-up risks

- **B/C primary stress profile:** the warm Today screen stacks the last-opened completion question and the weeks 1–8 readiness notice above the first lesson action. At 360×800 the lesson CTA falls below the first viewport. Investigate whether a low-motivation teacher recognizes the next action quickly. This is an expert usability hypothesis, not a proven task failure. [Screenshot](evidence/01-today-hi-360.png).
- **C:** Hindi summary bands are dense, with several actions separated by arrows. The phase links work, but a teacher still needs the detailed script. Test whether they understand “summary” versus “complete instructions”, and can return to their place without help.
- **D/F:** Hindi year overview explicitly says goal-to-week/lesson links will arrive in the next stage. This is a visible scope limitation, not a broken link. Math goal navigation is further developed.
- **A–F:** no fresh independent retest here of bookmarks, note persistence, taught/undo, full offline preparation, update recovery, missing-lesson recovery, printing, all assessment/template variants or all six grade/subject pairs. Those remain explicit coverage gaps, not inferred passes.

## Handoff and acceptance

1. Repair F1 with source evidence, then verify the same displayed lesson and expand the OCR/symbol inventory.
2. Resolve F2 through the design tokens/component styles with required design approval where applicable; verify phone wrapping and preference persistence.
3. Strengthen F3 before relying on full-card coverage; rerun the corrected release suite and retain rendered-identity evidence.
4. Run the [teacher audit protocol](../../TEACHER_UX_AUDIT_PROTOCOL.md) against canonical PRD archetypes A–F, especially B with C's anxiety: find today's lesson, identify materials, explain the first action, open workbook, recover from navigation, mark taught, resume next day, switch grades and use a prepared lesson offline. Record unaided completion, wrong turns, comprehension, requests for help and abandonment.
5. Physical low-end Android/TalkBack, browser text enlargement/zoom, contrast measurement, offline source-page access and printing need separate evidence. Do not label the app “bullet proof” based on this walkthrough.

No release tag, source repair, teacher data edits or production deployment was performed. Text-size preference was restored to normal, language to Hindi, and temporary viewport overrides were reset. Navigation can update the app's normal last-opened context. The earlier `task/ui-ux-audit-r69` starter remains preserved and is superseded by this r70 review.
