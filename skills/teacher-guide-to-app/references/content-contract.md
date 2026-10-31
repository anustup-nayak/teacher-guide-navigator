# Pack, content, resource and identity contracts

Read current implementations of `dist/core.mjs`, `dist/curricula.mjs`,
`dist/lesson-visuals.mjs` and the publisher before adapting these shapes. The
examples below illustrate the existing contract; they are not shipped demo packs.

## Pack registration

A delivery pack is one immutable state × subject × edition content bundle.
Disjoint grade bundles can share that combination and appear in one state app. Keep UP first/default.

```js
{
  id: 'state-science-2027', state: 'STATE', stateLabel: 'State',
  subject: 'science', academicYear: '2027–28',
  label: {hi: 'राज्य · विज्ञान · 2027–28', en: 'State · Science · 2027–28'},
  subjectLabel: {hi: 'विज्ञान', en: 'Science'},
  storageKey: 'state-science-2027-v1', // permanent identity, NOT release version
  lessons: NEW_LESSONS,
  resources: 'packs/state-science-2027/resources.json',
  worksheets: 'packs/state-science-2027/worksheets.json',
  sourceLanguage: {hi: 'हिन्दी', en: 'Hindi'},
  reviewPages: {}, useUPStageLabels: false,
  visualStyle: {overrides: {}, palette: {blue: '#367da8'}}
}
```

Import the published pack catalog in the registry. No empty selectable pack.
Grades derive from lessons; resource availability derives from the pack's index.
A Grade 8 textbook must not depend on `grade===3`. Subject/state selectors appear
only when multiple actual options exist. UI locale does not translate source text.
New UI languages need an explicit implementation; source metadata alone is not it.

Schedule support currently requires nonnegative integer grade (0 = Balvatika) and positive integer week/day. For a source
organized solely by chapter/unit/term, design and test a schedule adapter or extend
the model with authorization; do not silently assign fictional dates or weeks.

## Lesson shape

The current renderer consumes these fields; inspect a real record for specifics:

```js
{
  id: 'stable-source-identity', grade: 8, subject: 'science', week: 1, day: 1,
  topic: 'Source-backed or labelled editorial grouping', topicOrder: 1,
  subtopic: 'Subtopic', subtopicOrder: 1, lessonOrder: 1,
  title: 'Complete meaningful source title', shortTitle: 'Optional reviewed alias',
  summary: 'Accurate preview of this lesson', outcome: 'Source learning objective',
  materials: ['Actual materials'], priorKnowledge: 'When supplied',
  vocabulary: [], commonMistake: 'When supplied',
  loCode: 'Only when supplied', loStatement: 'Correct definition for that code',
  structure: 'source-native', // weekly-template only for a real outline
  periods: 1, duration: 40, // omit totals if not actually specified
  phases: [{id: 'source-phase-id', title: 'Source phase name', period: 1,
    minutes: 40, actions: ['Actual teaching action'],
    instructions: ['Teacher action'], questions: ['Question, if supplied?'],
    image: 'packs/state-science-2027/guide/g8-p010.webp',
    sourceRect: [0.05, 0.2, 0.95, 0.8]}],
  assessment: ['Source understanding check'], worksheets: [], references: [],
  textbookReference: 'Exact printed reference, if supplied',
  source: {image: 'packs/state-science-2027/guide/g8-p010.webp',
    page: 8, pdfPage: 10, width: 1200, height: 1600,
    status: 'source-linked', notice: 'Honest recovery/review status'}
}
```

Some fields are optional; do not fabricate materials, assessments or minutes just
to pass a validator. If a required field is not meaningful for the new source,
adapt the schema/renderer/tests deliberately while preserving the old pack.
`validateCatalog` tests identities, required content, schedule collisions and
phase-total consistency; it cannot prove source fidelity or semantic correctness.

Preserve raw reviewed text. Use documented source-compared display repairs only
for exact defects; do not hide broad content problems in global substitutions.
Titles must retain complete grammar. Summaries must describe actual content and
resource availability, not a fragment of “I will demonstrate…” copied out of context.
Retain critical source numerals even when normalizing search queries.

## Resource index and workbook mapping

```json
{
  "guide": {"8": {
    "pages": ["packs/state-science-2027/guide/g8-p001.webp"],
    "pageCount": 1,
    "printedPages": {"packs/state-science-2027/guide/g8-p001.webp": 1}
  }},
  "workbook": {},
  "textbook": {}
}
```

`pages` is the complete actual PDF sequence; `printedPages` contains only verified
printed identities for those image paths. Include document checksums/provenance
where available. Unknown covers/front matter are explicitly unknown, not guessed.
Worksheets carry grade, source week, practice day/ordinal when stated, kind,
printed page, PDF page, image and source instructions. Keep task-kind meanings
source-specific. Two identical-looking activities are not evidence of the same
week/day. Every assigned sheet must belong to the correct pack and grade.

Paths are dist-relative even inside a nested module. Keep source assets and
normalized catalog IDs stable between UI releases. Use unique pack folders to
prevent collisions. Source references must resolve in the published package;
external URLs should never be the sole essential classroom reading path.

## Visual metadata

A normalized crop is `[left,top,right,bottom]` in [0,1] with positive area. Preserve
original page dimensions. `visualStyle.overrides[lessonId][phaseId]` can specify
`rect`, `image`, `width`, `height`, `kind`, bilingual `alt`, or `false` to suppress
an unsuitable visual. Use UP `layouts` only for the verified UP page families.
Support illustration / source-excerpt / worksheet distinctions and shared artwork
honestly. Exact internal timing notes can be pack/lesson-specific; never infer a
universal 30+10 or 20+20 split from one example.

## Staging and publication

`pack.json` must match the pack ID and publication directory. Allowed normalized
files: catalog.mjs, sources.json, resources.json, worksheets.json. Record actual
review scope; set `reviewed-snapshot` only after completing that review, never by
copying the example status merely to bypass the publisher.

```sh
node scripts/publish_curriculum.mjs state-science-2027
node scripts/publish_curriculum.mjs state-science-2027 --check
npm run verify:publication
```

The publisher copies only allowlisted reviewed bytes; it does not validate
academic content, generate images, register the pack or deploy. Rendered assets
and the registry/offline shell need their separate checks.

## Teacher-data and routing compatibility

- Pack identity/storageKey is permanent; app/cache version changes per release.
- UP namespace stays `up-sandarshika-2026-v1`, with existing suffixes for notes,
  saved/bookmarks, completion, phases, last opened, offline and per-grade state.
- Preserve old `#/lesson/<id>/teach/<step>` and Prepare links. Default query-less
  URLs continue to select UP. Other packs use `?curriculum=<id>#/...`.
- Queries persist during hash navigation. Pack switching flushes pending notes.
- Class-scoped last-opened records can fall back to valid legacy data for the
  same class. Viewing/resuming is distinct from teacher-marked taught status.
- Merge changed note keys with current storage; stale tabs must not erase others.
  Read current bookmark/completion state before edits. Disclose session-only
  saving if storage is denied. Never clear browser storage for upgrades or tests.

## Module integration

The registry is composition only; UP configuration is now in
`dist/packs/up-math-2026.mjs`. Pure selection/validation is in
`dist/domain/curriculum.mjs`. `docs/ARCHITECTURE.md` defines shared context,
resource, reader, offline and media factories. Extend a pack through that contract
rather than copying the app. Coordinate new module versions/shell entries with
`npm run release:assets -- rNN`, then run the transitive offline gate.
