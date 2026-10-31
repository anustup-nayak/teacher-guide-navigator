"""Print one parsed day for review: python3 show_day.py guides.json g1 9 2"""
import json, sys
g = json.load(open(sys.argv[1]))
doc = next(k for k in g if k.startswith('guide-' + sys.argv[2]))
d = next(d for d in g[doc] if d['week'] == int(sys.argv[3]) and d['day'] == int(sys.argv[4]))
print('week', d['week'], 'day', d['day'], 'pdfPages', d['pdfPages'])
for p in d['periods']:
    print(f"== कालांश {p['period']} · {p['title']} · {p['minutes']} मिनट\n   उद्देश्य: {p['objective']}\n   सामग्री: {p['materials']} | तैयारी: {p['prep']} | WB: {p['workbookPages']}")
    for s in p['steps']:
        print(f"  {s['num']} {s['title']} [{s['minutes']}]")
        for a in s['actions']: print('     -', a)
        for q in s['questions']: print('     ?', q)
