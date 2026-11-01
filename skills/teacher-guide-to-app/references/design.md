# Source-led design for novice government-school teachers

In this repository the released design is frozen by `docs/DESIGN_CONTRACT.md` and
enforced by `tests/design-lock.test.mjs`. The guidance below explains the design
and applies when building it for a new product; for this app, propose changes to
protected elements to the owner instead of applying them directly.

## Design from actual source families

Compare cover/identity, representative teaching pages, worksheets, review pages
and every weekly-template variant. Record palette, typography, heading/time
bands, calendar labels, teacher/group icons, question cues, illustration positions
and pedagogical relationships. Inspect the actual source images; extracted text
cannot reveal this visual grammar. Build a representative card, validate it in
context, then extend by source family and explicit exceptions.

Preserve the PDF's recognizable identity while reflowing for a phone. Do not
flatten the whole guide into miniature screenshots, and do not redraw mathematical
illustrations with generative imagery. Authentic pictures, speech bubbles and
numerals matter. Full source pages remain accessible as fidelity references.

UP examples, not universal themes: Grades 1/2 use blue identity, amber teaching,
pink practice and purple support; Grade 3 uses yellow and blue/dark-blue. Weekly
variants have charcoal/beige, terracotta and green. Readable foreground contrast
may require deviating from printed white-on-colour. Put a new source's palettes
and overrides in pack metadata, not grade-based assumptions scattered in CSS.

## Discovery and teaching flow

- Class → topic → summary card → full lesson; also class → week/day → the same
  record. Avoid single-child subtopic gates and mandatory preparation entrances.
- A summary communicates a complete title, accurate gist/materials/resources,
  week/day, and whether it is a weekly outline requiring preparation. Avoid
  truncated grammar and first-person demo fragments. A weekly plan is not blank
  content to be filled with invented I do/We do/You do sections.
- Ordinary cards open overview. A clearly separate class-scoped “last opened
  lesson” resumes. Reading a lesson does not assert that it was taught.
- Keep preparation, all source phases, notes and references in one scrollable
  sequence. Wrapping chips expose the whole learning loop; the active chip follows
  reading. Sticky context shows grade/week/day and correct list/My list return.
- Preserve source teaching periods as the top-level grouping. Smaller Step labels
  explain phase order. Show source-verified durations/splits, not universal timing.
- Keep actual actions, relevant questions and source understanding checks together.
  Link remedial guidance back to the relevant guided/independent activity.

## Card composition

1. Source-coloured band: phase name, source period, meaningful duration.
2. Original instructional illustration, with a visible “चित्र बड़ा करें” action.
3. Readable “क्या करें” directions and list structure reflecting the source.
4. Relevant questions in a distinct question strip; source assessment/support
   where supplied, without duplicate boilerplate.
5. Actual worksheet preview/task in practice, or honest notebook alternative.

Preparation is a compact set of labelled material/prior knowledge/vocabulary/
misconception blocks, plus relevant learning goal/checks. Remove exact title/goal
and repeated weekly objective duplication. Consolidate six identical source links
into a discoverable Sources area. Keep a reassuring manual note Save beside autosave.

On desktop, artwork and directions can share columns. On phones, flow text around
then below art when useful; at 320px or large text, stack the art above directions.
The original 320px/200% implementation squeezed text into a sliver beside an image:
that is a regression to test, not an acceptable compact card. Do not remove
instructions, shrink meaningful labels to microtext, stretch worksheets or leave
an empty image column solely to maintain symmetry.

Reserve image geometry to limit layout shifts. Preserve natural worksheet aspect
ratios. Load page assets lazily, reuse original page URLs and deduplicate offline
assets. Disable unsuitable crops with an explicit override rather than force an
unhelpful thumbnail into every phase. A source excerpt is labelled as such;
shared Grade-3 art must not pretend to be a separate source drawing.

## Meaning, action and reversal

| Intent | UI contract |
|---|---|
| Remember a lesson | My list / मेरी सूची; bookmark, not an offline claim |
| Prepare for no internet | Keep for offline use; progress, checked readiness, retry/removal |
| Obtain a portable file | Download current page as a file; state actual format |
| Make paper copies | Current-page preview before printing; return to the same page |
| Record teacher preparation | Contextual preparation note on weekly outlines |
| Mark teaching done | Explicit teacher action, adjacent status/undo, no jump to top |
| Inspect a picture/book | Visible enlargement, zoom, full-page context, Back/close/focus return |
| Get help/report content | Optional help; context-attached details file, no automatic message |

Labels must match actual resource availability. “Workbook practice” is wrong for
a lesson without a supplied sheet. Avoid directional text such as “below” when
jumping/reflowing can change the relationship; name/link the target section.
Printed page 7 must remain page 7 inside the reader even if it is PDF image 9.
Unknown page identities remain explicit. Full-book browsing is secondary to the
relevant verified source page. Do not invent textbook page offsets.

## Language, accessibility and trust

Use clear Hindi for the local teacher and maintain English UI labels consistently.
State the source lesson language separately; English menus do not translate the
source. Keep text labels as well as colour/icon cues. Use semantic headings,
landmarks, explicit names, keyboard-operable controls, visible focus and live
status messages. Sticky navigation must not obscure focused headings/actions.

Meaningful illustrations need descriptions or genuinely equivalent adjacent text
for the instructional relationships; a generic alt label naming the section is
not proof of equivalence. Check speech bubbles, counting quantities, spatial
relations and diagrams against the source. A geometry/load test cannot establish
that a blind teacher has equivalent teaching information.

Aim for comfortable ~44px primary targets and readable metadata. WCAG AA minimum
target rules and exceptions differ from the enhanced 44px design goal; do not
claim a 40px control automatically fails AA. Test 200% text, 320px ordinary-text
reflow, zoomable two-dimensional diagrams and Hindi TalkBack on a real device
when available. Browser-only instruction scaling is not a full browser-zoom or
screen-reader conformance test.

Help explains same-browser/device-only storage, clearing/private-window risks,
My list versus offline versus downloads, missing resources, retry and source
comparison. Offer a readable notes text export with lesson context; do not imply
cloud sync, automatic backup restore or account recovery. Avoid student details.

## Learning from other products

If a task requests current comparison, inspect primary Oak/Khan product/help
sources and record the date and exact relevant behavior. Reuse useful principles:
clear curriculum context, concise resource labels, consistent lesson structure,
direct task actions, predictable return and progressive optional help. Adapt for
the teacher's own PDF and offline preparation; do not copy student mastery scores,
gamification, account/onboarding gates or a foreign curriculum hierarchy by default.
Do not present desktop heuristics as observed teacher research. Test proposed
Hindi wording with teachers before claiming it is intuitive in the field.

Grade and Subject must be directly selectable native controls in the blue header, always visible at the viewport top on every route (owner-approved r71). Hindi is the teacher default; preserve English only through explicit `?ui=en` for QA, without a public language dropdown. Show the actual current screen, browsing week/topic or lesson
week/day/section. Avoid stacking duplicate context rows; measure combined header
and section-nav heights so chip/keyboard jumps remain visible, including 320px and
large text. My list/offline lists reflect the selected grade/subject without deleting
other saved records.

Summary cards and full lesson instructions both respect the reading-size preference through 200%; verify phone wrapping and measured sticky offsets.
