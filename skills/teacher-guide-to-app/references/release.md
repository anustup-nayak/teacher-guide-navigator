# Release, durability and handover

Whole-program metadata is mandatory: follow [program understanding](program-understanding.md)
and `docs/PROGRAM_METADATA.md`. Run `npm run verify:program` and the pinned
`npm run verify:content`; a source profile alone cannot replace structured evidence,
calendar/day-type validation or source review. Preserve older immutable releases.


## Release identity and cache coherence

A pack storageKey identifies teacher data permanently; it is not a release cache
version. An edition change needs an intentional identity decision and optional
migration, never a localStorage reset. Keep old UP default routes and keys.

After page-asset changes, run `npm run manifest` and inspect the generated changes.
The manifest hashes all published .webp files, including new pack folders. On
updates, unchanged old downloads can migrate by hash; changed assets require
fresh download. If integrity/migration cannot complete safely, retain old cache
for recovery. A successful UI update must not delete all prepared teaching pages.

`npm run design:check` (also inside `npm test`) must pass. Release version bumps
in `dist/index.html` do not trip it; any style or shell change needs an owner
approval recorded with `npm run design:approve` (see `docs/DESIGN_CONTRACT.md`).

Before releasing changed modules/styles, run `npm run release:assets -- rNN`
with the chosen new release counter, then inspect the coordinated version references
in `dist/index.html`, `bootstrap.mjs`, `app.mjs`, `sw.js` and any new versioned
imports/resource-index requests. Inventory actual references rather than blindly
replacing every occurrence of an old number across unrelated data. Shell caches
must contain the exact versioned entrypoints and all transitive modules, including
dynamic imports. Add new pack modules/indices to the shell; large page images are
opt-in lesson downloads rather than precaching every book.

Run final syntax, Node, ingestion and publication-equality checks after the last
edit. Check all registered packs, not just the UP npm shortcut. Read test failures
and process exit codes; piping to tail can hide a failing command's exit status.
Do not infer success from a cached old browser page. Inspect served entry/import
versions and use a fresh session for final console checks. Test an existing
installation upgrade as well as a clean visit.

## Durable repo handoff

The initial app existed in a temporary hosted workspace. A UI change was lost
when it was cleaned up; the later source handoff honestly disclosed that the live
app still had a dropdown. Prevent recurrence:

- Persist actual source, tests, source adapters, normalized reviewed records,
  provenance, rendered assets, manifests and task evidence before transient cleanup.
- Include app run instructions, optional ingestion dependencies, CI commands,
  pack schema and known incomplete review. Archive authorized originals/checksums and reproducible extraction per
  `docs/SOURCE_ARCHIVE.md`; keep transient OCR/renders local. Publish only dist/.
- Check a clean copy/checkout: Node/Python prerequisites, localhost server,
  .mjs MIME type, relative paths, all required images, no browser sign-in requirement.
- No build step/runtime framework is needed for the current app. Do not add an
  API key or backend merely to reproduce the skill.
- If multi-agent work is explicitly enabled, use separate branches/worktrees and
  task ownership. app.mjs/CSS are shared hotspots. Integrate reviewed changes one
  at a time and run the full combined gate; shared browser data is separate risk.
- Record tested commit ID when Git exists. Without Git, record an archive checksum
  and explicit manifest; never invent a branch/push/PR/deployment outcome.

## Local publication versus external operations

The publisher copies reviewed content into dist; it does not push GitHub or
update the live site. GitHub Actions checks are not automatic Sites deployment.
A previous public URL or hosting manifest is context, not permission to change a
new destination. Use the user's current authorization and available hosting tool.
If using a host-specific publication skill/tool, follow its current instructions
and preserve the intended audience. Do not add a blanket permission stop to an
already authorized reversible local task.

For an authorized deploy, package the exact tested dist/ website artifact and retain
the tested repository commit/checksum separately. Exclude raw PDFs and extraction
from the website; exclude credentials, signed links, private notes, QA harnesses
and unrelated scratch outputs from both repository and website. After publication,
verify the actual HTTPS URL/version, lesson navigation, required images, source
readers, print/download and offline readiness. Do not call a deployment complete
because an upload command returned without inspecting its output and live result.

## Evidence and communication

Use the task note and QA template. Record coverage counts, source families,
reviewed exceptions, missing resources, actual commands/exits, tested browsers/
viewports/locales, screenshots, defect/fix/retest references and explicit limits.
Do not copy historical test counts/status into a new release as if re-executed.
User-facing updates say which fix was completed and what was verified; provide
status during sustained work rather than leaving the user uncertain.

Final handoff includes:

1. What was built/changed and why; new pack identity and coverage.
2. Local and, if actually published, public URL; exact release identity.
3. Current test results and source-review scope with inspectable evidence.
4. Source/parsed/reviewed/published locations and commands for the next agent.
5. Missing resources and genuinely unperformed human/physical/production checks.
6. Remaining required work, if any, without calling partial work complete.

One-pass execution means the agent owns the complete implementation/verification
loop from a sufficiently specified input; it does not eliminate source-specific
judgment, repair iterations or evidence requirements.

For new deliveries, run the all-pack publication/preservation gate. Register only
reviewed disjoint coverage, use record:additions to append baseline entries after
old records have passed verification, and retain all prior parsed/page hashes.
A catalog baseline change for an intentional source correction is separate from
a grade/subject addition and must be reviewed explicitly.

## GitHub source archive and Pages

For GitHub delivery, read `docs/SOURCE_ARCHIVE.md` and `docs/GITHUB_PAGES.md`. Run
`npm run verify:sources` and report missing originals separately from app readiness.
Do not replace a missing source with a different-checksum edition or a PDF rebuilt
from page images. Archive PDFs outside dist; Pages uploads dist only. Test the
actual project-prefix HTTPS URL after the check-gated workflow deploys.

## Content-model releases on the v2 line

Read `docs/HANDOFF.md`, `docs/VERSIONING.md` and `docs/CONTENT_COMPILER.md`. Compiler
work branches from `next`; it does not change the live site. Run `npm run verify:content`
alongside v1 preservation/design gates. Do not re-run the one-time v1 importer to reset
authored models. Use a new semantic content version for changed release bytes, with an
explicit previous version; keep old IDs/directories. Derived links and editorial summaries
need reviewed/owner-approved status before default website queries expose them. A schema/
parity pass freezes ontology v1.0, not academic approval or completion of Phases 4–5.

The website on `next` is pinned to a release (`content/website.json`). `npm run site:publish`
copies each pinned release's hash-checked `views/v1/catalog.mjs` into `dist/` and generates
`dist/day-types.mjs` from its `structure.json`; `npm run verify:site` and
`tests/site-from-release.test.mjs` fail if `dist/` drifts or if the per-grade app bundles lack any
field the website shows. Advance the pin, `verify:content` and the release together. `next` keeps
its own higher rNN release token than `main`; after merging `main` into `next`, re-run
`release:assets` there. When checking in a browser, a server without cache headers (Python's)
lets the browser keep old modules under an unchanged token: use a fresh port or new token.

File-sync tools (iCloud Desktop & Documents, Dropbox) can drop copies such as `lessons/1 2.json`
or `.git/refs/heads/next 2` into the tree; they double-count lessons or break git. The compiler
and `tests/docs.test.mjs` refuse them. Move them out (never delete without looking) and keep the
repository out of synced folders.
