"""Build the UP Hindi reviewed snapshot and page images from parsed staging data.

  python3 -I parse_guides.py REPO > ../extracted/adapter/guides.json
  python3 -I parse_workbooks.py REPO > ../extracted/adapter/workbooks.json
  python3 -I build_pack.py REPO [--no-images]

Writes curricula/up-hindi-2026/reviewed/{catalog.mjs,resources.json,worksheets.json,sources.json}
and renders dist/packs/up-hindi-2026/{source,workbook}/gN-pNNN.webp. Topics come from each
guide's “वार्षिक शिक्षण उद्देश्य” page (printed p13); repairs.json holds source-compared
replacements for text the parser cannot recover (a repair replaces a period, or adds one the
parser dropped). Text is decoded from the PDFs, never rewritten.
"""
import hashlib
import io
import json
import pathlib
import re
import sys

import fitz
from PIL import Image

PACK = 'up-hindi-2026'
WIDTH = 1250            # px, matching the Math page images
QUALITY = 70

# Week blocks and wording from each guide's annual objectives page (PDF p15, printed p13).
TOPICS = {
    1: [((9, 12), 'स्कूल रेडिनेस पर कार्य'),
        ((14, 17), 'पाठ्यपुस्तक ‘सारंगी-1’ के पाठ 1-5'),
        ((18, 19), 'पाठ्यपुस्तक ‘सारंगी-1’ के पाठ 6-9'),
        ((21, 25), 'पाठ्यपुस्तक ‘सारंगी-1’ के पाठ 10-19')],
    2: [((1, 4), 'कक्षा-1 की दक्षताओं की पुनरावृत्ति'),
        ((5, 7), 'कक्षा-1 की दक्षताओं की पुनरावृत्ति एवं ‘सारंगी-2’ के पाठ 1-5'),
        ((8, 12), 'पाठ्यपुस्तक ‘सारंगी-2’ के पाठ 6-12'),
        ((14, 17), 'पाठ्यपुस्तक ‘सारंगी-2’ के पाठ 13-17'),
        ((18, 19), 'पाठ्यपुस्तक ‘सारंगी-2’ के पाठ 18-19'),
        ((21, 25), 'पाठ्यपुस्तक ‘सारंगी-2’ के पाठ 20-26')],
    3: [((1, 4), 'कक्षा-2 की दक्षताओं की पुनरावृत्ति'),
        ((5, 7), 'पाठ्यपुस्तक ‘वीणा-1’ के पाठ 1-3'),
        ((8, 12), 'पाठ्यपुस्तक ‘वीणा-1’ के पाठ 4-8'),
        ((14, 17), 'पाठ्यपुस्तक ‘वीणा-1’ के पाठ 9-12'),
        ((18, 19), 'पाठ्यपुस्तक ‘वीणा-1’ के पाठ 13-14'),
        ((21, 25), 'पाठ्यपुस्तक ‘वीणा-1’ के पाठ 15-18')],
}
ROLES = {1: 'teaching', 2: 'practice', 3: 'support'}
SOURCE_LABEL = 'UP भाषा संदर्शिका 2026–27'
EXTRACTION_NOTICE = ('पुराने हिंदी फ़ॉन्ट से पढ़ा गया पाठ, मूल पृष्ठ से मिलाया गया नमूना। '
                     'स्वतंत्र अकादमिक सत्यापन अभी शेष है।')


def clean(text):
    text = re.sub(r'\s+', ' ', text or '').strip()
    return re.sub(r'\s+([।?,!])', r'\1', text)


def dash(minutes):
    return minutes.replace('-', '–') if minutes else None


def topic_for(grade, week):
    for order, ((a, b), label) in enumerate(TOPICS[grade], 1):
        if a <= week <= b:
            return order, f'सप्ताह {a}–{b} · {label}'
    raise ValueError(f'No topic block for grade {grade} week {week}')


def render(doc, out_dir, prefix, done):
    out_dir.mkdir(parents=True, exist_ok=True)
    paths = []
    for i in range(doc.page_count):
        name = f'{prefix}-p{i + 1:03}.webp'
        target = out_dir / name
        paths.append(name)
        if target.exists() or done is None:
            continue
        page = doc.load_page(i)
        pix = page.get_pixmap(matrix=fitz.Matrix(WIDTH / page.rect.width, WIDTH / page.rect.width), alpha=False)
        Image.open(io.BytesIO(pix.tobytes('png'))).save(target, 'WEBP', quality=QUALITY, method=6)
        done.append(name)
    return paths


def printed_number(page):
    """Footer page number (bottom right on odd/even pages alike in these books)."""
    W, H = page.rect.width, page.rect.height
    nums = [s for b in page.get_text('dict')['blocks'] for l in b.get('lines', []) for s in l['spans']
            if s['bbox'][1] > H * 0.92 and s['text'].strip().isdigit()]
    return int(nums[-1]['text'].strip()) if nums else None


def main(repo, images=True):
    base = repo / 'curricula' / PACK
    guides = json.loads((base / 'extracted/adapter/guides.json').read_text())
    workbooks = json.loads((base / 'extracted/adapter/workbooks.json').read_text())
    repairs = json.loads((base / 'tools/repairs.json').read_text())
    manifest = json.loads((base / 'originals/manifest.json').read_text())
    docs = {d['id']: d for d in manifest['documents']}
    dist = repo / 'dist' / 'packs' / PACK
    rendered = [] if images else None
    resources, worksheets, lessons, overrides, sources = {'guide': {}, 'workbook': {}}, [], [], {}, []

    for kind, folder in (('guide', 'source'), ('workbook', 'workbook')):
        for doc_id, info in sorted(docs.items()):
            if info['kind'] != kind:
                continue
            g = info['grade']
            pdf = fitz.open(base / 'originals' / info['file'])
            names = render(pdf, dist / folder, f'g{g}', rendered)
            pages = [f'packs/{PACK}/{folder}/{n}' for n in names]
            printed = {}
            for i, path in enumerate(pages):
                n = printed_number(pdf.load_page(i))
                if n:
                    printed[path] = n
            resources[kind][str(g)] = {'pages': pages, 'pageCount': pdf.page_count, 'sha256': info['sha256'],
                                       'printedPages': printed}

    for doc_id, days in guides.items():
        g = docs[doc_id]['grade']
        wb_id = next(i for i, d in docs.items() if d['kind'] == 'workbook' and d['grade'] == g)
        wb_pages = {p['printedPage']: p for p in workbooks[wb_id] if p['printedPage']}
        guide_res = resources['guide'][str(g)]
        for d in days:
            key = f"g{g}-w{d['week']}-d{d['day']}"
            periods = d['periods']
            for fix in repairs.get(key, {}).get('periods', []):
                if any(p['period'] == fix['period'] for p in periods):
                    periods = [fix['replace'] if p['period'] == fix['period'] else p for p in periods]
                else:   # the parser dropped the whole period
                    periods = sorted(periods + [fix['replace']], key=lambda p: p['period'])
            lid = f"g{g}-hindi-w{d['week']:02}-d{d['day']:02}"
            pdf_page = d['pdfPages'][0]
            image = guide_res['pages'][pdf_page - 1]
            printed = guide_res['printedPages'].get(image)
            phases, materials, objectives, wb_refs, tb_refs = [], [], [], [], []
            for p in periods:
                label = p.get('label') or str(p['period'])
                objectives.append(f"कालांश {label}: {clean(p['objective'])}" if p['objective'] else '')
                mat = clean(p['materials'])
                if mat:
                    materials.append(mat + (f" — {clean(p['prep'])}" if p['prep'] else ''))
                wb_refs += [int(n) for n in p.get('workbookPages', [])]
                tb_refs += [int(n) for n in p.get('textbookPages', [])]
                for k, s in enumerate(p['steps'], 1):
                    pid = f"p{p['period']}-{k}"
                    actions = [clean(a) for a in s['actions'] if clean(a)]
                    questions = [clean(q) for q in s['questions'] if clean(q)]
                    phase = {'id': pid, 'title': clean(s['title']) or clean(p['title']),
                             'period': f"{label} · {clean(p['title'])}", 'role': ROLES.get(p['period'], 'teaching'),
                             # actions = instructions (the app shows instructions, then questions);
                             # a question-only step keeps its questions as actions.
                             'minutes': dash(s['minutes']), 'actions': actions or questions,
                             'instructions': actions, 'questions': questions,
                             'image': guide_res['pages'][s['pdfPage'] - 1],
                             'sourceRect': [0.05, round(max(0, s['top'] - 0.01), 4), 0.95, round(min(1, s['bottom'] + 0.01), 4)],
                             'extraction': 'source-compared' if key in repairs else 'legacy-font-decoded'}
                    if p['period'] == 2 and 'कार्यपुस्तिका' in phase['title']:
                        phase['worksheetPreview'] = True
                    if not phase['actions']:
                        phase['actions'] = [f"इस चरण के निर्देश मूल पृष्ठ पर देखें (संदर्शिका पृष्ठ {printed or pdf_page})।"]
                        phase['instructions'] = phase['actions']
                    phases.append(phase)
                    for rect in s.get('grids', []):
                        x0, y0, x1, y1 = rect
                        overrides.setdefault(lid, {})[pid] = {
                            'rect': [round(max(0, x0 - .015), 4), round(max(0, y0 - .012), 4),
                                     round(min(1, x1 + .015), 4), round(min(1, y1 + .012), 4)],
                            'image': phase['image'], 'kind': 'source-excerpt',
                            'alt': {'hi': 'संदर्शिका में दिया गया वर्ण/शब्द ग्रिड', 'en': 'Letter/word grid from the guide'}}
            sheets = []
            for n in dict.fromkeys(wb_refs):
                wp = wb_pages.get(n)
                if not wp:
                    continue
                sheet = {'grade': g, 'week': d['week'], 'day': d['day'],
                         'kind': 'assessment' if d['day'] == 6 else 'practice',
                         'label': clean(wp['heading']) or f'कार्यपुस्तिका पृष्ठ {n}',
                         'pdfPage': wp['pdfPage'], 'page': n,
                         'image': resources['workbook'][str(g)]['pages'][wp['pdfPage'] - 1],
                         'instructions': [clean(x) for x in wp['instructions']]}
                sheets.append(sheet)
                worksheets.append(sheet)
            p2 = next((p for p in periods if p['period'] == 2), None)
            title = clean((p2 or periods[0])['objective'] or periods[0]['objective']).rstrip('।').strip()
            order, topic = topic_for(g, d['week'])
            lesson = {
                'id': lid, 'grade': g, 'subject': 'hindi', 'topic': topic, 'topicOrder': order,
                'subtopic': title, 'subtopicOrder': d['week'] * 10 + d['day'], 'lessonOrder': d['week'] * 10 + d['day'],
                'week': d['week'], 'day': d['day'], 'title': title, 'shortTitle': title,
                'summary': ' · '.join(o for o in objectives if o and not o.startswith('कालांश 2')),
                'loCode': None, 'outcome': ' · '.join(o for o in objectives if o), 'loStatement': None,
                'materials': materials or ['मूल पृष्ठ पर दी गई सामग्री देखें।'],
                'vocabulary': [], 'priorKnowledge': None, 'commonMistake': None,
                'phases': phases,
                'assessment': (['सभी बच्चों के साथ साप्ताहिक आकलन ‘मैंने सीख लिया’ — संदर्शिका के आकलन चरण देखें।'] if d['day'] == 6 else
                               ['कक्षा में समझ की जाँच की रणनीतियाँ संदर्शिका के “समझ की जाँच” पृष्ठों (पृष्ठ 6–7) पर हैं।',
                                'सप्ताह के दिवस 6 को साप्ताहिक आकलन ‘मैंने सीख लिया’ होता है।']),
                'duration': sum(int(p['minutes']) for p in periods if (p['minutes'] or '').isdigit()) or None,
                'periods': len(periods),
                'structure': 'source-periods',
                'source': {'status': 'source-linked', 'label': SOURCE_LABEL, 'document': docs[doc_id]['originalFilename'],
                           'page': printed, 'pdfPage': pdf_page, 'width': d['width'], 'height': d['height'],
                           'image': image, 'extraction': 'legacy-font-decoded', 'notice': EXTRACTION_NOTICE,
                           'topicBasis': 'संदर्शिका का “वार्षिक शिक्षण उद्देश्य” पृष्ठ (पृष्ठ 13)।'},
                'references': [{'label': f'संदर्शिका पृष्ठ {printed or "?"} (PDF {p})', 'href': guide_res['pages'][p - 1], 'kind': 'source'}
                               for p in d['pdfPages']],
                'textbookReference': (f"पाठ्यपुस्तक पृष्ठ {', '.join(str(n) for n in dict.fromkeys(tb_refs))} (मुद्रित पुस्तक देखें)"
                                      if tb_refs else 'इस पाठ में पाठ्यपुस्तक का पृष्ठ संदर्शिका में नहीं दिया गया है।'),
                'contentStatus': 'source-compared' if key in repairs else 'decoded-unreviewed',
                'worksheets': sheets,
            }
            if lesson['duration'] is None:
                lesson.pop('duration')
            lessons.append(lesson)

    for g in (1, 2, 3):
        gd = next(d for d in docs.values() if d['kind'] == 'guide' and d['grade'] == g)
        wd = next(d for d in docs.values() if d['kind'] == 'workbook' and d['grade'] == g)
        sources.append({'grade': g, 'subject': 'hindi', 'document': gd['originalFilename'], 'sha256': gd['sha256'],
                        'pdfPages': resources['guide'][str(g)]['pageCount'],
                        'workbook': wd['originalFilename'], 'workbookSha256': wd['sha256'],
                        'workbookPdfPages': resources['workbook'][str(g)]['pageCount']})
    reviewed = base / 'reviewed'
    reviewed.mkdir(exist_ok=True)
    dump = lambda o: json.dumps(o, ensure_ascii=False, separators=(',', ':'))
    (reviewed / 'catalog.mjs').write_text(
        '// UP Hindi 2026–27 lessons decoded from the Teacher Guides; built by tools/build_pack.py.\n'
        f'export const LESSONS = {dump(lessons)};\n'
        f'export const VISUAL_OVERRIDES = {dump(overrides)};\n')
    (reviewed / 'resources.json').write_text(json.dumps(resources, ensure_ascii=False, indent=1) + '\n')
    (reviewed / 'worksheets.json').write_text(dump(worksheets) + '\n')
    (reviewed / 'sources.json').write_text(json.dumps(
        {'receivedDate': '2026-10-31', 'from': 'Renu Chauhan (Drive folder “Literacy TGs and WBs”, UP AY 2026-2027)',
         'academicYear': '2026-2027', 'sources': sources}, ensure_ascii=False, indent=1) + '\n')
    print(f'{len(lessons)} lessons, {sum(len(l["phases"]) for l in lessons)} steps, {len(worksheets)} worksheets, '
          f'{sum(len(v) for v in overrides.values())} grid crops, {len(rendered or [])} images rendered')


if __name__ == '__main__':
    main(pathlib.Path(sys.argv[1]), images='--no-images' not in sys.argv)
