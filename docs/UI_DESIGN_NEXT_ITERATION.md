# Sandarshika — next iteration: UI audit and design specification

Recorded 1 November 2026, following the owner's request. Start after the current r69 production release and live verification are complete. This is a review brief, not approval to implement a redesign now.

## Intended outcome

A professional, coherent, accessible teacher-facing interface governed by a written UI design specification, reusable components and shared design tokens. Source authenticity belongs in accurate content and original-page access; the app's presentation should be designed for the digital teaching workflow.

## Owner's concerns to investigate

- Hindi and English font choice, Devanagari shaping, readability, hierarchy, weight, line length and spacing.
- Colour quality, contrast, semantic consistency and excessive visual competition.
- Inconsistent layout, alignment, spacing, content density and responsive behaviour.
- Nonstandard or inconsistent controls, navigation, states, icons and interactions.
- The relationship between the summary card, period/step navigation and detailed lesson.
- Hard-coded visual values and scattered component styling rather than a shared specification.

These are the owner's concerns to audit; do not label individual defects proven without evidence.

## Teacher-centred UX audit

Use the companion `TEACHER_UX_AUDIT_PROTOCOL.md` as the mandatory workflow/teacher-comprehension audit. Recover Claude’s original archetypes; the owner-specified low-digital-confidence, low-structured-pedagogy-understanding, low-motivation profile is the primary stress case. Assess every workflow, mistakes/recovery and actual teaching comprehension, with human validation separate from AI/expert simulation.

## Phase 1 — thorough review before proposing implementation

1. Establish the deployed release as the baseline. Read AGENTS, HANDOFF, DESIGN_CONTRACT, PRD, architecture and existing UX reviews. Record what is protected and what needs owner-approved amendment.
2. Inventory screens and reusable components: Today, year/program guide, goals, week/day selection, topic/search browsing, smart cards, full lessons, sticky step navigation, context/grade/subject controls, reader, bookmarks, notes, completion, help, offline/error/empty/loading states and print.
3. Trace key teacher journeys: find today's lesson; grasp the lesson; start teaching; switch steps; open and return from a source page; move between days; save/revisit notes; mark/undo taught; use offline; change grade/subject.
4. Review Hindi-first typography, visual hierarchy, colour/contrast, spacing/grid, layout consistency, component conventions, interaction feedback, touch targets, keyboard/focus, screen-reader semantics, reduced motion, text enlargement, responsive behaviour and low-end-device performance.
5. Inspect code for duplicated components, scattered styles and hard-coded presentation values. Separate visual issues from information architecture, interaction and implementation issues.
6. Capture annotated evidence across Math/Hindi and Grades 1–3, especially short/long lessons, no-image cards and assessment/template days. Test 320/360/390px plus tablet/desktop, both languages and enlarged text.
7. Produce an evidence-backed issue register: screen/journey, screenshot, observed problem, teacher impact, severity, recommendation, affected component and verification method. Distinguish automated checks from expert judgement and real-teacher evidence.

## Phase 2 — agree a design specification

Deliver one canonical UI spec covering:

- Design principles and information hierarchy grounded in rural UP teachers with low digital familiarity.
- Hindi/English type families, fallback behaviour, type scale, weights, line heights and text-width rules.
- Semantic colour tokens, contrast requirements and teaching/navigation/support meanings.
- Spacing scale, responsive grids, breakpoints, container widths, density and elevation/border/radius/icon rules.
- Component anatomy, variants and default/hover/focus/pressed/disabled/loading/error/empty states.
- Navigation, smart-card-to-step behaviour, reader flow, forms and feedback patterns.
- Accessibility criteria, keyboard/focus rules, touch targets and text-resizing behaviour.
- Token naming and mapping to the code; components consume tokens rather than ad hoc values.
- Reference screens using real Hindi/English content, including the difficult long-content cases.

Review proposed directions and the reference screens with the owner before changing the protected design contract or implementing the redesign. Choose tools and any component library after the audit; do not assume a framework migration or Figma requirement.

## Phase 3 — implementation in a later approved task

Translate the approved spec into shared tokens and reusable components, migrate in bounded slices, update the design contract/lock only with recorded approval, then verify against the reference screens and journey acceptance criteria.

Preserve lesson wording, timings, provenance, IDs, routes, original images, offline behaviour and existing teacher data. Retain all immutable content releases. Measure consistency, readability and usability rather than treating a passing regression suite as proof of professional design or teacher effectiveness.

## Deliverables and completion criteria

- Screen/component inventory and teacher-journey map.
- Annotated audit and prioritised issue register.
- Proposed design principles and canonical UI specification.
- Token/component inventory and code mapping.
- Real-content reference screens and accessibility acceptance criteria.
- Phased implementation backlog, risks and regression plan.
- Owner approval of the design direction before implementation.
