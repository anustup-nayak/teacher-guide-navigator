import sys, re, pathlib, collections
sys.argv=[sys.argv[0],sys.argv[1],sys.argv[2]]
repo=pathlib.Path(sys.argv[1])
exec((pathlib.Path(__file__).with_name("discovery_probe.py")).read_text().split("orig=repo")[0])
import fitz
orig=repo/'curricula/up-hindi-2026/originals'
for f in sorted(orig.glob('*.pdf')):
    doc=fitz.open(f); days=collections.OrderedDict(); other=collections.Counter(); first=None
    for i in range(doc.page_count):
        txt='\n'.join(page_lines(doc,i))
        w=re.search(r'सप्ताह\s*[-:]?\s*(\d+)',txt); d=re.search(r'दिवस\s*[-:]?\s*(\d+)',txt)
        kal=len(set(re.findall(r'कालांश\s*-\s*(\d)',txt)))
        if w and d:
            days.setdefault((int(w.group(1)),int(d.group(1))),[]).append((i+1,kal))
        else:
            for k in ['पुनरावृत्ति','साप्ताहिक','आकलन','विषय सूची','अनुक्रम','मूल्यांकन','योजना']:
                if k in txt: other[k]+=1
    weeks=sorted({w for w,_ in days})
    perweek=collections.Counter(w for w,_ in days)
    kals=collections.Counter(k for v in days.values() for _,k in v)
    print(f"{f.stem}: {doc.page_count} pages; week/day pages={sum(len(v) for v in days.values())}; unique days={len(days)}; weeks {weeks[:1]}..{weeks[-1:]} (n={len(weeks)})")
    print("   days per week:", dict(sorted(perweek.items())))
    print("   periods found per day-page:", dict(kals), " other page keywords:", dict(other))
