# Compact source-led lesson cards

Goal: make the app a usable visual extension of the supplied guides: authentic
inline artwork, compact integrated teaching cards and source-specific palettes.
Owner: one implementation agent, no delegated edits. No Git metadata exists in
this transferred folder, so no task worktree/branch was available.

Files: dist/app.mjs, curricula.mjs, lesson-visuals.mjs, guide-cards.css,
index.html, sw.js; tests/lesson-visuals.test.mjs, release.test.mjs; package.json;
README and developer/visual-design documentation. Catalog/source assets and
teacher-storage keys remain unchanged.

Acceptance: original illustrations appear inline; no invented artwork; tap/Enter
enlargement and zoom; source pages still accessible; accurate worksheet preview;
compact phone layout without blank image columns; source grade/template colours;
all lesson phases still scrollable; state and old phase URLs preserved.

Checks: 38 Node tests and 3 Python ingestion tests pass; syntax checks and
reviewed/publication equality pass. Fifteen direct lessons sampled against
source artwork across grade/week families. Weekly source pages compared.
Browser checks: three grades and Hindi/English at 360/390px; no horizontal
overflow; loaded artwork; headings clear sticky chips; full loop remains visible;
weekly plans retain one phase. Artwork keyboard activation, zoom, loaded source
and worksheet images, worksheet aspect ratio, focus return and state persistence
passed. Notes/bookmarks/completion QA values restored. No app console errors.
Principal heading-band contrast checked and minor source-colour text issues
repaired with darker foregrounds. Final local release r27; no production deploy.

Limits: see docs/VISUAL_DESIGN.md. Crop geometry is validated throughout; visual
sample comparison is not manual review of every illustration boundary. No
academic content was rewritten or independently signed off.
