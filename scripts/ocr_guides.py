import sys
import fitz,json,pathlib,concurrent.futures,subprocess,csv,io,os
root=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else 'inputs')
items=[]
for g in [1,2]:
 pages=json.loads((root/f'g{g}-decoded.json').read_text())
 for p in pages:
  if not p['text'].strip():items.append((g,p['page']))
def run(item):
 g,num=item;doc=fitz.open(root/f'g{g}.pdf');page=doc[num-1];scale=2.4;path=root/f'ocr-g{g}-p{num}.png';page.get_pixmap(matrix=fitz.Matrix(scale,scale)).save(path)
 env=dict(os.environ,OMP_THREAD_LIMIT='1')
 tsv=subprocess.run(['tesseract',str(path),'stdout','--tessdata-dir',str(root/'tessdata'),'-l','hin+eng','--psm','11','-c','tessedit_create_tsv=1'],env=env,capture_output=True,text=True,check=True).stdout
 groups={}
 for row in csv.DictReader(io.StringIO(tsv),delimiter='\t'):
  if row.get('text','').strip():groups.setdefault((row['block_num'],row['par_num'],row['line_num']),[]).append(row)
 lines=[]
 for words in groups.values():
  box=[min(int(w['left']) for w in words)/scale,min(int(w['top']) for w in words)/scale,max(int(w['left'])+int(w['width']) for w in words)/scale,max(int(w['top'])+int(w['height']) for w in words)/scale]
  lines.append({'bbox':box,'text':' '.join(w['text'] for w in words)})
 lines.sort(key=lambda l:(round(l['bbox'][1]/3),l['bbox'][0]));out={'grade':g,'page':num,'width':page.rect.width,'height':page.rect.height,'method':'ocr','lines':lines,'text':'\n'.join(l['text'] for l in lines)}
 (root/f'ocr-g{g}-p{num}.json').write_text(json.dumps(out,ensure_ascii=False));return [g,num,len(lines)]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 for result in pool.map(run,items):print(result,flush=True)
for g in [1,2]:
 pages=json.loads((root/f'g{g}-decoded.json').read_text())
 for p in pages:
  path=root/f'ocr-g{g}-p{p["page"]}.json'
  if path.exists():p.update(json.loads(path.read_text()))
 (root/f'g{g}-decoded.json').write_text(json.dumps(pages,ensure_ascii=False))
