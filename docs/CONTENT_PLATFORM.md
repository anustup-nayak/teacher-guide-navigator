# Content platform: one content back end, many products

Status: design constraint, 31 October 2026. **Only the website is being built.** The owner
decided (31 Oct 2026) not to build other products now, but to shape the content repository so
they can be built later without restructuring it. Builds on the
[content architecture plan](CONTENT_ARCHITECTURE_PLAN.md) and the
[content model](CONTENT_MODEL.md). This is the product-neutral architecture constraint. The v2 website is now live on `main` (r71/content 1.3.4); other products are still out of scope.

## 1. Goal

Treat the extracted, reviewed and linked curriculum content as a **product-neutral content
back end**. The teacher website is its first consumer, not its owner. The same content can
then serve:

- the **website** (the deployed v2 app);
- a **chatbot** that answers teachers' questions from the guides, citing pages;
- **new tools** built on the content, for example remedial plans, printable weekly plans,
  routine cards, assessment trackers, training modules or other states' packs.

No product keeps its own copy of the curriculum, and none reads PDFs or `extracted/` files.
A correction made once in the model reaches every product.

## 2. Layers

```
 SOURCES        curricula/<pack>/originals/        PDFs + checksums (immutable)
    │
 EXTRACTION     curricula/<pack>/extracted/        decoded text, OCR, page renders (unreviewed)
    │           tools/, repairs.json               source-compared repairs
    ▼
 CONTENT CORE   curricula/<pack>/model/            ONE canonical model per edition:
                schemas/content-model/             structure (calendar, day types), outcomes,
                                                   sequence, routines, materials, assessments,
                                                   guide passages, lessons → periods → steps,
                                                   links with provenance and review status
    │  scripts/content/compile.mjs (Phase 3)       validate → integrity → emit
    ▼
 CONTENT RELEASE  content/<pack>/<version>/        versioned, immutable, static JSON
                  ├─ manifest.json                 version, schema version, files, hashes, review summary
                  ├─ entities/*.json               every node by kind (lessons, routines, outcomes…)
                  ├─ graph.json                    every link (from, to, assertion, review, rule, source)
                  ├─ views/app/…                   per-grade bundles for website consumers (current runtime still imports both catalogs)
                  ├─ views/v1/catalog.mjs          v1-compatible catalog (parity gate)
                  ├─ views/retrieval/chunks.jsonl  citable text chunks for search and chatbots
                  └─ CHANGELOG.json                what changed since the previous release (by id)
    │  content/query.mjs                           shared, dependency-free query library
    ▼
 PRODUCTS       website (v2 live) · chatbot · remedial-plan builder · print packs · teacher tools · …
```

Built now (Phase 3, for the website): `manifest.json`, `entities/`, `graph.json`,
`views/app/`, `views/v1/` and `CHANGELOG.json`, plus the query functions the website needs.
Designed but **not built** until a product needs it: `views/retrieval/` and the products below
the release. Adding them later is a new view and new consumers; the core and release format
stay as they are.

The **content release** is the contract. It is static files, so it can be hosted on
GitHub Pages next to the app, cached offline, downloaded by a bot service or loaded by a
script. No database or server is needed to *serve* content; a product that needs a server
(the chatbot) runs its own and reads the release.

## 3. The contract every product relies on

1. **Stable ids.** Lesson and step ids never change (teacher data depends on them); every
   other entity follows the [id rules](CONTENT_MODEL.md#2-identifiers). Products store ids,
   never copied text.
2. **Versioned releases.** `content/<pack>/<version>/` is immutable once published. A product
   pins a version, and upgrades by reading `CHANGELOG.json`. Schema changes follow semver:
   additive changes bump minor, breaking changes bump major and keep the previous major
   published until its products move.
3. **Provenance travels with the content.** Every entity and link carries its source page,
   `assertion` (stated / derived / editorial) and `review` status. Products must show where
   a statement comes from and must not present editorial or derived content as the guide's
   own words.
4. **One query library.** `content/query.mjs` (plain ES module, no dependencies, runs in the
   browser, Node and any bot) answers the questions products share, for example:
   - `lesson(id)`, `day(grade, week, day)`, `dayType(lesson)`;
   - `stepsByRoutine(routineId)`, `routine(id)` with its what / why / how / watch-outs;
   - `lessonsForOutcome(code)`: where an outcome is taught, revised and assessed;
   - `assessmentFor(grade, week)` and `remediationFor(grade, week, outcome?)`;
   - `passages(sectionId)`, `search(text, filters)`, `cite(id)` → doc, printed page, image crop.
   Each product calls these instead of re-implementing joins over the files.
5. **Review gates apply to every product.** A product shows only content whose review status
   its own rules allow (for example: the website shows editorial summaries only when
   `reviewed`; a chatbot answers only from `stated` and reviewed content).

## 4. How each product could use it (future; not scheduled)

| Product | Reads | Adds | Guardrails |
|---|---|---|---|
| **Website v2** | `views/app/` bundles, query library | Teacher notes, bookmarks, progress (on device, keyed by ids) | Design contract; offline; same storage keys |
| **Chatbot** (web or WhatsApp) | `views/retrieval/chunks.jsonl`, query library | Retrieval + an LLM to phrase answers | Every answer cites guide pages (`cite(id)`); answers only from retrieved content; says "the guide does not say" otherwise; never generates new pedagogy; no student data |
| **Remedial-plan builder** | Weekly assessment, remediation strategy, groups A/B, routines, outcomes by week | Teacher's choice of outcomes/children (on device) | Assembled from stated routines and activities; any generated wording is labelled and reviewable |
| **Print packs / routine cards / trackers** | Entities + page crops | Layout only | Original wording; source page on every card |
| **Teacher training / support tools** | Program-guide passages, routines, articles | Sequencing, quizzes (editorial) | Editorial items reviewed before use |
| **Other states / subjects** | Same schemas, new pack | New pack model | Same compiler gates; disjoint ids |

A product never edits the content release. Feedback ("this step is wrong") is reported
against an entity id and flows back into the model as a source repair, like r58 and r59.

## 5. Generated content

Products like the chatbot or remedial-plan builder will use language models. The model adds
a fourth origin to the three existing assertion types: **generated**. Rules:

- Generated text is never written into the content core; it lives in the product.
- It is always labelled, and always cites the stated content it was built from (entity ids).
- It never replaces the guide's activities, timings or numerals (PRD exclusion: no
  AI-generated replacement curriculum).
- A generated artefact that is reused (for example a remedial-plan template) goes through
  the same review gate as editorial content before it is shown as standard.

## 6. Repository and hosting shape

- Keep one repository. The content core, compiler and query library are product-neutral
  folders; each product lives in its own folder (`dist/` for the website today; `apps/bot/`
  or a separate repository later for server-side products).
- Publish content releases on the same Pages site at `/content/<pack>/<version>/` (or the
  preview site first). Products outside the browser fetch the same URLs.
- Products with secrets (an LLM key, a WhatsApp number) run outside GitHub Pages and keep
  their secrets out of this repository.

## 7. What this means for the build plan (website only)

- **Phase 3 (compiler)** emits the content release in the format above, limited to what the
  website needs: `manifest.json`, `entities/`, `graph.json`, `views/v1/catalog.mjs`
  (byte-for-byte parity gate), `views/app/` and `CHANGELOG.json`, with `content/query.mjs`
  covering the website's queries and their tests. No retrieval view, bot or generator.
- **Phase 7 (website v2)** reads only the content release through the query library, so the
  website is the first consumer of the same contract later products would use.
- **Design rules that keep the door open** (cost nothing now):
  - nothing product-specific in the content core or the release (no UI strings, layouts
    or app state; those live in the website);
  - every entity reachable by id from `entities/`, every relation in `graph.json`, with
    provenance and review status, even when the website does not show it yet;
  - the query library is plain ES modules with no browser APIs, so Node or a bot can import it;
  - releases are versioned and immutable, with a changelog by id.
- **Later (not scheduled):** chatbot, remedial-plan builder, print packs or teacher tools,
  each only after the owner approves a brief and the §8 decisions.

## 8. Decisions for the owner (needed only before a new product starts)

1. **Content rights.** [CONTENT_RIGHTS.md](../CONTENT_RIGHTS.md): no redistribution licence for
   the guides has been established. Serving content to a chatbot or third-party tools needs
   the rights holder's permission (SCERT UP / the publishers). Until then, releases are for
   our own products only.
2. **First new product.** Chatbot, remedial-plan builder or print packs?
3. **Chatbot channel and hosting.** Web chat on the site, or WhatsApp (needs a server and a
   provider account); which language model provider; cost owner.
4. **Generated content policy.** Allow labelled generated wording (§5), or retrieval-only
   answers that quote the guide?
5. **Release publication.** Public `/content/` URLs, or private until rights are clear.

## Phase 3 implementation

The compiler, immutable repository releases and website query library are implemented
on the v2 line; see [CONTENT_COMPILER.md](CONTENT_COMPILER.md). Both v1 catalogs pass
byte parity. These releases are not copied to the live Pages artifact. Full model
population and publication decisions remain separate.
