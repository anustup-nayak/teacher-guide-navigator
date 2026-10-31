"""Map UP Hindi workbook pages to week/day using their printed badges and page numbers.

Each practice page has a सप्ताह/दिवस badge (top left), a पाठ/heading band, activity
instructions beside pencil/ear icons, and the printed page number bottom right
(checked on सारंगी G1 p15). Output is unreviewed staging data:
python3 -I parse_workbooks.py REPO > workbooks.json
"""
import importlib.util
import json
import pathlib
import re
import sys

import fitz

HERE = pathlib.Path(__file__).resolve().parent


def load(name):
    spec = importlib.util.spec_from_file_location(name, HERE / f'{name}.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


guides = load('parse_guides')


def page_info(page):
    items = guides.spans(page)
    W, H = page.rect.width, page.rect.height
    top = ' '.join(s['text'] for s in sorted(items, key=lambda s: (s['y'], s['x'])) if s['y'] < H * 0.14)
    week = re.search(r'सप्ताह\s*(\d+)', top)
    day = re.search(r'दिवस\s*(\d+)', top)
    footer = [s for s in items if s['y'] > H * 0.9 and s['text'].strip().isdigit() and s['x'] > W * 0.75]
    printed = int(footer[-1]['text']) if footer else None
    heading = re.sub(r'\s+', ' ', ' '.join(s['text'] for s in sorted(items, key=lambda s: (s['y'], s['x']))
                                             if s['y'] < H * 0.14 and not re.search(r'सप्ताह|दिवस|^\s*\d+\s*$', s['text']))).strip()
    body = [s for s in items if H * 0.14 <= s['y'] < H * 0.9]
    lines = guides.lines_of(body, W * 2)        # one column: instructions run full width
    # Activity prompts end with a dash ("…अपने साथी को बताएँ-"), sometimes followed by a note.
    instructions = [re.sub(r'\s*[-–]\s*(\(.*\))?\s*$', '', l['text']).strip() for l in lines
                    if len(l['text']) > 10 and re.search(r'[-–]\s*(\(.*\))?\s*$', l['text'])]
    return {'week': int(week.group(1)) if week else None, 'day': int(day.group(1)) if day else None,
            'printedPage': printed, 'heading': heading, 'instructions': instructions[:6],
            'width': W, 'height': H}


if __name__ == '__main__':
    repo = pathlib.Path(sys.argv[1])
    out = {}
    for f in sorted((repo / 'curricula/up-hindi-2026/originals').glob('workbook-g*.pdf')):
        doc = fitz.open(f)
        out[f.stem] = [{'pdfPage': i + 1, **page_info(doc.load_page(i))} for i in range(doc.page_count)]
    json.dump(out, sys.stdout, ensure_ascii=False, indent=1)
