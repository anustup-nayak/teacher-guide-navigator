# QA–QC release checklist

Historical baseline/checklist: use [PRD](PRD.md), [architecture](ARCHITECTURE.md)
and the current task evidence for present behavior. Earlier dropdown/separate-screen
flows and test counts below are retained as dated records, not instructions to restore them.

Owner: implementation and QA review · 30 October 2026 · baseline v14.

Status vocabulary: NOT RUN, PASS, FAIL, LIMITED. No claim of zero defects or classroom effectiveness from software testing alone.

## Release gates

| ID | Requirement | Verification | Initial status |
|---|---|---|---|
| NAV-01 | Topic opens lesson summary cards without a mandatory single-child sub-topic accordion | Phone UI, Grades 1–3 | PASS |
| NAV-02 | Each summary shows topic/sub-topic, a two-line gist and mapped week/day; tapping it opens full lesson | Both browse routes | PASS |
| NAV-03 | Week selection exposes named days/cards, not another hidden lesson hierarchy | Phone UI | PASS |
| NAV-04 | Full lesson exposes actual first teaching instructions without a Prepare→Teach entrance gate | Phone UI, direct and template plans | PASS |
| NAV-05 | In-lesson section shortcuts, next/back and return retain class, lesson and phase | UI plus route tests | PASS |
| NAV-06 | One-tap resume; saved list opens full lesson; explicit completion survives reload and can be undone | UI plus persistence tests | PASS |
| NAV-07 | Unknown routes, unavailable review weeks and grade boundaries give useful recovery | UI plus all catalog mappings | PASS |
| CON-01 | Every record has valid source, schedule and original image; no fabricated grade/day mapping | All 366 records | PASS |
| CON-02 | Critical numerals, symbols and assessment thresholds are correct; suspicious recovered content is flagged/repaired | Pattern audit and original comparisons | LIMITED |
| CON-03 | Every direct lesson has real I do, We do, You do activities and assessment guidance | All phase data plus source samples | LIMITED |
| CON-04 | Workbook period names and displays its actual linked task; unmapped tasks explicitly remain incomplete | Workbook source mapping | PASS |
| CON-05 | Template plans are visibly differentiated from fully specified GRR plans | All 183 templates | PASS |
| CON-06 | Original, recovered and adapted instructions have honest status; uncertain text is not labelled fully proofread | Content pipeline / UI | PASS |
| CON-07 | Essential pages open inside app without a Google account | Unsigned-in browser | LIMITED |
| UI-01 | Source-inspired blue identity, amber teaching, pink practice and purple support are coherent and use text labels | Original guide comparison / phone screenshots | PASS |
| UI-02 | No horizontal overflow, clipped controls or excessive entrance navigation at 360/390/768px | DOM sizes and screenshots | PASS |
| UI-03 | Readable Hindi teaching text, large controls, visible focus and translated accessible names | Visual / keyboard checks | PASS |
| UI-04 | Main instruction and current section visible near top; navigation remains available during scroll | Phone UI | PASS |
| A11Y-01 | Skip link retains route; semantic headings, focus handling, status messages and reduced motion work | Keyboard + DOM | LIMITED |
| DATA-01 | Notes, saved lessons, completion and last teaching phase survive reload; stale tabs do not overwrite notes | Unit tests / browser | PASS |
| DATA-02 | Storage failure does not crash or claim durable saving | Unit tests | PASS |
| OPS-01 | Syntax / catalog / regression tests pass; every required local asset exists | Automated checks | PASS |
| OPS-02 | Print / source viewer / image errors have clear states and return path | UI / implementation check | LIMITED |
| OPS-03 | Deployed version matches tested commit; production smoke test passes | Sites source helper / live browser | PUBLICATION CHECK |
| OPS-04 | Protected design unchanged, or each change has an owner approval recorded in docs/design-lock.json and docs/HANDOFF.md (added 31 October 2026) | `npm run design:check`; review approvals | PASS (r56 baseline) |
| UI-05 | Every visual value comes from design tokens; no text under 13px; primary controls 48px; Noto fonts load offline (added 1 Nov 2026, r70) | `tests/design-system.test.mjs`, `npm run test:e2e` | PASS (r70) |
| UX-01 | Archetype journeys A–F, route matrix at 320/360/390/1024px × हिन्दी/English, all smart cards and offline pass with 0 failures (added 1 Nov 2026) | `npm run test:e2e` against local and live origins | PASS (r70, local) |

## Severity and exit policy

- P0: wrong teaching content, unusable required content, broken main navigation, lost notes. Repair or explicitly gate the affected activity; never silently pass.
- P1: substantial unnecessary navigation, unreadable phone content, failed recovery, inaccessible essential resources. Repair before release.
- P2: secondary polish and enhancements. Record residual scope honestly.
- Existing functional tests passing is insufficient. A heading-only practice period is not complete teaching content.
- Physical-device testing, actual teacher observation, comprehensive human academic proofreading and physical printing must be reported as LIMITED until performed. Do not claim these passed.

## Execution order

1. Inventory all records, source quality and available workbook assets.
2. Repair data pipeline and content links, with provenance and issue tracking.
3. Replace navigation and lesson surfaces, preserving notes and legacy deep links.
4. Run catalog-wide checks, then phone/desktop/keyboard workflows and content samples.
5. Repair observed failures, repeat affected checks, document results and publish tested source.

## Execution evidence and remaining limits

- 21 automated regression checks pass, including all 366 route mappings, assigned worksheet headers, practice content, known corruption patterns and offline cache failure behavior.
- 990 original page images decoded successfully: 400 guide pages, 384 workbook pages and 206 Grade 3 textbook pages. Largest asset approximately 0.29 MB; assets load on demand.
- 354 workbook sheets indexed. 318 day plans have directly mapped worksheets, including all Grade 1 teaching weeks and Grade 2/3 Weeks 5–25. The 24 early direct lessons without supplied worksheets explicitly use source-derived notebook practice.
- Eight image-only direct lesson records and twelve weekly plan records were compared with originals and rewritten in readable Hindi; known 0%/70% defects and corrupted metadata repaired. This is not independent academic approval of the entire corpus.
- Phone frames at 360/390 CSS px and tablet at 768 px: tested both locales; no horizontal document overflow after repairing the English search row. Topic-to-full-lesson takes two taps after class selection. Week view has one week selector and named summary cards.
- Browser tests: preparation within lesson, section jumping, next/previous phase, notes save/reopen, bookmarks retrieve/remove, completion/reload/undo, one-tap resume, search, review weeks, reader/zoom/return and unknown-route recovery passed.
- Known limits: complete academic proofreading and real-teacher observation remain outstanding; physical Android/iPhone, screen-reader speech, airplane mode on a physical phone and physical printing were not exercised. Offline cache behavior is regression-tested; the HTTP preview correctly reports unsupported offline storage. Verify its download button on the HTTPS deployment.
- Grade 1/2 textbook files exceed the connector's 256 MiB fetch limit (approximately 357/404 MB); the app gives printed-book page references instead of broken sign-in links. Grade 3 textbook, all guides and all workbooks open locally inside the app.
- Publication gate: push/package exact tested source, deploy once checks pass, verify the HTTPS app and offline download status. Record final outcome in the handoff report.
