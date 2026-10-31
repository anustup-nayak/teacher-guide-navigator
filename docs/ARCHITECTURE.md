# Shared runtime and curriculum-instance architecture

Status: implemented local release r51. Product behavior: [PRD](PRD.md).
Agent workflow: [skill](../skills/teacher-guide-to-app/SKILL.md).
Data publication: [pack contract](CURRICULUM_PACKS.md).

## Instance model and boundaries

A curriculum instance is a registered pack (state/subject/edition) selected by the
URL. Each has its own lesson module, resource indices, visuals and permanent
storage namespace. All instances share the same runtime and UI components; a new
state does not receive a copied app.mjs or a fork of the reader. Separate sites,
when requested, deploy the same runtime with their registry/source configuration.

One active app context is mounted per browser page. Pack switching flushes notes
and performs normal page navigation to a new context. Factories isolate mutable
preferences, resource requests, reader state and offline verification. This does
not claim support for mounting multiple interactive apps into the same DOM at
once. Multiple tabs/pack contexts preserve namespace and stale-note invariants.
Browser storage/service worker are origin-scoped infrastructure, not cloud sync.

## Module ownership and interfaces

| Module | Responsibility / injected interface |
|---|---|
| `dist/bootstrap.mjs` | Static import/timeout recovery before the app initializes |
| `dist/app.mjs` | Browser composition, browse/lesson/help markup, route/scroll orchestration and teacher-action events; wires shared factories |
| `dist/curricula.mjs` | Registry composition and backward-compatible helper exports; keep UP first |
| `dist/packs/up-math-2026.mjs` | UP-only metadata, source palettes/crops, references and storage identity; no browser state |
| `dist/domain/curriculum.mjs` | Pure selection, derived grades/reviews and registry validation; no DOM/storage |
| `dist/domain/app-context.mjs` | `createAppContext({packs,search,storage})` → selected pack, grades, store, prefs, readObj, persist; state scoped per call |
| `dist/core.mjs`, `ux.mjs` | Pure catalog/routes/storage primitives and content/search/page/history helpers; legacy exports preserved |
| `dist/services/resources.mjs` | `createResourceRepository(pack,{version,fetcher})` → load/peek/worksheets. Deduplicated per-pack requests; failed requests retry; no global data cache |
| `dist/services/worker-client.mjs` | Browser worker request/progress protocol. Selected lesson assets are passed explicitly |
| `dist/features/reader.mjs` | `createReader(...)` → openReader/openVisual/bookButtons/previewPrint. Owns reader state, history, print and reader listeners. Injects resource repository, current lesson and media helpers |
| `dist/features/offline.mjs` | `createOfflineController(...)` → check/keep/remove/controls/reset. Owns readiness checks; injects selected pack, ledger/store callbacks, UI callbacks and optional request transport for tests |
| `dist/views/lesson-media.mjs` | `createLessonMedia({curriculum,prefs,t,e,stage,list})` → crop/caption/alt/artwork/worksheet rendering; no fetching or persistence |
| `dist/lesson-navigation.mjs`, `lesson-visuals.mjs` | Pure section tracking, crop geometry, source palette and asset dependency calculations |
| `dist/sw.js` | Shared shell/image cache and message implementation; integrity-preserving upgrade and server/network fallback |

Dependency direction: composition → features/views/services → domain/pure helpers.
Packs supply configuration/content; domain modules never import UI features. No
feature imports app.mjs. UI callbacks avoid circular imports. A factory must be
initialized before the first render; imports alone must not register duplicate
DOM listeners. Instances create their resource/feature factories once per page.

The composition module intentionally still owns screen markup and navigation;
this refactor does not claim a complete component framework migration. New feature
work can extract another view when useful, using the same explicit interfaces.
Avoid broad ambient globals or an opaque context bag containing the entire app.

## Data/control flow

1. Bootstrap imports the app; app selects a pack through `createAppContext`.
2. Pack metadata + reviewed lessons drive browsing, source-native sections,
   source visuals and storage scope.
3. A per-context resource repository resolves only that pack's book/worksheet
   indices. Reader gets this repository and a current-lesson getter.
4. Teacher events update the selected namespace and re-render relevant UI. Notes
   still merge latest changed keys. Reading/resuming remains separate from taught.
5. Offline controller passes deduplicated source assets to the shared worker;
   ledger callbacks keep collection views in sync. Removal calculates cross-pack
   shared references, preserving resources still used by another downloaded lesson.
6. Worker verifies/migrates unchanged images. Readiness is checked, not inferred
   from the stored app-version marker. UI resets checks when the controller updates.

No reviewed catalog/source images were rewritten by the refactor. Existing UP
IDs, `up-sandarshika-2026-v1`, source paths, query-less default and phase links remain.
Source-defined extensions go in pack config/adapters, not state-specific UI forks.

## Adding an instance

Use the skill's conversational discovery and frozen requirements brief. Import,
review and publish a new pack as documented in the pack contract; register its
catalog/metadata only when real content exists. Add schedule/language adapters if
the agreed source requires capabilities the runtime does not currently support.
Use distinct namespace and paths; do not change UP's identities. Reuse the shared
repository/reader/media/offline components. Test same IDs across different packs,
resource failures/retries, namespace isolation and source-specific visuals.

## Release and dependency coordination

After changing images: `npm run manifest` (does not ingest/review them).
After authoring module changes, choose a new release counter:

```sh
npm run release:assets -- r49
npm run check
npm test
npm run test:ingestion
npm run verify:publication
```

`r49` is an example, not a permanently next version. The release script coordinates
versioned entry/import/style URLs and app/worker versions, traverses actual static
and dynamic imports, and generates shell URLs plus registered pack indices. It
excludes reviewed catalog modules from rewriting; their importing edges can be
versioned. `npm run check` recursively syntax-checks dist modules, so new modules
cannot be silently omitted. The transitive offline test checks actual dependencies.

Neither command deploys or changes teacher-storage keys. Do not rename the legacy
worker-cache prefix casually: migration recognizes existing prepared caches.
Optional source images remain opt-in, not a mandatory whole-corpus preload.

## Verification and linked contracts

`tests/modularity.test.mjs` checks independent app contexts, legacy-key persistence,
null-preference recovery, source-derived default week, request deduplication,
retryability/cache isolation, offline namespace/shared-reference behavior and
injected language/source media. Existing catalog/content/routes/offline-upgrade
and publication tests remain. Browser verification covers composed features.

The PRD owns intended behavior; the requirements brief freezes source-specific
scope; this file owns boundaries; pack/content contracts own data; skill/reference
steps own execution; tests and task evidence establish actual verification. Change
these together when behavior/interfaces change. Do not treat historical docs or
previous test counts as current release evidence.

## Unified grade and subject expansion

[Curriculum expansion contract](CURRICULUM_EXPANSION.md) is authoritative for multi-grade/subject
UP growth: one state app with top Grade/Subject controls, Balvatika as level0,
metadata-derived valid pairs and disjoint immutable deliveries. New content must
not overwrite any previous published payload, image path or teacher-data identity.
Run all-delivery publication checks and the preservation baseline gate; never
reset the baseline to bypass a failure.

## Unified level/subject selection (r51)

`dist/domain/selection.mjs` aggregates immutable deliveries into state/edition
groups and resolves a unique grade/subject pair. Grade0 represents Balvatika.
`dist/views/curriculum-switcher.mjs` renders global Grade/Subject controls outside
main content on every screen. Deep lesson context links back to them. Pack
changes carry grade and UI locale in the query, flush notes and construct a new
context; within-pack grade changes retain their remembered week and open Find.
Read docs/CURRICULUM_EXPANSION.md for additive delivery and preservation gates.

## Persistent context header

`views/current-context.mjs` derives the grade/subject identity and location text
from the selected pack, screen and current source section. App composition updates
its existing DOM text on scrolling (without replacing focused controls) and measures
header/nav heights for sticky and anchor offsets. The top identity button returns
to selection controls. The section navigator no longer duplicates that identity.

## Content platform (v2, proposed)

The v2 plan separates a product-neutral content back end (model → versioned content release
→ shared query library) from the products that read it: this website, a chatbot, remedial-plan
and print tools. The website stays a consumer; it never owns curriculum data. Proposal and
owner decisions: [CONTENT_PLATFORM.md](CONTENT_PLATFORM.md).
