"""Visible text spans of a PDF page with per-glyph positions.

Some pages keep an older edit under the current text: G3 TG p127 has two versions of
period 1 drawn on top of each other, and G2 TG p19 has a clipped tail under a preparation
note. MuPDF's structured text (rawdict) already drops clipped glyphs; for overlapped text,
the span drawn later is what the page shows, so earlier glyphs that overlap a later
glyph are dropped. Draw order comes from the text trace (seqno). Bold printed as a doubled
run is collapsed by the same rule.
"""


def _area(r):
    return max(0.0, r[2] - r[0]) * max(0.0, r[3] - r[1])


def _overlap(a, b):
    return _area((max(a[0], b[0]), max(a[1], b[1]), min(a[2], b[2]), min(a[3], b[3])))


def visible_spans(page, cell=12):
    order = {}
    for t in page.get_texttrace():
        for c in t['chars']:
            order.setdefault((chr(c[0]), round(c[2][0], 1), round(c[2][1], 1)), []).append(t['seqno'])
    spans = []
    for block in page.get_text('rawdict')['blocks']:
        for line in block.get('lines', []):
            for s in line['spans']:
                chars = []
                for c in s['chars']:
                    key = (c['c'], round(c['origin'][0], 1), round(c['origin'][1], 1))
                    # Both listings follow content-stream order: hand out each draw number once.
                    queue = order.get(key)
                    seqs = [queue.pop(0)] if queue else [0]
                    chars.append({'c': c['c'], 'x': c['origin'][0], 'bbox': c['bbox'],
                                  'w': c['bbox'][2] - c['bbox'][0], 'seqs': seqs})
                spans.append({'font': s['font'], 'size': s['size'], 'bbox': s['bbox'], 'chars': chars})
    grid = {}
    for si, s in enumerate(spans):
        for ci, ch in enumerate(s['chars']):
            if ch['c'].strip() and ch['w'] >= 0.3:
                b = ch['bbox']
                for gx in range(int(b[0] // cell), int(b[2] // cell) + 1):
                    for gy in range(int(b[1] // cell), int(b[3] // cell) + 1):
                        grid.setdefault((gx, gy), []).append((si, ci))
    for si, s in enumerate(spans):
        hidden_base = False
        for ci, ch in enumerate(s['chars']):
            if ch['w'] < 0.3 or not ch['c'].strip():
                ch['hidden'] = hidden_base and ch['w'] < 0.3      # marks follow their base glyph
                continue
            b, area, mine = ch['bbox'], _area(ch['bbox']), min(ch['seqs'])
            cells = {(gx, gy) for gx in range(int(b[0] // cell), int(b[2] // cell) + 1)
                     for gy in range(int(b[1] // cell), int(b[3] // cell) + 1)}
            def hides(oj, oc):
                other = spans[oj]['chars'][oc]
                if _overlap(b, other['bbox']) <= 0.3 * area:
                    return False
                newer = max(other['seqs']) > mine
                if other['c'] == ch['c'] and abs(other['x'] - ch['x']) < 0.6:
                    # the same glyph drawn twice: keep the newest drawing (or the later span)
                    return newer or (max(other['seqs']) == mine and oj > si)
                return newer
            ch['hidden'] = hidden_base = any(hides(oj, oc) for key in cells for oj, oc in grid.get(key, []) if oj != si)
    for s in spans:
        base = [c for c in s['chars'] if c['c'].strip() and c['w'] >= 0.3]
        # A span mostly overdrawn by newer text is an older edit: drop it whole so no orphan
        # glyphs remain. Otherwise drop only the overdrawn glyphs (e.g. a bold double).
        if base and sum(c['hidden'] for c in base) >= 0.4 * len(base):
            s['chars'] = []
        else:
            s['chars'] = [c for c in s['chars'] if not c['hidden']]
    return [s for s in spans if any(c['c'].strip() for c in s['chars'])]
