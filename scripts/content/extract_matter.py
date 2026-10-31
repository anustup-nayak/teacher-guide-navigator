"""Extract the front and back matter of each archived Teacher Guide as decoded, line-grouped text.

Phase 1 of docs/CONTENT_ARCHITECTURE_PLAN.md: the program profiles are written from this
output. Lesson pages are skipped; the lesson range per guide comes from the published
catalog (first and last pdfPage any lesson cites) and is passed in MATTER below.

Output: curricula/<pack>/extracted/matter/<document>.json with, per page, its lines in
reading order (text, size, bold) and a `headings` list (bold or large lines). Text is the
legacy-font decoding only: never paraphrased, still unreviewed.

Usage: python3 scripts/content/extract_matter.py [pack-id ...]
"""
import importlib.util
import json
import pathlib
import sys

import fitz

ROOT = pathlib.Path(__file__).resolve().parents[2]
TOOLS = ROOT / 'curricula/up-hindi-2026/tools'


def _load(name):
    spec = importlib.util.spec_from_file_location(name, TOOLS / f'{name}.py')
    module = importlib.util.module_from_spec(spec)
    sys.path.insert(0, str(TOOLS))
    spec.loader.exec_module(module)
    return module


hindi = _load('hindi_text')
visible = _load('visible_text')

# (pack, document stem, last front-matter pdf page, first back-matter pdf page)
MATTER = [
    ('up-hindi-2026', 'guide-g1-00970fd3c1e8', 18, 111),
    ('up-hindi-2026', 'guide-g2-d86262b7a94c', 18, 159),
    ('up-hindi-2026', 'guide-g3-ab99c837f781', 18, 159),
    ('up-math-2026', 'guide-g1-167f09e3bf58', 17, 85),
    ('up-math-2026', 'guide-g2-9b3436f6e0f7', 18, 116),
    ('up-math-2026', 'guide-g3-186da9c8f52a', 18, 115),
]


def font_family(font):
    # AAText (Math guides) is Kruti-compatible but stores glyphs in the U+F0xx private area.
    return 'KrutiDev' if 'aatext' in font.lower() else font


def page_spans(page):
    out = []
    for s in visible.visible_spans(page):
        font = font_family(s['font'])
        chars = [(chr(ord(c['c']) - 0xF000) if 0xF000 <= ord(c['c']) <= 0xF0FF else c['c'], c['x'], c['w'])
                 for c in s['chars']]
        raw = hindi.ordered_text(chars) if hindi.family(font) else ''.join(c for c, _, _ in chars)
        text = hindi.decode(raw, font).strip()
        if not text:
            continue
        boxes = [c['bbox'] for c in s['chars'] if c['c'].strip()]
        out.append({'text': text, 'size': round(s['size'], 1),
                    'bold': 'bold' in s['font'].lower() or '-1-B' in s['font'],
                    'x': min(b[0] for b in boxes), 'y': min(b[1] for b in boxes),
                    'y1': max(b[3] for b in boxes)})
    return out


def lines(spans):
    rows = []
    for s in sorted(spans, key=lambda s: (s['y'], s['x'])):
        for row in rows:
            if s['y'] < row['y1'] - 2 and s['y1'] > row['y'] + 2:
                row['spans'].append(s)
                row['y1'] = max(row['y1'], s['y1'])
                break
        else:
            rows.append({'y': s['y'], 'y1': s['y1'], 'spans': [s]})
    out = []
    for row in sorted(rows, key=lambda r: r['y']):
        parts = sorted(row['spans'], key=lambda s: s['x'])
        out.append({'text': ' '.join(p['text'] for p in parts),
                    'size': max(p['size'] for p in parts),
                    'bold': all(p['bold'] for p in parts), 'y': round(row['y'])})
    return out


def extract(pack, stem, front_end, back_start):
    doc = fitz.open(ROOT / 'curricula' / pack / 'originals' / f'{stem}.pdf')
    pages = []
    for number in list(range(1, front_end + 1)) + list(range(back_start, doc.page_count + 1)):
        rows = lines(page_spans(doc[number - 1]))
        body = sorted({r['size'] for r in rows})
        base = body[len(body) // 2] if body else 0
        pages.append({'pdfPage': number, 'part': 'front' if number <= front_end else 'back',
                      'needsOCR': not rows,
                      'headings': [r['text'] for r in rows if r['bold'] or r['size'] >= base + 3],
                      'lines': rows})
    return {'document': stem, 'pageCount': doc.page_count, 'frontMatter': [1, front_end],
            'backMatter': [back_start, doc.page_count], 'reviewStatus': 'decoded-unreviewed',
            'pages': pages}


def main(packs):
    for pack, stem, front_end, back_start in MATTER:
        if packs and pack not in packs:
            continue
        out = ROOT / 'curricula' / pack / 'extracted/matter' / f'{stem}.json'
        out.parent.mkdir(parents=True, exist_ok=True)
        data = extract(pack, stem, front_end, back_start)
        out.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n')
        empty = [p['pdfPage'] for p in data['pages'] if p['needsOCR']]
        print(f'{out.relative_to(ROOT)}: {len(data["pages"])} pages, no text on {empty}')


if __name__ == '__main__':
    main(sys.argv[1:])
