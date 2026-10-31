# Discovery-only probe (31 Oct 2026): decodes legacy Kruti-compatible Hindi fonts with scripts/decode_legacy.py
# and prints/renders sample pages. Usage: python3 -I discovery_probe.py REPO OUTDIR guide-g1:20 workbook-g1:15
# Not a publication adapter: known font-specific errors remain (see docs/tasks/up-hindi-ingestion.md).
import sys, re, fitz, pathlib, collections
repo=pathlib.Path(sys.argv[1]); out=pathlib.Path(sys.argv[2])
src=(repo/'scripts/decode_legacy.py').read_text().split("def convert_span")[0]
ns={}; exec(src,ns); legacy=ns['legacy']
LEG=re.compile(r'Kruti|BHARTIYA|SuperHindi|Chanakya|AAText',re.I)
def dedupe(t):
    # Bold-by-overprint duplicates each run: "oh.kkoh.kk" -> "oh.kk"
    n=len(t)
    return t[:n//2] if n%2==0 and n>3 and t[:n//2]==t[n//2:] else t
def page_lines(doc,i):
    lines=[]
    for b in doc.load_page(i).get_text('dict')['blocks']:
        for l in b.get('lines',[]):
            parts=[]
            for s in l['spans']:
                t=dedupe(s['text'])
                parts.append(legacy(t) if LEG.search(s['font']) else t)
            line=''.join(parts).strip()
            if line: lines.append(line)
    return lines
orig=repo/'curricula/up-hindi-2026/originals'
for name,pno in [(a,int(b)) for a,b in (x.split(':') for x in sys.argv[3:])]:
    f=next(orig.glob(name+'*.pdf')); doc=fitz.open(f)
    doc.load_page(pno-1).get_pixmap(dpi=70).save(out/f'{name}-p{pno}.png')
    print(f'===== {name} page {pno}')
    for l in page_lines(doc,pno-1)[:28]: print('  ',l[:110])
