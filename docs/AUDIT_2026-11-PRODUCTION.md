# Production-readiness audit: UI, UX, engineering and documentation

1 November 2026 · Claude Code · baseline: live r69 (`main` @ `f59cd45`, content 1.3.3)

The owner asked for a third-party audit of UI, UX and engineering, then an unsupervised fix phase. The request
was: a clean, standard, professional interface; one app-wide UI specification instead of page-by-page values; every
click checked against the teacher archetypes; an efficient, modular, documented codebase; and professional docs.
The TG colour references stay fixed, though the blue may shift slightly.

This document takes the place of the review step in [UI_DESIGN_NEXT_ITERATION.md](UI_DESIGN_NEXT_ITERATION.md).
The owner's message of 1 Nov 2026 ("set clear goals …, do the audit, map out tasks, execute to this plan,
unsupervised till done") is the recorded approval for the design-contract amendments listed in §5.

## 1. Goals for this phase

| # | Goal | Done when |
|---|---|---|
| G1 | **One design system.** Every colour, type size, space, radius, shadow and touch size comes from tokens in one place. | `tests/design-system.test.mjs` fails if a stylesheet uses a raw colour, font size or radius outside the token block. |
| G2 | **Professional, readable type.** A self-hosted Devanagari and Latin family, a fixed type scale and no text below 13 px. | Noto Sans (Devanagari and Latin) loads offline. The probe finds no text under 13 px. |
| G3 | **Standard, consistent controls.** Tabs, buttons, chips, cards, lists and form controls share one anatomy with visible states. | Every control maps to a component in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md). Touch targets are at least 48 px. Focus is always visible. |
| G4 | **Unbroken journeys.** Every click in the journey map works for archetypes A–F in Hindi and English, at 320/360/390 px and on desktop. | The scripted journey sweep (`tests/e2e/journeys.cjs`) passes with 0 failures. Defects in §3 are fixed or recorded as deferred with a reason. |
| G5 | **Maintainable code.** Readable source, a module map, no dead code, and shared view helpers. | Formatted CSS, a documented module map in ARCHITECTURE, and the full gate green. |
| G6 | **Professional documentation.** A docs index, PRD, architecture, design system, workflows and handoff that agree with the code. | `docs/README.md` indexes every current doc. History stays under `docs/history/`. |

Out of scope (owner-deferred or needs humans): day-5 counts, usage counts, academic review, field testing with
teachers, and physical-device/TalkBack testing. These stay listed as open in HANDOFF.

## 2. Method

- **Archetypes:** recovered from the owner's UX review doc ("Five teacher archetypes, plus the mentor"):
  - A Compliance checker
  - B Textbook loyalist
  - C Willing novice
  - D Practised adapter
  - E Multigrade juggler
  - F Mentor

  The primary stress case is the owner's low-digital-confidence, low-pedagogy-understanding, low-motivation
  teacher. This is closest to B, with C's anxiety.
- **Evidence:** Playwright screenshots of every screen at 360 px (Hindi, then English), DOM probes for route state,
  text size, touch size, overflow and console errors, a static inventory of CSS and modules, and a read-through of
  every doc.
- **What the evidence covers:** AI expert walkthroughs and automated checks. These are hypotheses about novice
  behaviour, not observed teacher behaviour (see [TEACHER_UX_AUDIT_PROTOCOL.md](TEACHER_UX_AUDIT_PROTOCOL.md)).

## 3. Findings (issue register)

Severity: **critical** = data loss, misleading teaching action or blocked core journey; **major** = repeated
confusion or a severe reading/discovery barrier; **moderate** = extra effort or inconsistency; **minor** = polish.

### UI

| ID | Where | Finding | Sev. | Fix |
|---|---|---|---|---|
| U1 | All CSS | 163 distinct hard-coded hex colours, 23 font sizes (10–25 px), 10 radii and 99 padding values across two minified one-line files. Only 12 colour tokens exist. Every screen restyles by hand. | major | Token layer (colour roles, type scale, space, radius, elevation, motion, touch) and stylesheets rewritten against it (G1). |
| U2 | Global | The system UI font gives an inconsistent Devanagari face and weight per device (Roboto/Noto on Android, Kohinoor on iOS, Nirmala on Windows), with no control over shaping and weight. | major | Self-hosted Noto Sans Devanagari and Noto Sans (variable, about 156 KB, OFL), precached for offline use. |
| U3 | Header, context and chips | 10–12 px text on tabs, the language menu, the context line, the card meta line and badges. That is too small for older teachers and low-end screens. | major | Minimum 13 px; tabs and meta at 14–15 px. |
| U4 | Header tabs | The tabs are spread across the bar with a floating dark pill for the active tab and no shared baseline. They look unlike any standard tab bar. | moderate | Standard equal-width tab bar with an underline indicator, 48 px tall, and an icon above the label on mobile. |
| U5 | Language menu | A large white native select dominates the header. | moderate | Compact header control styled as a pill ("हिन्दी ▾"). Still a native select, so it stays accessible. |
| U6 | Lesson image | The "मैं करके दिखाऊँ · संदर्शिका का चित्र ⤢" chip covers part of the I-do diagram (e.g. "26 + 13 = 26 + 10 + 3" is hidden). | major | Caption bar below the image; the enlarge icon sits on the image corner. |
| U7 | Cards | Card styles (radius 7–12 px, borders, shadows) differ between Today, Find, Guide, smart card and Saved. | moderate | One card component with variants: default, interactive and highlighted. |
| U8 | Lesson section chips | A 3×3 grid of nine equal tinted boxes repeats the smart card's step list. It is noisy and gives no sense of order. | moderate | One horizontal row of scrollable pills that keep their role colours, current-step state and visible order. |
| U9 | Buttons | Primary, secondary and link buttons vary in height, radius and weight between screens (Saved, reader, prompt, card start). | moderate | Button component: primary, secondary, tertiary/link and danger, in 48 px and 40 px sizes. |
| U10 | Week strip | Day-type labels wrap to three lines ("खोजें और जानें") in boxes about 48 px wide at 360 px. | minor | Strip scrolls horizontally with fixed 64 px days, and the label is limited to two lines. |

### UX (journeys × archetypes)

| ID | Journey | Finding | Archetypes | Sev. | Fix |
|---|---|---|---|---|---|
| X1 | Every screen | The page name appears three times: tab, context line ("आज") and H1 ("आज"). The context row adds a second back link that competes with the in-page back link. | B, C | moderate | Context row shows only grade · subject (the switch) and location; one back link per screen. |
| X2 | Saved / Help | The back link says "← सभी पाठ" or "← आज" depending on the last screen, but the tabs show no active state on these screens. Teachers lose their place. | B, C | moderate | Help and Saved highlight no tab, with a back link to the screen they came from. Verified in the journey sweep. |
| X3 | Today | The "पूरा साल" and "सभी पाठ" cards at the bottom repeat the tabs. मेरी सूची and मदद are tiny inline links. | A, B | minor | Replace them with a list of large rows: मेरी सूची, मदद. |
| X4 | Document title | Today's browser/tab title is "पाठ चुनें" ("Choose a lesson"). Shared links and history show the wrong name. | all | minor | Title follows the screen: "आज · संदर्शिका". |
| X5 | Find | Space above "▶ पाठ खोजें" is empty and the search control is right-aligned on its own line. The search looks like an afterthought. | B, D | moderate | Search becomes a full-width field at the top of सभी पाठ, with the route tabs below. |
| X6 | Lesson | The previous/next chain sits above the lesson title, so the first thing read is another lesson's long title. | B, C | moderate | Lesson title and card first; a compact previous/next pair below the card. |
| X7 | Lesson | "पाठ के विकल्प" (save, offline, text size) is a folded gear row that low-confidence teachers will not open. | B, C | minor | Kept folded (contract §4); larger tap row with a clear label. |
| X8 | Switcher | Opening the grade/subject switcher shows the full Today page under the controls. It is unclear what changes until the teacher picks. | B, E | minor | Switcher panel gets a title and a "बंद करें" action; the selects are full-width and labelled. |

No critical defects were found. Routes, deep links, missing-lesson recovery, offline reload, mark-taught with undo
and storage keys all behave correctly (sweep of 1 Nov 2026: 549/549 cards render, 0 console errors).

### Engineering

| ID | Finding | Sev. | Fix |
|---|---|---|---|
| E1 | `styles.css` and `guide-cards.css` are minified one-line files edited by hand. Diffs are unreadable and duplicate rules pile up (some selectors are defined in both files). | major | Readable, sectioned stylesheets: `tokens` → base → layout → components → screens → print. Still buildless. |
| E2 | No automated guard against hard-coded presentation values. | major | `tests/design-system.test.mjs` (token-only rule and minimum sizes). |
| E3 | `app.mjs` (61 KB) mixes routing, rendering and state for every screen. Views exist for Today, Guide and the smart card, but lesson, find, saved and help render inline. | moderate | Documented module map. New screens go in `views/`. A full split is recorded as a bounded follow-up to avoid a risky rewrite (the regression suite covers behaviour, not structure). |
| E4 | The UI regression sweep lives in a temp script, not the repo. | moderate | `tests/e2e/journeys.cjs` plus `npm run test:e2e`, documented; CI stays on unit and gate tests. |
| E5 | Fonts and new assets must be precached and versioned with release tokens. | — | Add them to the shell list in `sw.js`, bump to r70. |

### Documentation

| ID | Finding | Fix |
|---|---|---|
| D1 | No canonical UI specification. VISUAL_DESIGN.md and DESIGN_CONTRACT.md describe parts of it. | New [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md): tokens, type, colour roles, components, states and accessibility, mapped to code. |
| D2 | `docs/README.md` index predates SMART_CARDS, the audits and VERSIONING changes. | Refresh the index. Group the docs into product, design, engineering, content, process and history. |
| D3 | PRD does not mention आज, smart cards or archetypes. | Add a current-product section to the PRD and the archetypes as the canonical persona set. |
| D4 | No E2E or design-system workflow in DEVELOPMENT.md. | Add commands and the change workflow. |

## 4. Task map (executed in this order)

1. T1 Tokens and fonts: `:root` token layer, Noto self-hosted, base styles (U1–U3, E1, G1–G2).
2. T2 Components: tabs, buttons, cards, chips, lists, form controls and image captions (U4–U9).
3. T3 Screen fixes: X1–X8 and U10.
4. T4 Guards: design-system test and repo E2E journey sweep (E2, E4).
5. T5 Docs: DESIGN_SYSTEM.md, contract amendment, PRD, ARCHITECTURE module map, DEVELOPMENT, docs index (D1–D4, E3).
6. T6 Release: r70, full gate, E2E, PR to `next`, release PR to `main`, verify Pages, HANDOFF.

## 5. Design-contract amendments (owner-approved 1 Nov 2026, chat)

- §6 type: Noto Sans Devanagari / Noto Sans (self-hosted) replaces the system UI font. Body stays 17 px / 1.65 and
  headings stay 28/23/19. The new minimum text size is 13 px.
- §2 shell: tabs and the language menu keep their order and IDs and are restyled as a standard tab bar.
- §4 lesson anatomy: the previous/next line moves directly below the smart card. Section chips become one
  scrollable row.
- §5 palette: values are unchanged. Semantic tokens are added on top, and source-card overrides use tokens.

## 6. Results (r70)

| Finding | Status |
|---|---|
| U1–U3, E1, E2 | **Fixed.** Token layer of 72 tokens; both stylesheets are readable and token-only (0 raw colours, px font sizes or px radii outside `:root`). Noto self-hosted and precached. 13 px floor. Guarded by `tests/design-system.test.mjs`. |
| U4, U5 | **Fixed.** Standard tab bar with icons and a yellow current indicator; language pill. Icons drop below 360 px so the three labels fit at 320 px. |
| U6 | **Fixed.** Captions sit below every illustration. |
| U7, U9 | **Partly fixed.** Canonical button, list-row, link-chip and search-field components. Card variants still carry some screen-specific rules (follow-up: fold them into the component layer). |
| U8, U10 | **Fixed.** Section chips are one ordered, scrollable row. The week strip scrolls with fixed tiles. |
| X1, X2, X4 | **Fixed.** No duplicate location or back link on top-level screens; titles name the screen. |
| X3, X5, X6 | **Fixed.** List rows on आज; search field first on सभी पाठ; previous/next pair below the card. |
| X7, X8 | **Partly fixed.** The switcher keeps its controls open after a grade change (new finding X9: grade then subject needed two openings). The "पाठ के विकल्प" row is unchanged (contract §4). |
| Grade switch target (new) | **Fixed.** `#current-identity` was 35 px tall; it is now 48 px. |
| Hindi period count (new) | **Fixed.** Cards said "तीन कालांश" on two-period days; they now use the real count. |
| C1 OCR vowel signs (new) | **Open.** 150 strings with detached matras now show dotted circles in Noto. Listed in [review/ocr-matra-defects.md](review/ocr-matra-defects.md) for source-compared repair. |
| E3 | **Recorded.** Module map and extraction plan in ARCHITECTURE; `app.mjs` split deferred to bounded slices. |
| E4, E5 | **Fixed.** `npm run test:e2e` (594 checks); fonts in the worker shell; r70. |
| D1–D4 | **Fixed.** DESIGN_SYSTEM, WORKFLOWS, personas in the PRD, refreshed index, AGENTS, DEVELOPMENT, QA gates UI-05 and UX-01. |

Still open and needing humans: a real-teacher study (protocol), TalkBack and low-end phones, academic review.
