# Source repair: Hindi G2 week 19 day 3 (`g2-hindi-w19-d03`), release r58

Owner approved in chat on 31 Oct 2026 ("Yes, repair it"). Branch `task/repair-g2-hindi-w19-d03`
from `main`; PR to `main`. Found by the v2 program-structure check (`next`, PR #9), which
showed this day with two periods where its day type has three.

## Problem
TG G2 PDF p124 (printed p122) prints three periods. The parser:
- kept 2.1 with only one of its four actions and 2.2 with one of its two questions;
- dropped 2.3 (गतिविधि 1 और 2) and all of period 3 (3.1 प्रवाहपूर्ण पठन अभ्यास,
  3.2 समूह-A के साथ रिमीडियल कार्य);
- attached period 3's word grid (खुरपी… in 3.2) to step 2.1.

## Fix
- `curricula/up-hindi-2026/tools/repairs.json` `g2-w19-d3`: periods 2 and 3 transcribed
  from 150-dpi renders, as printed (मे अँगुली, सही पढ़ें). Period 1 compared with a 120-dpi
  render: parser text matches word for word.
- `tools/build_pack.py`: a repair may now add a period the parser dropped (it could only
  replace one).
- Rebuilt with `build_pack.py --no-images` and published with `publish_curriculum.mjs`.
  Only this lesson and its grid crop changed (compared against the previous snapshot):
  8 steps, 3 periods, 120 minutes, all `source-compared`.
- Teacher data: step ids p1-1…p2-2 unchanged; p2-3, p3-1, p3-2 are new. No storage change.
- `curricula/published-baseline.json`: reviewed amendment of two records (Hindi configuration
  hash; `packs/up-hindi-2026/catalog.mjs` hash), with old and new values, reason and evidence in
  a new `amendments` list. No other record touched; nothing regenerated.
- Release r58 (`npm run manifest`, `npm run release:assets -- r58`).

## Checks (31 Oct 2026)
npm test 80/80 (design lock OK: index.html differs only in `?v=`); npm run check; sw.js syntax;
verify:publication; publish --check both packs; test:ingestion 12/12; verify:sources
--require-complete; skill preflight 4/4. Browser (localhost): lesson shows 8 steps, grid on
step 8; Hindi and English; 360 and 390 px without horizontal overflow; legacy `/teach/` link;
Math lesson unchanged; no console errors. Not run: real phones, offline re-download.

## Follow-ups
- When `main` is merged into `next`, remove the `g2-hindi-w19-d03` exception from
  `curricula/up-hindi-2026/model/structure.json` (the structure test reports it as no longer needed).
- Done in r59 ([grid task](hindi-grid-columns.md)). Was: the same grid mis-attachment may exist on other days: e.g. G2 w19 d2 attaches a right-column
  grid to 3.1 (left column) that may belong to 3.2. Not checked; needs its own source review.
