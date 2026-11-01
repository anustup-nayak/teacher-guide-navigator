# Sandarshika design system

Canonical UI specification, adopted on 1 Nov 2026 in r70. It came from the
[production audit](AUDIT_2026-11-PRODUCTION.md) and the owner approved it in chat.
[DESIGN_CONTRACT.md](DESIGN_CONTRACT.md) freezes the flow and the meanings. This document says how every screen
looks and how to build a new one. Code is the source of truth for values: the `:root` block of
[`dist/styles.css`](../dist/styles.css). Tables here describe the tokens; if they ever disagree, fix this file.

## 1. Principles

1. **Hindi first, legible at arm's length.** Rural UP teachers read on low-end phones in classrooms with glare. Body text
   is 17 px with 1.65 line height, nothing is smaller than 13 px, and contrast meets WCAG AA.
2. **One obvious next action per screen.** For example "पाठयोजना खोलें", "पाठ शुरू करें" or "हाँ, पढ़ा दिया". Secondary
   actions are quieter (outline buttons, list rows, link chips).
3. **The guide's own colours carry meaning.**
   - Blue: navigation and the app.
   - Amber: teaching (conversation, I do, we do).
   - Pink: practice.
   - Purple: support.
   - Green: progress.
   - Yellow: questions to ask children.

   Never use these colours for decoration.
4. **Order is visible.** Steps, periods and days always show their number and sit in sequence (horizontal and
   vertical following, [UX_REVIEW_2026-11.md](UX_REVIEW_2026-11.md)).
5. **Tokens, not values.** Rules and views use tokens. `tests/design-system.test.mjs` fails on a raw colour, a px
   font size or a px radius outside `:root`, and on inline style values in views.

## 2. Tokens

### Colour

Palette ramps keep the Teacher Guide references at their 500 step. Components use **semantic** tokens.

| Semantic token | Ramp | Use |
|---|---|---|
| `--color-brand` | `--blue-500` `#286f99` | App bar, links, selected states |
| `--color-brand-strong` | `--blue-700` `#174d6c` | Primary buttons, link text, headings on tint |
| `--color-brand-subtle` | `--blue-50` | Hover and selected backgrounds |
| `--color-ink` / `--color-text` / `--color-text-muted` | neutral 900 / 700 / 500 | Headings / body / meta |
| `--color-bg` / `--color-surface` / `--color-surface-sunken` | neutral 50 / white / neutral 100 | Page / cards / captions and wells |
| `--color-border` / `--color-border-strong` | neutral 300 / 400 | Card and field borders |
| `--color-teaching` (+`-subtle`) | amber 500 / 50 | Conversation, I do, we do |
| `--color-practice` (+`-subtle`) | pink 500 / 50 | Worksheets, you do |
| `--color-support` (+`-subtle`) | purple 500 / 50 | Remedial and support |
| `--color-progress` (+`-subtle`) | green 500 / 50 | Taught marks, goals |
| `--color-question` | yellow 500 | Question strip, active-tab indicator |
| `--color-danger` | red 500 | Destructive confirmations only |
| `--color-focus` | `#854900` | Focus ring (3 px) |

The legacy names `--blue`, `--ink`, `--muted` and so on remain as aliases for older selectors. Do not use them in new code.

### Type

- Family: `--font-sans` is self-hosted **Noto Sans Devanagari** with **Noto Sans** for Latin (variable woff2,
  156 KB together, OFL licence in `dist/fonts/OFL.txt`). Both are precached by the service worker.
- Fallbacks: system-ui, then Roboto.

| Token | Size | Use |
|---|---|---|
| `--fs-1` | 13 px | Meta, badges, captions, chips (minimum) |
| `--fs-2` | 15 px | Secondary text, labels, tabs, buttons |
| `--fs-3` | 17 px | Body, list titles |
| `--fs-4` | 19 px | h3, card titles, brand |
| `--fs-5` | 23 px | h2 |
| `--fs-6` | 28 px | h1 |

Line heights are `--lh-tight` 1.3 (controls), `--lh-snug` 1.45 (meta) and `--lh-body` 1.65 (reading). Weights are 400, 500,
600 (labels), 700 (headings, primary actions) and 800 (rare display). The text-size control scales lesson text up to 200%.

### Space, shape, elevation, motion

- **Space:** a 4-point grid. `--space-1` 4 · `-2` 8 · `-3` 12 · `-4` 16 · `-5` 20 · `-6` 24 · `-8` 32 · `-10` 40 ·
  `-12` 48 · `-16` 64. Card padding is 16. Gaps between cards are 12–16. Gaps between sections are 24–32.
- **Radius:** `--radius-xs` 4 · `-s` 8 (buttons, fields) · `-m` 12 (cards) · `-l` 16 (sheets) · `-pill`.
- **Elevation:** `--shadow-1` for resting cards, `--shadow-2` for raised panels, `--shadow-up` for bottom bars. Prefer
  borders to shadows.
- **Motion:** `--motion-fast` 120 ms and `--motion-base` 200 ms, for colour and opacity only.
  `prefers-reduced-motion` turns motion off.
- **Touch and layout:**
  - `--touch-min` 48 px for every primary control, `--touch-compact` 40 px for chips.
  - `--container` 760 px.
  - `--header-height` 56 px, `--tabs-height` 48 px.

## 3. Layout

- One centred column (`--container`) with 16 px page gutters. Up to 719 px it is single-column. From 720 px
  the brand, tabs and language sit in one header row, and lesson pages use wider cards.
- **Sticky regions:** the context bar (grade · subject switch) and, on lessons, the section-chip row. Nothing else is
  sticky.
- **Breakpoints:** 359 px (narrow phones: tab icons hidden), 380, 480, 699/720 (header layout) and 1000 (desktop).

## 4. Components

These rules live in the component layer at the end of `dist/guide-cards.css`.

| Component | Anatomy and variants | States |
|---|---|---|
| **App bar** (`.site-header`) | Brand mark and name · language pill (`#ui-language`, native select) · three equal tabs (icon + label) | Tab hover tint; current tab bold with a 3 px yellow indicator (`aria-current=page`); focus ring in yellow on blue |
| **Context bar** (`#current-context`) | Grade · subject switch (48 px) · optional back link and location (lessons, find, saved only) | Expanded switcher (`aria-expanded`), grade and subject selects |
| **Button** (`.button`) | Default (outline), `.primary` (filled brand-strong) | Hover subtle tint; disabled 50% opacity; focus ring |
| **Card** | Surface, 1 px border, radius-m, 16 px padding. Variants: lesson card, today-next (2 px brand border), goal (progress tint), smart card | Interactive cards change border on hover |
| **Smart card** (`.smart-card`) | Context line → title → goal → image with caption bar → step lines or period bands → prep → start button → previous/next | Each line links to its step |
| **Illustration** (`.artwork-button`) | Picture, then a caption bar below with an enlarge icon. The caption never overlays the picture | Hover border; opens the reader dialog |
| **Section chips** (`.section-chips`) | One scrollable row of pills in source order, coloured by role | Current section filled (`aria-current=location`) |
| **List row** (`.list-row`) | Icon circle · title + description · chevron (64 px). Used for secondary destinations | Hover subtle tint |
| **Link chip** (`.link-chip`) | Pill, 40 px, for a pair of small destinations (My list, Help on Find) | Hover tint |
| **Search field** (`.search-field`) | Visible label above a 48 px field | Focus border brand |
| **Week strip** (`.today-days`) | Fixed tiles at least 64 px wide, scrolling sideways; day number + type (two lines maximum) | Taught (green tick), next (dark border, `aria-current=step`) |
| **Reader** (`dialog#reader`) | Header with title and "पाठ पर लौटें" · zoom · page · actions | Escape and Back close it; focus returns to the trigger |
| **Toast** (`#toast`) | Polite live region | — |

New screens reuse these. If a source cannot be shown with them, propose a new component first (AGENTS.md).

## 5. Accessibility rules

- Contrast is at least 4.5:1 for text and 3:1 for large text and control borders. Brand-strong on white is 9:1. White on
  brand is 5.5:1. Muted text on the page background is 5.1:1.
- Every interactive element is at least 40 px tall (48 px for primary controls) and has a visible focus ring.
- The skip link comes first, there is one `h1` per screen, and the document title names the screen.
- Icons are decorative (`aria-hidden`) and labels are always visible. Nothing depends on hover.
- There is no horizontal page scroll at 320, 360 or 390 px. Chip rows and the week strip scroll inside themselves.

## 6. Changing the design

1. Change or add a **token** first, then use it. Never put a raw value in a rule or a view.
2. Protected files (`styles.css`, `guide-cards.css`, `index.html`) need the owner's approval in chat. Record it
   with `npm run design:approve -- --reason … --approved-by …` and add a HANDOFF entry.
3. Run `npm test` (includes the design lock and the design-system guard), then `npm run test:e2e` against a local
   server. Check screenshots at 320 and 390 px in both languages.
4. Update this document and, if a frozen item changed, [DESIGN_CONTRACT.md](DESIGN_CONTRACT.md).

## 7. Verification (r70)

- `tests/design-system.test.mjs`: token-only rules, readable stylesheets, defined variables, 13 px floor, 48 px
  touch token, fonts precached.
- `npm run test:e2e`: 594 checks, 0 failures. It covers:
  - routes × {320, 360, 390, 1024 px} × {हिन्दी, English}: overflow, console errors, text under 13 px, targets under
    40 px;
  - archetype journeys A–F;
  - all 549 smart cards;
  - offline with fonts.
- Not proven by automation: real-teacher comprehension, TalkBack and physical low-end devices
  ([TEACHER_UX_AUDIT_PROTOCOL.md](TEACHER_UX_AUDIT_PROTOCOL.md)).
