# UX audit fixes — 31 October 2026

Objective: implement the 21 findings from the source-backed UX audit, preserve
existing UP content, links and teacher data, and verify the running app.
Owner: single implementation agent. Branch: unavailable (transferred directory
has no Git metadata). No delegated edits. No production deployment.

Scope: app/core/UX helpers, curriculum UI metadata, reader, CSS, entry bootstrap,
service worker/integrity manifest, reviewed printed-page resource metadata,
publication copy, release tests, documentation. Original catalogue and page
pixels are unchanged. Existing teacher-storage namespaces and lesson IDs remain.
Dependencies: static server at localhost:8000; Node 22; Python ingestion tests.

Acceptance and results:

- F01: reader has a history entry; Back closes it on the current lesson, Forward
  reopens it, Escape/explicit close return focus. Verified in the running app.
- F02–03: resume is per grade; ordinary cards open overview; merely rendering a
  lesson does not mark it taught or overwrite its last active section. Legacy
  resume keys remain supported. Live and unit checks passed.
- F04: 24 plans without worksheets say notebook practice; misleading “below”
  references removed; independent-practice link works. All 24 checked by tests.
- F05: full canonical display titles replace broken abbreviations; source-compared
  character repairs; resource/material summaries; 67 exact reversed remedial
  sentence pairs repaired in display only. Full academic proofreading is separate.
- F06: canonical Hindi normalization, visible-content search, ranked title hits,
  clear search and caret preservation. Equivalent spellings and material search
  tested with class scope.
- F07–08: verified printed-page labels, honest unknown labels, current-page print
  preview and WebP file download. Worksheet page 7 resolves to PDF image 9. The
  downloaded file and preview target were verified. Physical printer output is
  not claimed.
- F09: SHA-256 manifest for all 990 images; unchanged downloads migrate during
  worker updates; changed/unverified pages are not silently carried forward;
  old cache retained if migration cannot complete. Integrity and migration tests.
- F10: separate My list, offline storage and file download; progress, verified
  readiness, missing/storage/network states, retry, removal with shared-page
  protection, discoverable offline collection. Live download and cache checks.
- F11: sticky class/week/day and list link; list scroll position remembered within
  the session. Source context remains visible deep in the lesson.
- F12: three explicit period groups; subordinate Step counters; guided-practice
  return link. Internal allocations are shown only for source-compared lesson
  metadata (g1 week9 day1 and g3 week1 day1), not inferred across the corpus.
- F13: visible enlargement caption; source provenance and full-page context in
  reader; custom descriptions retained. Geometry checks cover all configured
  crops. Semantic diagram equivalence/full manual boundary review is not
  established by these tests; retain the academic/accessibility review gate.
- F14: repeated identical source actions and weekly objective duplicates removed;
  exact duplicate title/goal suppressed; manual note Save retained; auxiliary
  type and controls enlarged.
- F15: explicit taught action; adjacent status/undo; scroll/focus preserved.
  Live mark/undo and reload checked; temporary mark undone.
- F16: weekly outline label, preparation explanation and direct preparation-note
  action. Original weekly structure stays intact; no invented daily stages.
- F17: optional Help, same-browser storage explanation, readable notes text export and
  contextual issue-details file. Downloads verified; no automatic transmission.
  Text export preserves lesson context, with no claim of automatic restore or sync.
- F18: named page arrows, verified printed-page entry, unknown-page feedback,
  specific guide page primary and full books secondary. Reader/file checks.
- F19: source-language metadata distinct from UI language; resource controls from
  availability metadata, with no Grade-3 textbook UI gate. Future Grade-8 fixture
  tested by the resource helper.
- F20: 100/125/150/200% lesson-text control, larger important targets, narrow
  layout fixes and visible keyboard focus. Browser checks at 320x568 and
  390x844, normal/200% instruction text and Hindi/English menus. Physical Android
  TalkBack, browser-level 200% zoom and formal WCAG conformance remain separate.
- F21: static startup retry + dynamic import failure/20s timeout; cached successful
  response fallback on HTTP 5xx. Isolated-origin first-visit 503/404, stalled load,
  slow retry, cached all-503 and stopped-server image reading verified.

Validation: 53 Node tests, 3 Python ingestion tests, module syntax checks and
reviewed/publication equality passed. The integrity test hashes all 990 images.
Live tests include all three grades, direct and weekly plans, source/worksheet
readers, history, notes persistence, completion undo, file downloads, offline
readiness and narrow-screen layout. Temporary note and taught test values were
restored; QA exports are not packaged in the app.

Remaining validation: real teachers' comprehension of the revised wording,
physical printers, Android speech output, full academic/diagram-semantic review,
production cold-start transfer/compression measurements. No sign-off for these
is implied by software test success. App release r45 is served locally.
