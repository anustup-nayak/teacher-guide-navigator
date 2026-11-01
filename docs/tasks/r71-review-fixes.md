# r71 — final review fixes and teacher header

Owner request 1 Nov 2026: fix the three r70 review findings; remove public Hindi/English dropdown (English hidden for testing); keep grade and subject selectors always visible in the top blue band; preserve architecture. This is explicit approval for the corresponding protected shell/style changes and summary reading-size repair.

Branch task/r71-review-fixes, baseline r70. Own header/switcher/runtime styles, E2E assertions, source-compared content repair and affected contracts. Preserve routes, namespaces, storage, immutable releases and frozen v1.

Acceptance: Hindi default even after prior English preference; explicit ui=en remains testable; direct grade/subject selects stay visible while scrolling; correct selection persists and invalid pairs are excluded; summary/detail both scale to 200%; E2E asserts rendered identity and actual workbook loading; reviewed content examples repaired through model/release parity. No framework or service changes.

Progress: baseline review complete; implementation starting.

Checkpoint: header/runtime and strong E2E assertions implemented. All 97 distinct OCR-inventory steps compared with labelled source crops; 128 initial repair records (two whole-step column-order restorations), then 167 further Math symbol strings compared via PDF AAText U+F024 rendered spans on 48 pages. Recipes total Math 274 + Hindi 21; each records source page/image SHA-256. Applied through canonical model + compatibility export; new content 1.3.4 built; gates/UI retests pending. Legitimate standalone matras and source visarga retained. No academic sign-off.

## Verification checkpoint

- 145/145 Node tests; 18/18 Python ingestion tests; module syntax, worker syntax, program metadata, pinned content reproducibility, site publication parity, preservation and complete source archive (13 PDFs) pass.
- Browser automation used the supported Codex browser interface, not the standalone Playwright runner. 549/549 cards checked for exact rendered lesson identity/title/summary (with existing display normalization), loaded images and <=1px page-width rounding at 360px; all 496 cards expecting artwork contain it. 19 routes × 4 widths (320/360/390/1024) × 2 UI languages = 152 cases with no overflow >1px or text below 13px. Includes guide periods/pages omitted before.
- 24 reading cases (all six Grade/Subject pairs × 320/390px × Hindi/English) double summary text and preserve 200% on reload without overflow. Temporary reading prefs restored to normal.
- Direct grade→subject switching works; a just-edited Math note survives grade/subject round trips (then removed via normal Save). Saved-list retrieval and removal, taught→reload→undo, card→correct focused phase, workbook load/zoom/Escape/return, skip link and brand→grade→subject keyboard order passed.
- Prepared Hindi G1 w9d1 via the normal offline button, stopped the local HTTP server, reloaded the lesson and opened workbook p5 (natural width 1250). Both worked without the server; Escape restored focus. This is an origin-server-unavailable test, not a physical airplane-mode/device certification.
- Full Playwright `npm run test:e2e` runner was not executed; its corrected source passed syntax checks and equivalent workflows were independently exercised above. No teacher field study, physical TalkBack/low-end device, academic sign-off or physical print claim.
- Source inventory: 150 rows / 97 distinct steps / 84 lessons reviewed. 95 inventory steps corrected, two intentional-sign cases retained. Further 167 exact Math symbol strings were checked against 322 rendered AAText glyph spans on 48 pages. Total explicit recipes: 274 Math, 21 Hindi; 122 distinct lessons / 200 distinct steps. Old content releases and original images/PDFs remain unchanged.
- A full-card sweep exposed long, unspaced source goal text protruding by 2px; preparation goals now wrap. All 549 passed after the fix.

## Documentation impact

Updated design contract/system, PRD, architecture description (same modules), developer repair procedure, reusable design reference and historical OCR inventory status. Added page-hashed repair recipes and a bounded idempotent model→existing legacy-codec export helper. Hindi ingestion retains exact fixes; AAText-only decoder fixes U+F024 without changing other fonts’ dollar currency. New content 1.3.4 / runtime r71; no framework/backend migration.

## Next

Review staged diff, finish browser screenshot evidence, push integration PR, check CI; release through next→main under the existing publication authorization and verify exact deployed bytes. Keep frozen /v1/ untouched.

CI caught an omitted `dist/sw.js` in the initial commit (the local r71 worker was tested but a staging suffix filter omitted .js). Added the tested r71 worker; no test weakened and no production deployment occurred from the incomplete candidate. Rechecking CI before release.
