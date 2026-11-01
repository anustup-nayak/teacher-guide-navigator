"""Historical UP Math-only decoding entrypoint. Run from repository root."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "scripts/ingestion"))
from legacy_fonts import convert_span, legacy
if __name__=="__main__":
 import fitz,json,pathlib
 for g in [1,2,3]:
  source_root=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else 'inputs');d=fitz.open(source_root/f'g{g}.pdf');pages=[]
  for p in d:
   lines=[]
   for block in p.get_text('dict')['blocks']:
    for line in block.get('lines',[]):
     text=''.join(convert_span(s) for s in line['spans'])
     lines.append({'bbox':list(line['bbox']),'text':text})
   lines.sort(key=lambda l:(round(l['bbox'][1]/3),l['bbox'][0]))
   pages.append({'page':p.number+1,'width':p.rect.width,'height':p.rect.height,'lines':lines,'text':'\n'.join(l['text'] for l in lines)})
  (source_root/f'g{g}-decoded.json').write_text(json.dumps(pages,ensure_ascii=False))
  print('GRADE',g,'PAGES',len(pages))
  for i in [12,16,17,18,20]:print('PDF PAGE',i+1,'\n',pages[i]['text'][:1800])
