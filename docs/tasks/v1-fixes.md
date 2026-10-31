# v1 website fixes (release r60)

Owner chose v1 website fixes on 31 Oct 2026. Branch `task/v1-fixes` from `main`; PR to `main`.

## Checks run first (localhost, release r59)
- **390 px:** find, week, lesson (Hindi G2/G3, Math G3), saved and help pages: no horizontal
  overflow, nothing wider than the viewport.
- **Keyboard only:** skip link, header links, language, curriculum controls, resume link, topic
  and week tabs, lesson cards; Enter opens the lesson and focus moves to `main`; step links,
  text size, save, offline, enlarge and worksheet buttons. Every stop has a visible focus ring.
- **Offline Hindi lesson:** kept `g2-hindi-w19-d03` offline ("पाठ बिना इंटरनेट के लिए तैयार है"),
  stopped the server and reloaded: lesson, 8 steps and both images load from the cache.
- Not possible here: real phones, TalkBack, physical printing.

## Fix: vowel signs shown as an empty ‘ ’
The guides print a bare vowel sign in quotes (‘ े ’) as a separate drawing, not text, so the
decoder produced ‘ ’. Lesson titles such as "‘ ’ मात्रा की पहचान करना" did not say which sign
is taught. 21 places on 12 guide pages and 2 workbook pages, in 13 lessons:

| Sign | Lessons (guide PDF page) |
|---|---|
| ‘ े ’ | G1 w17 d1 (62), d2 (63); G2 w2 d2 (26), w4 d1 (37); G3 w2 d2 (26), w4 d2 (38); workbook G1 p47, p49 (G1 w17 d1, d3) |
| ‘ ै ’ | G1 w25 d4 (108) |
| ‘ ं ’ | G1 w24 d1 (99), d2 (100); G2 w4 d4 (40); G3 w4 d3 (39) |
| ‘ ँ ’ | G3 w4 d4 (40) |

Each spot was located from the quote characters in the text layer and read from a 220-dpi
render. `repairs.json` records a `sign` per day (and per workbook page); `build_pack.py`
fills ‘ ’ with it. A sign repair does not mark the lesson `source-compared`, because only the
sign was compared. Rebuild compared with r59: only these 13 lessons change, only in these signs.
Written as space + combining sign (‘ े ’), like the existing ‘ ु ’ in G2 w4 d1.

Baseline: third recorded amendment (r60: Hindi catalog and worksheets hashes; configuration
unchanged). Test: `hindi-pack.test.mjs` rejects any empty ‘ ’.

## Reviewed and left as printed
- G3 w19 d6 cites workbook p82, whose badge says week 18 day 5: the guide's own citation.
- 8 source step-number misprints (unchanged).

## Not done (follow-ups)
- A lesson link without `?curriculum=` (for example `#/lesson/g2-hindi-…`) shows "lesson not
  found"; the id already names its subject, so the app could switch pack. Needs an app.mjs
  routing change.
- Load each subject's lessons only when selected (first-visit download).

## Checks (31 Oct 2026)
npm test 82/82; check; design:check; sw.js; verify:publication; publish --check both packs;
test:ingestion 15/15; verify:sources --require-complete; skill tests. Browser: G1 w17 d1 title
shows ‘ े ’; the worker upgraded r59 → r60 cache; no overflow at 390 px.
