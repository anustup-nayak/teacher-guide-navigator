# Source archive contract

The repository preserves authorized original PDFs, checksum/provenance manifests,
reproducible extraction outputs, reviewed content and the published app as separate
stages. GitHub Pages serves only `dist/`; PDFs are not precached or copied there.
This supersedes earlier instructions that excluded all originals from Git.

## Locations and identity

- `curricula/<pack-id>/originals/`: immutable PDF bytes and `manifest.json`.
- `curricula/<pack-id>/extracted/<document-id>/pages.json`: reproducible embedded
  text, explicitly unreviewed; `summary.json` records coverage. Transient renders,
  OCR experiments, logs and private correspondence remain ignored.
- `curricula/<pack-id>/reviewed/`: reviewed publication inputs.
- `dist/`: runtime and reviewed derivatives only.

Use `curriculum_workspace.py import` rather than renaming/reconstructing originals.
The importer records SHA-256 and a content-derived ID. Compare an existing pack's
source hash before importing a candidate. Same title/page count does not establish
identity. Never substitute another edition or rebuild an original from WebPs.
The original UP transfer did not contain PDFs or extraction intermediates; recovered
embedded text is a fresh extraction, not a recovered historical OCR pipeline run.

```sh
python3 scripts/curriculum_workspace.py import up-math-2026 /path/to/source.pdf --kind guide --grade 1
python3 scripts/curriculum_workspace.py extract up-math-2026
npm run verify:sources
npm run verify:sources -- --require-complete
```

`verify:sources` checks every archived PDF signature/hash, registered filenames,
known published-source hashes and regular-Git size constraints. It reports missing
expected documents. `--require-complete` fails if any expected source is missing.
App publication checks remain separate: having the originals does not approve OCR
or overwrite reviewed lessons. Do not regenerate reviewed content during archiving.

## Size and rights

Approve source files for the intended repository audience before staging. Keep
source attribution and rights distinct from the software licence. `CONTENT_RIGHTS.md`
records the current terms without inventing a redistribution licence.

Regular GitHub commits cannot contain files larger than 100 MiB. Use an intentional
external checksum-addressed archive or Git LFS for oversized source-only documents;
record restoration instructions and account for storage/bandwidth. Never apply LFS
to the runtime WebPs or module payloads needed by Pages. See
[GitHub file limits](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)
and [LFS limitations](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-git-large-file-storage).

In this repository oversized originals use Git LFS, tracked by exact path in
`.gitattributes` (first case: the 134.7 MB UP Hindi Grade 3 workbook, 31 October 2026).
`verify:sources` accepts a file over 100 MiB only when it is LFS-tracked. CI checks
out without LFS content, so the verifier checks the LFS pointer's SHA-256 against the
manifest instead of downloading the file; this keeps GitHub's free LFS bandwidth for
people who restore sources. To restore locally: install Git LFS, run
`git lfs install --local`, then `git lfs pull`.

## Current UP coverage

Math (`up-math-2026`):

The expected archive includes three Teacher Guides, three Workbooks and the Grade 3
textbook used to produce the current 990 page images. The manifest reports exact
recovered files and checksums; run the strict command above for current completeness.
Grade 1/2 textbooks were not ingested into the current app and are not required to
reproduce its published images. Their recorded sources exceed the connector retrieval
limit (about 357/404 MB); the app intentionally retains printed-book references.
Source acquisition links remain in the existing reviewed `sources.json`; private
emails, sender contact information and authentication material are not archived.

UP Hindi (`up-hindi-2026`, added 31 October 2026): Teacher Guides for Grades 1–3
(2026–27) and the सारंगी Grade 1/2 and वीणा-1 Grade 3 workbooks (cover editions
2024–25, 2025–26, 2025–26), received from Renu Chauhan's Drive folder. No Hindi
textbooks were supplied. Status: discovery; nothing published yet.
