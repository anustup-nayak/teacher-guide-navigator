# Full scrollable lesson with section chips

Goal: show the entire source lesson loop in one page and jump by chips instead
of selecting a phase from a dropdown. No content changes.

Owner: single implementation agent. Files: dist/app.mjs, styles.css, index.html,
lesson-navigation.mjs, sw.js; tests/lesson-navigation.test.mjs and release.test.mjs;
package.json and relevant handoff docs. Source transfer has no Git metadata,
so no branch/worktree was available. No parallel edits.

Acceptance: preparation, all source phases, notes and references render inline;
all chips visible in a wrapping sticky navigator; active chip follows scrolling;
chip/keyboard jumps expose headings beneath the navigator; original phase URLs
and saved phases survive; weekly templates retain their original phase count;
completion remains explicit and reversible. Source readers remain accessible.

Behavior: phase chip jumps and manual scrolling persist the current phase using
existing storage keys and replace the current phase URL without adding a browser
history entry per scroll. Initial phase-zero links show the lesson overview;
nonzero legacy links resume at the requested phase. Preparation/notes/source
chips do not erase the last teaching phase. Pending notes flush on jumps.
The old fixed next/previous bar is replaced by the full-loop navigator and an
in-flow completion button after the teaching phases. App/worker release r18.
Versioned entry CSS/JS avoid a stale stylesheet paired with the updated UI.

Verification: 33 Node regression tests, 3 Python ingestion tests, syntax checks and
reviewed/publication byte equality. Browser: six visible phases and nine chips
for direct lessons; one phase/four chips for templates; no lesson details/select;
Hindi/English at 360/390px with no horizontal overflow; chip headings clear the
sticky navigator; Enter activates phase chips; legacy phase reload resumes;
manual scrolling moves active chip from phase 1 to 2 to 3; worksheet image loads;
notes survive a phase jump/reload and temporary test value is restored; no console
errors captured. Explicit completion persisted through reload and was undone
without changing source content. Physical-device and academic review remain separate checks.
