# Source-led lesson cards

> Values (colours, sizes, radii, spacing) now come from the tokens in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md). This file keeps the source-led geometry rationale.


Design record introduced in r27. The current [design contract](DESIGN_CONTRACT.md) is authoritative: r69 places an approved smart card before the unchanged detailed lesson, with step chips directly below. The reading-layout description below records the original detailed-step component. The app uses the source guide's visual grammar without
flattening the lesson into an unreadable page screenshot.

## Reading layout

A blue lesson banner pairs a calendar badge with the learning topic. Preparation
uses compact grey resource blocks. All teaching phases remain visible in one
scrollable sequence, with sticky wrapping chips. Each card pairs a coloured
phase band, original source artwork, numbered teaching actions and a small
question strip. On phones text flows around and then below the illustration;
on larger screens it uses an illustration column. No lesson instructions are
summarised away. Boilerplate assessment text that merely duplicated the source
assessment was removed from the UI; source instructions/assessment stay intact.

Actual assigned workbook pages appear as previews in practice. Weekly plans
retain one source phase, with a full-width original-section preview on phones;
they do not acquire invented GRR sections. An excerpt is labelled as an excerpt,
not an isolated illustration. Grade 3's guided practice honestly labels shared
demonstration artwork. Sections without supplied art are not decorated with
invented teaching pictures.

## Palette and configuration

`CURRICULA[].visualStyle` owns palette, grade variations, page-layout profiles
and per-lesson illustration overrides. UP Grades 1/2 use amber teaching, pink
practice and purple support. Grade 3 uses yellow, blue and dark blue. Weekly
plans use their own charcoal/beige, terracotta and green source bands. Foreground
colours are adjusted for readable contrast rather than copying low-contrast
printed white-on-colour text blindly.

Other packs never inherit UP crops from grade number. They may supply explicit
`overrides[lessonId][phaseId]` with normalized `rect`, optional `image`, `width`,
`height`, `kind` and `alt: {hi,en}`; use `false` to suppress an unsuitable crop.
`layouts` identifies only known UP page families. New source layouts require
source comparison and their own adapter or reviewed overrides.

## Artwork and provenance

`lesson-visuals.mjs` computes CSS viewports over the existing original WebP pages.
No source pixels, numerals or speech labels are repainted. Original complete
pages remain accessible for comparison and printing. Tap/Enter on artwork opens
a focused illustration reader with zoom, error recovery and focus return.
Workbook images retain their natural aspect ratio. Images reserve space, load
lazily and reuse the same source page URL. Offline selection downloads the
unique guide/illustration/workbook assets actually used by that lesson.

There are 687 illustration placements (including shared uses), 159 direct-plan
worksheet previews and 297 labelled source excerpts. These are placements, not
1,143 newly generated images. Boundaries for the first Grade 1/2 spatial lessons
have source-compared overrides; remaining source-layout crops use the known
page families. Geometry/asset validation covers all placements. Visual source
comparison sampled 15 direct lessons across grades/weeks, plus original weekly
pages. This does not establish manual proofreading of every crop or academic
sign-off. If a boundary needs adjustment, add a reviewed override; keep the full
source page available.

## Validation

38 Node regression checks, 3 Python ingestion tests, syntax and reviewed/published
byte-equality checks. Browser checks cover Hindi/English at 360/390px, desktop
composition, all three grade profiles, weekly templates, chip jumps/resume,
keyboard artwork opening, image zoom/close/focus return, natural worksheet
aspect, notes/bookmarks/completion reload and undo. Temporary QA values restored.
No captured app console errors. Principal source band text pairs were checked
for 4.5:1 contrast; this is not a full accessibility certification. Real-device,
classroom, screen-reader speech and physical-print checks remain separate.
