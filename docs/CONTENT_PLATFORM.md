# Content platform: one content back end, many products

Status: proposal, 31 October 2026, for the owner's decision (§8). Builds on the
[content architecture plan](CONTENT_ARCHITECTURE_PLAN.md) and the
[content model](CONTENT_MODEL.md). Nothing here changes the live v1 app.

## 1. Goal

Treat the extracted, reviewed and linked curriculum content as a **product-neutral content
back end**. The teacher website is its first consumer, not its owner. The same content can
then serve:

- the **website** (today's app, then v2);
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
                  ├─ views/app/…                   per-grade bundles for the website (lazy loaded)
                  ├─ views/v1/catalog.mjs          v1-compatible catalog (parity gate)
                  ├─ views/retrieval/chunks.jsonl  citable text chunks for search and chatbots
                  └─ CHANGELOG.json                what changed since the previous release (by id)
    │  content/query.mjs                           shared, dependency-free query library
    ▼
 PRODUCTS       website (v1 → v2) · chatbot · remedial-plan builder · print packs · teacher tools · …
```

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

## 4. How each product uses it

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

## 7. Changes to the build plan

- **Phase 3 (compiler)** emits a content release, not only app bundles: `manifest.json`,
  `entities/`, `graph.json`, `views/v1/catalog.mjs` (byte-for-byte parity gate),
  `views/app/` and `views/retrieval/`. It also ships `content/query.mjs` with tests.
- **Phase 7 (app v2)** reads only the content release through the query library.
- **New Phase 10: product pilots**, each after the owner approves a one-page brief:
  10a chatbot prototype on the preview site (grounded answers with page citations, evaluated
  on a fixed question set); 10b remedial-plan builder; 10c print packs. Each pilot gets its
  own acceptance tests and review gate; none may change the content core except through
  source repairs.

## 8. Decisions for the owner

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
