# Hindi grid crops on the right step (release r59)

Owner approved in chat on 31 Oct 2026 ("Yes, release r59") after the check of G2 w19 d2.
Branch `task/hindi-grid-columns` from `main`; PR to `main`.

## Problem
`parse_guides.py` `attach_grids` gave each letter/word grid to the first step whose height range
contained it, ignoring columns. In period 3, step 3.1 (left column) sits beside 3.2 (right column,
remedial work), so grids printed in 3.2 were shown on 3.1. Found while repairing
`g2-hindi-w19-d03` (r58).

## Fix
- Each parsed step records its column (`col`); a grid goes only to steps in its own column
  (falling back to all steps on the page if none is in that column).
- Re-parsed all three guides and rebuilt with `build_pack.py --no-images`. Compared with r58:
  all 366 lessons are byte-for-byte unchanged (text, steps, ids, timings); 133 of 175 grid crops
  move (132 from p3-1 to p3-2, 1 from p2-1 to p2-2 in `g3-hindi-w19-d01`); 42 stay.
- Checked against page images: G1 w14 d3, G2 w19 d2, G3 w5 d1 (grid in 3.2), G3 w19 d1 (in 2.2),
  G1 w23 d2 (left-column grid stays in 2.1). The other moves follow the same rule; not each
  viewed.
- Baseline: second recorded amendment (r59; configuration hash and Hindi catalog hash; 133 lesson
  ids listed). No teacher data affected: no step ids change.
- Tests: `tests/test_hindi_grids.py` (column rule) and a pack test in `tests/hindi-pack.test.mjs`
  (sample lessons; no right-column grid on 3.1).

## Checks (31 Oct 2026)
npm test 81/81; check; design:check; sw.js; verify:publication; publish --check both packs;
test:ingestion 15/15; verify:sources --require-complete; skill tests. Browser (localhost):
G2 w19 d2 and G1 w14 d3 show the grid on समूह-A remedial work, G3 w19 d1 on गतिविधि 3; Hindi and
English; 360 and 390 px without overflow; no console errors. Not run: real phones.

## After merge
Fast-forward `release/v1`, tag `v1.0.2`, merge `main` into `next`.
