# Developer handoff log (dated sections, before 31 October 2026 cleanup)

Historical record, kept verbatim. Current guide: [DEVELOPMENT.md](../DEVELOPMENT.md).

## Scrollable lesson (local release r18)

The full lesson now renders preparation, every source teaching phase, notes and
references inline, with sticky wrapping jump chips. The phase dropdown and fixed
next/previous bar have been replaced by the full-loop navigator and explicit
completion after the phases. Old phase URLs and saved progress remain supported.
See `docs/tasks/scrollable-lesson.md` for validation. These are local changes;
no production publication has been performed.

## Curriculum extension (31 October 2026)

See `docs/CURRICULUM_PACKS.md` for the pack contract and onboarding procedure.
The UI now reads metadata, grades, reviews and resource paths from
`dist/curricula.mjs`. UP remains the default and retains all old storage keys.
There are now 38 Node regression tests and 3 Python ingestion tests. `docs/TRANSFER_MANIFEST.original.json` describes the original
transfer, not this locally modified source tree.

## Ingestion workspace (31 October 2026)

See `curricula/README.md`. The original 31 October setup treated originals and drafts as local stages. The current [source archive contract](../SOURCE_ARCHIVE.md) supersedes that Git policy; normalized reviewed files are still published explicitly. `npm run
verify:publication` checks the UP snapshot. Python ingestion tests require the
optional `scripts/requirements-ingestion.txt` dependencies. CI runs both suites.

Browser smoke checks after separation: Grades 1/3 and week/day navigation,
original Grade 3 Week 13 review page image, legacy lesson/phase URL, bookmark
and note persistence through reload (temporary test values restored), keyboard
skip link, and Hindi/English lesson layouts at 360/390px without horizontal
overflow. No browser console errors captured. Physical-device/classroom and
full academic review remain separate outstanding checks.

## Source-led cards (local release r27)

`dist/guide-cards.css` layers source-specific compact cards over the base UI.
`dist/lesson-visuals.mjs` validates and renders original-artwork viewports;
`CURRICULA[].visualStyle` holds pack/grade palettes and geometry overrides.
See `docs/VISUAL_DESIGN.md` and `docs/tasks/source-led-cards.md`. Source data
remains byte-identical to its reviewed snapshot. No production deployment.

## Modular runtime (r48)

The current [PRD](../PRD.md) and [architecture](../ARCHITECTURE.md) supersede historical
file-map/count descriptions above where they differ. Registry metadata, instance
preferences, resource fetching, reader/offline state and source-media views now
have explicit module boundaries. App composition preserves the existing routes
and storage keys. New modules are recursively syntax-checked and included in the
release shell through `npm run release:assets -- rNN`; no framework/build step added.
