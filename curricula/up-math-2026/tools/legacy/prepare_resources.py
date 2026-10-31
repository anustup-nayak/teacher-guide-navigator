"""Index and render original resources. Only printed week/practice headers map worksheets."""
import fitz,sys,re,json,pathlib,concurrent.futures,hashlib
from PIL import Image
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[4] / "scripts/ingestion"))
from legacy_fonts import convert_span,legacy
root=pathlib.Path(sys.argv[1]);out=pathlib.Path(sys.argv[2] if len(sys.argv)>2 else 'dist')
resources={'guide':{},'workbook':{},'textbook':{}};jobs=[];worksheet=[]
for kind,prefix,folder in [('guide','g','source'),('workbook','wb','workbook'),('textbook','tb','textbook')]:
 for g in [1,2,3]:
  path=root/f'{prefix}{g}.pdf'
  if not path.exists():continue
  doc=fitz.open(path);entries=[]
  for p in doc:
   image=f'{folder}/g{g}-p{p.number+1:03d}.webp';entries.append(image);jobs.append((str(path),p.number,image,2.1 if kind=='guide' else 1.9))
   if kind!='workbook' or p.number<8:continue
   lines=[]
   for b in p.get_text('dict')['blocks']:
    for l in b.get('lines',[]):
     s=''.join(legacy(s['text']) if 'BHARTIYA' in s['font'] else convert_span(s) for s in l['spans']);lines.append({'text':s,'bbox':list(l['bbox'])})
   top=[l for l in lines if l['bbox'][1]<p.rect.height*.12];ws=[l for l in top if l['bbox'][0]<p.rect.width*.2 and re.fullmatch(r'\d{1,2}',l['text'].strip())];label=' '.join(l['text'] for l in top if l['bbox'][0]>p.rect.width*.22)
   if not ws:continue
   m=re.search(r'अभ्यास\s*(\d+)',label);k='practice' if m else 'assessment' if 'सीख' in label else 'revision' if 'पुनरावृत्ति' in label else 'other'
   worksheet.append({'grade':g,'week':int(ws[0]['text']),'day':int(m.group(1)) if m else None,'kind':k,'label':label.strip(),'pdfPage':p.number+1,'page':p.number-1,'image':image,'instructions':[l['text'].strip() for l in lines if p.rect.height*.11<l['bbox'][1]<p.rect.height*.9 and len(l['text'])>15 and ('-' in l['text'] or 'कीजिए' in l['text'] or 'लगाइए' in l['text'])][:6]})
  resources[kind][str(g)]={'pages':entries,'pageCount':len(entries),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
# Image-only header manually compared with the original workbook page.
worksheet.append({'grade':1,'week':12,'day':None,'kind':'assessment','label':'मैंने सीख लिया','pdfPage':31,'page':29,'image':'workbook/g1-p031.webp','instructions':['संख्या कार्ड को पीछे के क्रम में लगाइए।','बड़ी संख्या की वस्तुओं पर सही का निशान लगाइए।','तिया के पास आठ टॉफियाँ थीं। उसने एक भी नहीं खाई। अब कितनी बचीं?']})
(out/'resources.json').write_text(json.dumps(resources,ensure_ascii=False,separators=(',',':')))
(out/'worksheets.json').write_text(json.dumps(worksheet,ensure_ascii=False,separators=(',',':')))
def render(job):
 path,n,image,scale=job;dest=out/image
 if dest.exists():return 0
 dest.parent.mkdir(parents=True,exist_ok=True);d=fitz.open(path);pix=d[n].get_pixmap(matrix=fitz.Matrix(scale,scale),alpha=False);im=Image.frombytes('RGB',(pix.width,pix.height),pix.samples);im.save(dest,'WEBP',quality=83,method=4);return dest.stat().st_size
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 for i,size in enumerate(pool.map(render,jobs)):
  if i%100==0:print('resource pages',i,'/',len(jobs),flush=True)
print('Done',len(jobs),'pages;',len(worksheet),'indexed worksheet pages',flush=True)
