# Quality gates and regression matrix

## Evidence format

Use PASS / FAIL / LIMITED / NOT RUN, with fixture/lesson/pack, exact environment,
command or UI action, observed outcome, screenshot/log and residual scope. A
button click is not success: verify the resulting state/file/image. Fix observed
failures, repeat affected cases, then run the final complete gate. Separate
source correctness, software correctness and field validation.

## Automated baseline and pack gates

From the repo root:

```sh
npm test
npm run check
npm run test:ingestion
npm run verify:publication
node scripts/publish_curriculum.mjs NEW-PACK-ID --check
python3 skills/teacher-guide-to-app/scripts/preflight.py --repo . --pack NEW-PACK-ID --require-reviewed --require-sources
```

Preflight checks file layout, identity, source checksums and publication bytes;
it does not parse the lesson module or prove registry validity, content quality
or UI operation. Run the Node validators and browser journeys as separate gates.

Replace the example ID before executing. The last two apply to a real new pack.
`npm run manifest` regenerates hashes after asset changes; it is a mutation, not a
read-only validation. Tests must check the generated hashes against actual files.
Use actual test outcomes; 53 Node + 3 Python is a historical r45 baseline, not a
permanent expected count. Fixed UP counts are compatibility sentinels, not counts
that a new pack must mimic. Extend pack-aware checks without weakening UP gates.

Verify:

- Unique stable IDs and grade/subject/week/day mappings; both browse routes resolve
  the same record; topic/LO/schedule relationships source-backed.
- Correct source-native phase counts, real actions/questions, totals when supplied,
  weekly-outline differentiation and review-week behavior.
- All resource paths resolve locally; all image files decode, including captions,
  page indices and natural dimensions; no private PDFs/OCR leak into publication.
- Every assigned worksheet's printed grade/week/type/ordinal matches its lesson;
  missing resources have honest alternatives rather than heading-only practice.
- Known decoding defects, control/private glyphs, dangling title grammar, critical
  numerals/operators/70% thresholds, misplaced fragments and unrelated summaries.
  Do not write a test that merely proves text is nonempty.
- Registry supports arbitrary provided grades and independent resource availability;
  new pack saved-data isolation; existing UP IDs/storage and deep links unchanged.
- Notes merge against latest storage, denied storage is disclosed, escaping works,
  stale tabs preserve others' notes; viewing does not mark taught.
- Service worker shell includes every transitive static/dynamic module and exact
  versioned entry/import/CSS/resource-index URL; cached 5xx and thrown network
  failures; download success/failure; partial cache; progress/error handling.
- Integrity-matched image migration, changed-page invalidation, old-cache retention
  if manifest/migration fails, and shared-page preservation on offline removal.

## All 21 discovered regressions: carry these acceptance cases forward

| ID | Observed problem → required verification |
|---|---|
| F01 | Reader/history: ordinary Back before a reader exists must not render an undefined reader; modal Back closes on same lesson, Forward reopens, close/Escape return focus; reload old history is safe |
| F02 | Changing class never leaves another class's resume card; legacy resume only when class matches |
| F03 | Ordinary card opens overview; separate last-opened entry resumes actual phase; read/download does not mark taught |
| F04 | No-sheet lessons say notebook practice, explain absence once and link to independent work without incorrect “below” |
| F05 | Full grammatical titles, exact source-compared repairs, accurate previews; test content meaning as well as completeness |
| F06 | Canonically equivalent Hindi (जोड़ / जोड़), visible material/summary words, LO codes, digits, clear search, composing/caret, class scope |
| F07 | Printed worksheet page 7 stays page 7 although PDF image is 9; unknown labels are not inferred |
| F08 | Worksheet download/print uses current worksheet, never the default guide; preview, browser download and return work |
| F09 | UI release preserves unchanged offline images; changed bytes rejected; failed migration does not erase prepared cache |
| F10 | My list, offline copies and file download distinct; progress, current readiness, errors/retry, removal/shared assets, collection discoverability |
| F11 | Sticky class/week/day and correct Find/My list return; list filters and useful scroll position retained |
| F12 | Steps distinct from source periods; no universal timing split; understanding checks linked to relevant support/guided work |
| F13 | Visible enlargement, meaningful image equivalents, source context, reviewed crop boundaries, no forced/decorative illustration |
| F14 | Duplicate source actions/objectives/metadata removed without hiding teaching content; manual note Save and readable labels retained |
| F15 | Explicit mark-taught action/status/adjacent undo, persistence, no top jump or student mastery claim |
| F16 | Weekly outlines explain only actual preparation needs and offer contextual editable preparation notes; no invented GRR |
| F17 | Help optional, returns to current task; same-browser storage explained; readable notes export and context report do not auto-send |
| F18 | Reader arrows named, verified printed-page jump including local digits, unknown-page feedback; relevant page primary/full book secondary |
| F19 | Source-language metadata distinct from UI; textbook/other resources driven by availability, including non-UP higher grades |
| F20 | 320px reflow, 200% text, comfortable targets, focus clear of sticky UI, keyboard/real speech scope reported honestly |
| F21 | Catalog import failure cannot leave endless loading; static retry, timeout, 404/503, slow retry, cached 5xx and thrown network tested separately |

## Browser journeys

Start the existing static app on localhost/HTTPS, not file://. If a port is already
serving the intended app, reuse it. Use a separate origin/profile/port for destructive
fault simulations; worktrees alone do not isolate browser localStorage. Temporary
harnesses and test exports belong outside the served production bundle.

1. Choose every affected grade/pack; browse by topic and week/day. Confirm cards
   are accurate and ordinary opening starts at overview, while resume is scoped.
2. Scroll the complete lesson. Click each chip; verify the destination heading is
   visible below sticky navigation and active section/legacy route/resume agree.
   Check forward/back day boundaries and review/unknown/missing lesson recovery.
3. Test direct plans, outlines and review pages, early/late weeks, every layout
   family, long titles/instructions, missing worksheets and unavailable textbooks.
4. Open original illustration with tap and Enter; inspect crop/speech labels;
   zoom/reset; open full source; Back/Forward, Escape, close and focus restoration.
5. Open a mapped worksheet, check printed label, enter local-script page numbers,
   reject unknown entries clearly, preview the exact page, download and inspect
   the actual completed file. Physical printing is a separate result.
6. Type a temporary note, jump sections/change language/pack, save/reload/reopen.
   Confirm merge safety, then restore original QA values. Toggle My list and taught
   status; verify retrieval/persistence/undo without accidental completion.
7. Download an offline lesson, observe progress and checked readiness, reload with
   failed network, read guide/worksheets, check partial/missing-page state, remove
   copy without removing note/bookmark or another lesson's shared assets.
8. Install a previous-version cache, update to candidate release and verify images
   and teacher data survive. Check manifest unavailable, changed bytes and quota
   failures. A clean install alone does not test the update path.
9. Help from a deep section returns with useful position. Download notes as readable
   text, inspect lesson context/content, and verify issue details exclude private
   notes/student information and are not automatically transmitted.

After every navigation/action, read current rendered/accessibility state before
choosing the next action. Wait for the application to initialize, not just for
static header controls to appear. Selecting language before import completes can
be overwritten by initialization and gives misleading test results. Use fresh
selectors, actual DOM evidence and supported browser automation APIs. Do not
blindly repeat a stale tab/session call; reconnect/reset when necessary.

## Layout/accessibility matrix

At minimum: desktop/tablet plus 360/390px in Hindi and English; 320px with normal
and 200% instruction text; each source-family/grade/template. Record inner width
and document scroll width, but also inspect screenshots: no overflow is necessary,
not sufficient. Check clipped/wrapped labels, squeezed columns, blank art columns,
readable metadata, worksheet aspect, sticky height, status visibility and controls.

Keyboard: skip link keeps route, Tab/Shift+Tab focus remains visible, chip jumps,
artwork Enter, modal focus/close, page selection, notes and completion undo. Check
principal colour pairs against the actual foreground/background; colour is never
the sole meaning. Test browser zoom, Hindi TalkBack and physical devices when
available; instruction font scaling is not proof of every WCAG criterion.

## Failure matrix

| Setup | Observable expected state |
|---|---|
| First visit, catalog 503 or missing 404 | Understandable static startup retry; no storage-clearing instruction |
| Import stalls beyond timeout | Recovery action appears; late completion does not corrupt data |
| Slow connection then healthy retry | Lesson becomes usable with existing teacher data intact |
| Cached shell receives 5xx | Last successful compatible cached response is usable |
| Server stopped/network throws | Cached shell and explicitly stored pages usable; uncached page shows error |
| Image fails | Retry/open-source feedback, no indefinite spinner or false ready state |
| Storage denied/full | Honest session-only/storage message; no false durable note/offline claim |
| Unknown route/pack/page/resource | Accurate recovery; no fabricated source or unrelated lesson |

Save representative screenshots and sanitized current-release logs. Historical
console errors must be distinguished from new errors; a fresh final session is
useful. Restore viewport, note/list/taught test values and temporary servers; keep
the requested app running. Do not erase teacher data to get a clean console.

## Human and production validation

Classify as LIMITED/NOT RUN until actually exercised: teacher comprehension of
labels/navigation, classroom effectiveness, physical printing, real Android/iOS
speech/device behavior, full academic/diagram-semantic review, production cold-start
transfer/compression and deployment-specific offline behavior. Record the scope
rather than claiming all content or all users have been validated.

## Skill-helper maintenance

When changing the preflight helper, run:

```sh
python3 -m unittest discover -s skills/teacher-guide-to-app/scripts -p 'test_*.py'
```

The tests cover nonmutation, original tampering, path/allowlist rejection and
reviewed/publication drift. Skill frontmatter/link checks and isolated synthetic
PDF execution are packaging evidence, not proof of unseen-source extraction.

## Expansion regression gate

Use `docs/CURRICULUM_EXPANSION.md` and the grade/subject matrix. Test Balvatika0,
Grades1–5, Hindi/Math and absent pairs with isolated fixtures. Assert top controls
from every screen, grade retention on subject changes and subject retention on
grade changes when available. Reject same-edition overlapping coverage. Verify
all existing deliveries against the preservation baseline and every publication;
the old UP-only shortcut is no longer sufficient. Never ship synthetic fixtures.
