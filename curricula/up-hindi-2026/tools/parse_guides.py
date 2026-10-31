"""Parse UP Hindi 2026-27 Teacher Guide day pages into periods, steps, actions and questions.

Layout (checked on TG G1 p20, G2/G3 p19): a सप्ताह/दिवस badge at the top; each period is a band
that starts at its "कालांश-N … 40 मिनट" header; inside a band, two columns are read left then
right. A step starts with a bold "N.N" number, its title and minutes. A new action starts with
a leading space at the column edge; "•" starts a question. Lines before the first step of a
period are its objective (bold) and materials/preparation (bold name + normal note).
Output is unreviewed staging data: python3 -I parse_guides.py REPO > guides.json
"""
import importlib.util
import json
import pathlib
import re
import sys

import fitz

HERE = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('hindi_text', HERE / 'hindi_text.py')
hindi = importlib.util.module_from_spec(spec)
spec.loader.exec_module(hindi)
spec = importlib.util.spec_from_file_location('visible_text', HERE / 'visible_text.py')
visible = importlib.util.module_from_spec(spec)
spec.loader.exec_module(visible)

TOP, BOTTOM = 45, 735          # badge row above, footer below (points)
PREP_X = 168                   # preparation-note column inside a period preamble
STEP = re.compile(r'^\s*(\d)\.(\d)(?!\d)\s*$')   # the step number is its own span (KrutiDev bold)
MINUTES = re.compile(r'(\d+(?:\s*-\s*\d+)?)\s*मिनट')
PERIOD = re.compile(r'कालांश\s*-\s*(\d)(?:\s*(?:एवं|और|व|,)\s*(\d))?')


def drawn_once(chars):
    """Bold is printed by drawing a run twice, sometimes with different spacing; keep one copy."""
    letters = [c for c, _, _ in chars if c != ' ']
    n = len(letters)
    if n > 3 and n % 2 == 0 and letters[:n // 2] == letters[n // 2:]:
        seen = 0
        for i, (c, _, _) in enumerate(chars):
            seen += c != ' '
            if seen == n // 2:
                return chars[:i + 1]
    return chars


def spans(page):
    out = []
    for s in visible.visible_spans(page):
        chars = drawn_once([(c['c'], c['x'], c['w']) for c in s['chars']])
        raw = hindi.ordered_text(chars) if hindi.family(s['font']) else ''.join(c for c, _, _ in chars)
        text = hindi.decode(raw, s['font'])
        if not text.strip():
            continue
        boxes = [c['bbox'] for c in s['chars'] if c['c'].strip()]
        out.append({'text': text, 'lead': raw[:1] == ' ', 'size': s['size'],
                    'x': min(b[0] for b in boxes), 'y': min(b[1] for b in boxes),
                    'x1': max(b[2] for b in boxes), 'y1': max(b[3] for b in boxes),
                    'bold': 'bold' in s['font'].lower() or '-1-B' in s['font']})
    return out


def lines_of(items, mid):
    """Group spans into lines per column by vertical overlap (raised small text such as the A in
    समूह-A sits a few points lower); split a line where a wide gap separates two segments."""
    cols = {'L': [], 'R': []}
    for s in sorted(items, key=lambda s: (s['y'], s['x'])):
        col = cols['L' if s['x'] < mid else 'R']
        for line in col:
            if s['y'] < line['y1'] - 2 and s['y1'] > line['y'] + 2:
                line['spans'].append(s)
                line['y1'] = max(line['y1'], s['y1'])
                break
        else:
            col.append({'y': s['y'], 'y1': s['y1'], 'spans': [s]})
    result = []
    for name in ('L', 'R'):
        for line in sorted(cols[name], key=lambda l: l['y']):
            step = next((STEP.match(s['text']) for s in line['spans'] if STEP.match(s['text'])), None)
            minutes = next((MINUTES.search(s['text']).group(1).replace(' ', '') for s in line['spans']
                            if MINUTES.fullmatch(s['text'].strip())), None)
            small = [s['text'].strip() for s in line['spans'] if s['size'] < 9 and s['text'].strip().isdigit()]
            words = [s for s in line['spans'] if not STEP.match(s['text']) and not MINUTES.fullmatch(s['text'].strip())
                     and not (s['size'] < 9 and s['text'].strip().isdigit())]
            segs, cur = [], []
            for s in sorted(words, key=lambda s: s['x']):
                if cur and s['x'] - cur[-1]['x1'] > 40:
                    segs.append(cur)
                    cur = []
                cur.append(s)
            segs.append(cur)
            for i, seg in enumerate(segs):
                result.append({'col': name, 'y': line['y'], 'y1': line['y1'], 'x': seg[0]['x'] if seg else line['spans'][0]['x'],
                               'text': re.sub(r'\s+', ' ', ''.join(s['text'] for s in seg)).strip(),
                               'lead': bool(seg) and seg[0]['lead'], 'bold': bool(seg) and all(s['bold'] for s in seg),
                               'parts': [(s['x'], s['text'], s['bold']) for s in seg],
                               'segment': i, 'step': step if i == 0 else None, 'minutes': minutes if i == 0 else None,
                               'small': small if i == 0 else []})
    return result


def grids(page):
    """Letter/word grids are clusters of small drawn squares; their cell text is not prose."""
    cells = [d['rect'] for d in page.get_drawings()
             if 8 < d['rect'].width < 32 and abs(d['rect'].width - d['rect'].height) < 3]
    clusters = []
    for r in cells:
        hits = [c for c in clusters if (r + (-3, -3, 3, 3)).intersects(c['box'])]
        box, n = fitz.Rect(r), 1
        for c in hits:
            box |= c['box']
            n += c['n']
            clusters.remove(c)
        clusters.append({'box': box, 'n': n})
    # Step-number badges and icons are small stacks of shapes; real grids span several cells.
    return [c['box'] for c in clusters if c['n'] >= 4 and c['box'].width > 30 and c['box'].height > 30]


def page_model(page):
    items = spans(page)
    W, H = page.rect.width, page.rect.height
    badge = ' '.join(s['text'] for s in items if s['y'] < TOP)
    week = re.search(r'सप्ताह\s*(\d+)', badge)
    day = re.search(r'दिवस\s*(\d+)', badge)
    boxes = grids(page)
    inside = lambda s, b: b.x0 - 1 <= (s['x'] + s['x1']) / 2 <= b.x1 + 1 and b.y0 - 1 <= s['y'] + 4 <= b.y1 + 1
    body = [s for s in items if TOP <= s['y'] < BOTTOM and not any(inside(s, b) for b in boxes)]
    # "क्या आप जानते हैं?" tip boxes sit below the steps; keep their text out of the steps.
    tip = next((s for s in body if 'जानते हैं' in s['text'] and s['size'] >= 12), None)
    tips = []
    if tip:
        tips = [s['text'].strip() for s in sorted(body, key=lambda s: (s['y'], s['x'])) if s['y'] >= tip['y'] - 4]
        body = [s for s in body if s['y'] < tip['y'] - 4]
    headers = []
    for s in body:
        m = PERIOD.search(s['text'])
        if m:
            row = [t for t in body if abs(t['y'] - s['y']) <= 4 and t is not s]
            title = ' '.join(t['text'].strip() for t in sorted(row, key=lambda t: t['x']) if not MINUTES.search(t['text']) and t['x'] < s['x'])
            mins = next((MINUTES.search(t['text']).group(1) for t in row if MINUTES.search(t['text'])), None)
            label = m.group(1) + (' एवं ' + m.group(2) if m.group(2) else '')
            headers.append({'period': int(m.group(1)), 'label': label, 'y': s['y'], 'title': title.strip(), 'minutes': mins})
    headers.sort(key=lambda h: h['y'])
    bands, edges = [], [TOP] + [h['y'] for h in headers] + [BOTTOM]
    for i in range(len(edges) - 1):
        top, bottom = edges[i], edges[i + 1]
        header = headers[i - 1] if i > 0 else None
        inside = [s for s in body if top <= s['y'] < bottom and not any(abs(s['y'] - h['y']) <= 4 for h in headers)]
        if inside:
            bands.append({'header': header, 'top': top, 'bottom': bottom, 'lines': lines_of(inside, W / 2)})
    return {'week': int(week.group(1)) if week else None, 'day': int(day.group(1)) if day else None,
            'width': W, 'height': H, 'bands': bands, 'tip': ' '.join(tips),
            'grids': [[b.x0 / W, b.y0 / H, b.x1 / W, b.y1 / H] for b in boxes]}


def new_step(num, title, minutes, line, pno, model):
    return {'num': num, 'title': title, 'minutes': minutes, 'actions': [], 'questions': [], 'notes': [],
            'pdfPage': pno, 'top': line['y'] / model['height'], 'bottom': line['y1'] / model['height']}


def split_preamble(period):
    """Objective rows (bold) sit above a row pairing a material name (left of the checkbox
    column) with a preparation note (right of it); the name may sit a few points higher."""
    pre = period.pop('pre')
    # Objectives and material names are bold; a preparation note is normal weight at the right.
    prep_rows = [l['y'] for l in pre if l['col'] == 'L' and any(x >= PREP_X and not bold and t.strip() for x, t, bold in l['parts'])]
    first = min(prep_rows) - 8 if prep_rows else None
    objective, materials, prep = [], [], []
    for l in pre:
        left = ''.join(t for x, t, _ in l['parts'] if x < PREP_X).strip()
        right = ''.join(t for x, t, _ in l['parts'] if x >= PREP_X).strip()
        if l['col'] == 'R':
            prep.append(l['text'])
        elif first is not None and l['y'] >= first:
            if left:
                materials.append(left)
            if right:
                prep.append(right)
        elif l['bold']:
            objective.append(l['text'])
        else:
            materials.append(l['text'])
    period['objective'] = re.sub(r'\s+', ' ', ' '.join(objective)).strip()
    period['materials'] = re.sub(r'\s+', ' ', ' '.join(materials)).strip()
    period['prep'] = re.sub(r'\s+', ' ', ' '.join(prep)).strip()


def parse_day(pages):
    """pages: list of (pdfPage, model) sharing one week/day, in order."""
    periods, current = [], None
    for pno, model in pages:
        for band in model['bands']:
            if band['header']:
                h = band['header']
                current = {'period': h['period'], 'label': h['label'], 'title': h['title'], 'minutes': h['minutes'], 'objective': [],
                           'pre': [], 'workbookPages': [], 'steps': [], 'pdfPage': pno}
                periods.append(current)
            if current is None:
                continue
            item = None
            for line in band['lines']:
                text = line['text']
                if line['step']:
                    m = line['step']
                    current['steps'].append(new_step(f'{m.group(1)}.{m.group(2)}', text, line['minutes'], line, pno, model))
                    item = None
                    continue
                if not current['steps']:
                    current['workbookPages'] += line['small']
                    current['pre'].append(line)
                    continue
                step = current['steps'][-1]
                if step['pdfPage'] == pno:
                    step['bottom'] = max(step['bottom'], line['y1'] / model['height'])
                if line['minutes'] and not text:
                    step['minutes'] = step['minutes'] or line['minutes']
                    continue
                if not text:
                    continue
                if text.startswith('•'):
                    item = {'list': 'questions', 'text': text.lstrip('• ').strip()}
                    step['questions'].append(item['text'])
                elif line['lead'] or item is None or (line['bold'] and re.search(r'[।?!:]\s*$', step[item['list']][-1])):
                    item = {'list': 'actions', 'text': text}
                    step['actions'].append(text)
                else:
                    lst = step[item['list']]
                    lst[-1] = (lst[-1] + ' ' + text).strip()
    for p in periods:
        split_preamble(p)
    return periods


def attach_grids(day, pages):
    """Give each grid to the step whose vertical extent on that page contains it."""
    for pno, m in pages:
        for g in m['grids']:
            mid = (g[1] + g[3]) / 2
            steps = [s for p in day['periods'] for s in p['steps'] if s['pdfPage'] == pno]
            best = min(steps, key=lambda s: 0 if s['top'] - .01 <= mid <= s['bottom'] + .03 else min(abs(mid - s['top']), abs(mid - s['bottom'])), default=None)
            if best is not None:
                best.setdefault('grids', []).append(g)


def parse_guide(path):
    doc = fitz.open(path)
    models = [(i + 1, page_model(doc.load_page(i))) for i in range(doc.page_count)]
    days, order = {}, []
    for pno, m in models:
        if m['week'] and m['day'] and any(b['header'] for b in m['bands']):
            key = (m['week'], m['day'])
            if key not in days:
                days[key] = []
                order.append(key)
            days[key].append((pno, m))
        elif order and m['week'] is None and m['bands'] and not any(b['header'] for b in m['bands']) and days[order[-1]][-1][0] == pno - 1:
            pass  # continuation pages without a badge are not used in this edition; kept for review
    result = []
    for key in order:
        pages = days[key]
        result.append({'week': key[0], 'day': key[1], 'pdfPages': [p for p, _ in pages],
                       'width': pages[0][1]['width'], 'height': pages[0][1]['height'], 'periods': parse_day(pages),
                       'tips': [m['tip'] for _, m in pages if m['tip']]})
        attach_grids(result[-1], pages)
    return result


if __name__ == '__main__':
    repo = pathlib.Path(sys.argv[1])
    out = {}
    for f in sorted((repo / 'curricula/up-hindi-2026/originals').glob('guide-g*.pdf')):
        out[f.stem] = parse_guide(f)
    json.dump(out, sys.stdout, ensure_ascii=False, indent=1)
