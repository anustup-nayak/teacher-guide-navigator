# One state app, many levels and subjects

Product requirement: UP is one coherent teacher app. Its target coverage includes
Balvatika and Grades 1–5, Hindi, Math and further supplied subjects. Current shipped
content is still the reviewed Math Grades 1–3 corpus; targets are not availability
claims. New options appear when authorized PDFs have been ingested, reviewed,
published and registered. Never create placeholder lessons to fill a selector.

## Selection and delivery model

The user-facing hierarchy is state + edition → grade/level → subject → lessons.
Grade and Subject selectors live at the top on Find, lessons, My list and Help.
Deep lesson context offers a Change grade/subject shortcut back to those controls.
Both browse routes remain within the selected grade/subject. Changing selections
flushes notes and opens the appropriate lesson list; it does not mark taught or
mix resources. Keep the current subject when the new grade provides it; otherwise
select only an actually available subject, visibly reflected in the controls.
Changing subject retains grade. Source language is distinct from Hindi as a subject.

A delivery pack is an immutable source/content bundle with a permanent ID and
storage namespace. Multiple packs may share state, subject and edition when their
grade coverage is disjoint. Thus UP Math Grades1–3 remain untouched while a new
Grade4 Math pack and a Hindi pack join the same state app. The runtime resolves
the unique `(state, edition, grade, subject)` combination to its delivery pack.
Conflicting coverage is rejected. Different editions remain distinct selectable
groups; no automatic content replacement or namespace reuse across editions.

Balvatika uses canonical numeric grade `0`, always labelled बालवाटिका/Balvatika,
never Grade0 in teacher-facing text. Grades1–5 keep their existing numeric meaning;
higher grades remain supported. Week/day values stay positive source-defined
integers. Another source schedule still requires a reviewed adapter.

## Additive integration sequence

1. Begin with the skill's TG/workbook-first conversation and freeze coverage,
   subject, edition, schedule/language and desired UX. Inspect existing coverage.
2. Choose a new unique delivery ID/namespace and directory. Do not regenerate the
   previous UP pack or overwrite its reviewed/publication files to append a grade.
3. Import, extract, source-review, map and publish under the new pack directory.
   New images/indices/catalog must not reuse an existing delivery's paths.
4. Register the pack, then validate the availability matrix has no overlaps.
   The common top navigation derives choices; no per-grade/subject UI fork.
5. Run the preservation gate before and after integration. Existing payloads,
   identity/coverage and original page pixels must remain byte-identical.
6. Test new and existing valid pairs, subject-preserving grade changes, grade-
   preserving subject changes, Balvatika, missing pairs, legacy deep links,
   notes/list/taught/resume/offline isolation, readers and both browse routes.
7. Record the new delivery only after review/publication checks; regenerate asset
   manifest, coordinate the release and rerun all gates. Keep prior field-review
   limitations honest; new content is not automatically academically signed off.

## Preservation gate

`curricula/published-baseline.json` records published pack identity/grade coverage,
parsed-file hashes, source/visual configuration hash and original page hashes. `npm test` and `npm run
verify:publication` compare the current app with that baseline. The publication
command now checks every registered delivery, not merely UP's original pack.
It also rejects new registered deliveries missing from the baseline.

```sh
node scripts/publish_curriculum.mjs NEW-DELIVERY-ID --check
npm run record:additions
npm run manifest
npm run release:assets -- rNN
npm run check
npm test
npm run test:ingestion
npm run verify:publication
```

Use actual IDs/version instead of placeholders. `record:additions` first verifies
all previous records/assets, then appends only new delivery/asset records. It cannot
rewrite an old baseline to hide accidental changes. Do not delete/regenerate the
baseline to get green checks. An intentional source repair is a separate documented
change requiring source comparison and an explicitly reviewed baseline amendment;
it is never bundled silently into a new-grade/subject ingestion.

This is a regression guard, not a guarantee that software has no defects. Keep
previous UI/storage/offline journeys and source comparisons as separate gates.
See [PRD](PRD.md), [architecture](ARCHITECTURE.md),
[pack contract](CURRICULUM_PACKS.md), [skill](../skills/teacher-guide-to-app/SKILL.md)
and `tests/expansion.test.mjs` for the integrated contracts.
