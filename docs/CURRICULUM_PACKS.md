# Adding states, subjects and grades

The app remains a buildless static site. `dist/curricula.mjs` is the registry;
`dist/catalog.mjs` remains the unchanged UP content snapshot.

## Pack boundaries

Register a separate immutable delivery pack for new content within a state, subject
and academic-year edition; packs in the same group must cover disjoint grades. A pack contains:

- Stable `id`, `state`, `stateLabel`, `subject`, `academicYear`.
- Hindi/English `label`, `subjectLabel` and `coverage` strings.
- Permanent, unique `storageKey` and a `lessons` array.
- Separate `resources` and `worksheets` JSON paths. Resource indices use the
  existing kind → grade → pages structure, scoped to this pack.
- Optional `reviewPages`: grade → week → original PDF page number (one-based).
  Use `{}` when there are no special review weeks. Do not create daily records
  for the same review week.
- Optional `outcomeLabel` translations and `useUPStageLabels` (UP only).
  Other packs display their own phase titles, arbitrary phase counts and optional
  phase `period` values. Do not copy UP phase labels/timings into another guide.

Grades are derived from actual lessons; no selector code change is required for
Grade 4, 8 or 12. Every lesson in a pack must use its subject. A second subject
in the same state is a separate pack, so resources and teacher data stay isolated.

Import the new lesson module in the registry and append its descriptor to
`CURRICULA`. Keep the existing UP pack first. No empty/example pack is shipped.
Top Grade/Subject controls appear on every screen. State/edition selection
appears when multiple actual groups are registered. Choices aggregate valid
coverage across disjoint deliveries, rather than exposing internal pack IDs.

## Content contract

Use the existing lesson schema: stable id, nonnegative integer grade (0 = Balvatika) and positive integer week/day,
subject, topic/subtopic and ordering, title/shortTitle/summary, outcome, materials,
assessment, phases, source and references. Each phase needs a title and actions;
optional instructions/questions, minutes and period preserve source structure.
`minutes` may be a source range such as `"5–7"`; lesson-duration totals are only checked
when every phase uses whole numbers. Source-native phase ids keep their own titles; an
optional `role` (`teaching`, `practice`, `support`) gives them the shared colour roles, and
`worksheetPreview: true` shows the lesson's workbook page on the step that uses it
(UP Hindi, added 31 October 2026). Without these fields the UP Math behaviour is unchanged.
A source supplies image and one-based pdfPage. Use `weekly-template` only for
actual source templates; other structures appear in topic browsing.

Paths in lessons, worksheets and resource indices are relative to `dist/`, not
to the new pack's module directory. Store new assets under a unique directory
such as `packs/<pack-id>/` to prevent collisions. Follow the existing reader
page-image convention `*-pNNN.webp` for correct PDF page labels.

The current reader and schedule contract supports grade/week/day guides, Hindi
and English UI, and guide/workbook/textbook page images. Other schedule systems
or UI languages need a further adapter; this change does not fabricate support.
The extraction/repair scripts remain specifically for the UP source corpus.
Use a separate, source-reviewed importer for another state's guides.

## Compatibility and release checks

Old `#/lesson/<id>/teach/<step>` links without a query keep opening UP.
New packs use `?curriculum=<pack-id>#/lesson/<id>/teach/<step>`.
The query persists through hash navigation; unknown pack IDs fall back to UP.
Switching packs flushes pending notes and opens the selected pack's lesson list.
IDs may repeat between packs because each pack owns its storage namespace.
Never rename UP's `up-sandarshika-2026-v1` namespace or rewrite its lesson IDs.
No storage is cleared or migrated by this feature.

Run `validateCurricula(CURRICULA)` and `validateCatalog(pack.lessons)` in tests.
Add each new catalog module and resource index to `dist/sw.js`'s `SHELL`, including
all transitively imported modules; increment app/worker versions together.
Original page images remain opt-in offline downloads. Test pack switching,
resources, persistence isolation and offline operation on localhost/HTTPS.
Run `npm test` and `npm run check`, then Hindi/English phone and keyboard checks.
Academic source comparison remains a separate requirement.

## Separate ingestion stages

Use `curricula/<pack-id>/originals`, `extracted`, and `reviewed`; see
`curricula/README.md` for import/extract/publish commands. New pack publications
use `dist/packs/<pack-id>/`; UP retains its legacy published paths. Original
Approved PDFs and reproducible extraction outputs are archived according to [SOURCE_ARCHIVE.md](SOURCE_ARCHIVE.md); both remain excluded from the served tree.

## Source-specific visual identity

A pack may supply `visualStyle` with palette/grade palette variations and explicit
per-phase illustration crops. UP layouts are never applied to other curricula
by grade number. See `docs/VISUAL_DESIGN.md` for the geometry and review contract.

## Shared implementation and agreed scope

Start new sources with the skill's conversational discovery/frozen brief and
[PRD](PRD.md). Registry composition remains `dist/curricula.mjs`; UP's descriptor
now lives in `dist/packs/up-math-2026.mjs`, while pure registry helpers are in
`dist/domain/curriculum.mjs`. Reuse pack-scoped context/resource/reader/offline/media
factories documented in [architecture](ARCHITECTURE.md). New instances must not
copy the runtime. `npm run release:assets -- rNN` derives transitive module and
registered resource-index cache entries; keep the publication and browser gates.

## Unified grade and subject expansion

[Curriculum expansion contract](CURRICULUM_EXPANSION.md) is authoritative for multi-grade/subject
UP growth: one state app with top Grade/Subject controls, Balvatika as level0,
metadata-derived valid pairs and disjoint immutable deliveries. New content must
not overwrite any previous published payload, image path or teacher-data identity.
Run all-delivery publication checks and the preservation baseline gate; never
reset the baseline to bypass a failure.
