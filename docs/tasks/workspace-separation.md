# Separate source and parsed content

Goal: per-curriculum original → extracted → reviewed → published stages without
changing the current UP app's data, image URLs or storage identities.

Files: curricula/; scripts/curriculum_workspace.py; scripts/publish_curriculum.mjs;
tests/test_curriculum_workspace.py; tests/workspace.test.mjs; .gitignore;
package.json; CI workflow; ingestion requirements; README and curriculum workflow docs.

Acceptance: original bytes immutable during extraction, checksummed manifests,
no automatic draft publication, independent pack workspaces, UP published data
byte-identical to reviewed snapshot, future pack publication paths namespaced.

Automated: 29 Node checks + 3 Python ingestion tests pass; app/worker syntax
and reviewed/publication equality pass. Tests exercise PDF import/extract,
image-only page flagging, source corruption detection, path rejection,
unreviewed publication rejection, private-source exclusion and drift detection.

Limits: original UP PDFs/intermediates were absent from the transferred tree;
these stages are reserved and explicitly documented rather than invented.
Legacy UP scripts remain forensic tools with old mixed-folder assumptions;
new sources use the separate workspace entrypoint and reviewed mapping.
No deployment or independent academic sign-off. This folder has no Git metadata.

Browser: grade/week navigation and original-page loading passed; legacy phase
URL retained; notes/bookmarks survived reload and temporary test values were
restored. Hindi/English layouts at 360/390px had no horizontal overflow;
keyboard skip link retained the lesson phase; no captured console errors.
