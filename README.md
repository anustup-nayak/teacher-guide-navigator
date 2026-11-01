# Sandarshika (संदर्शिका) — UP teacher-guide lesson companion

A buildless, offline-capable web app that helps Hindi-first government-school teachers in
Uttar Pradesh teach from the AY 2026–27 Teacher Guides: **Mathematics and Hindi (भाषा),
Grades 1–3, 732 day plans**. A teacher chooses grade and subject, then finds the day by topic
or by week and day, and follows the guide's own periods and steps, with the original pages one
tap away. Notes, bookmarks and progress stay on the device.

- **Production:** https://anustup-nayak.github.io/teacher-guide-navigator/ — deployed from `main`; release r71 / content 1.3.4 (persistent Grade/Subject header, Hindi teacher UI, 549 approved smart cards and source text repairs).
- **Integration:** `next`.
- **Frozen v1 fallback:** `/v1/`, staged by Pages from `v1.0.4`; `release/v1` remains frozen. See [VERSIONING.md](docs/VERSIONING.md).

## Run and check

Requires Node.js 22+ (and Python 3.11+ for ingestion and source-archive tools). No npm
dependencies, framework or build step.

```sh
python3 -m http.server 8000 --directory dist   # open http://localhost:8000
npm test                                        # all Node tests, including the design lock
npm run check                                   # module syntax and imports
npm run test:e2e                                # browser journeys (needs the server on :8765)
```

The full gate (CI runs the same): `npm run verify:content`, `npm run verify:site`,
`npm run verify:program`, `npm run verify:publication`, `npm run test:ingestion`,
`npm run verify:sources -- --require-complete`, `node --check dist/sw.js`.
Commands, releases and recovery: [DEVELOPMENT.md](docs/DEVELOPMENT.md).

## How content flows

```
PDFs (curricula/<pack>/originals)  →  decoded text (extracted/, unreviewed)
  →  canonical model (curricula/<pack>/model: program, structure, lessons, links, review status)
  →  content release (content/<pack>/<version>: entities, graph, views)  →  website (dist/)
```

The website is one consumer of the release; other products could read the same release
later ([CONTENT_PLATFORM.md](docs/CONTENT_PLATFORM.md)). Folder ownership:
[REPOSITORY_LAYOUT.md](docs/REPOSITORY_LAYOUT.md). Every statement keeps its source page and
review status; nothing is shown as academically reviewed unless it has been.

## Documentation

Start at the [documentation map](docs/README.md). Agents (Claude Code, Codex, others) follow
[AGENTS.md](AGENTS.md) and begin every session with [docs/HANDOFF.md](docs/HANDOFF.md). The UI is
built from one [design system](docs/DESIGN_SYSTEM.md) of tokens and components; the teaching flow is frozen by the
[design contract](docs/DESIGN_CONTRACT.md). Repeatable procedures are in [WORKFLOWS.md](docs/WORKFLOWS.md). New Teacher
Guide PDFs go through the reusable skill [skills/teacher-guide-to-app](skills/teacher-guide-to-app/SKILL.md).

## Rights and limits

Fonts: Noto Sans Devanagari and Noto Sans, SIL Open Font License (`dist/fonts/OFL.txt`). Guide, workbook and textbook content keeps its publishers' rights; no redistribution licence
has been granted ([CONTENT_RIGHTS.md](CONTENT_RIGHTS.md)). Text decoded from legacy fonts has
been compared with the page images on samples and repairs, not proofread line by line; there
has been no independent academic review, field study with teachers, or test on physical
phones, screen readers or printers.
