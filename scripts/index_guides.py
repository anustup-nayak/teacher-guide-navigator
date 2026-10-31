import sys
import json,re,pathlib
root=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else 'inputs')
tr=str.maketrans('०१२३४५६७८९','0123456789')
overrides={(1,18):(9,1),(1,19):(9,2),(1,21):(9,0),(1,28):(11,3),(1,33):(12,3),(1,34):(12,0),(1,81):(25,1),(1,84):(25,0),(2,19):(1,1),(2,20):(1,2),(2,22):(1,0),(2,62):(11,3)}
for g in [1,2,3]:
 pages=json.loads((root/f'g{g}-decoded.json').read_text());found=[];un=[]
 for p in pages:
  if p['page']<18 or p['page']>({1:84,2:115,3:114}[g]):continue
  small=[l['text'] for l in p['lines'] if l['bbox'][0]<p['width']*.19 and l['bbox'][1]<p['height']*.11]
  st=' '.join(small).translate(tr); top=' '.join(l['text'] for l in p['lines'] if l['bbox'][1]<p['height']*.12).translate(tr)
  w=re.search(r'(?:सप्ताह|lIrkg)\s*(\d{1,2})',st);d=re.search(r'दिवस\s*(\d{1,2})',st)
  if (g,p['page']) in overrides:week,day=overrides[(g,p['page'])]
  elif w:
   week=int(w.group(1));day=int(d.group(1)) if d else 0
  else:un.append([p['page'],top[:100]]);continue
  if day not in [0,1,2,3]:day=0
  if day==0 and not ('पाठयोजना' in top or 'पाठयोजना' in p['text'] or 'समेकन' in p['text'] or 'तीनों शिक्षण' in top):continue
  found.append({'grade':g,'page':p['page'],'week':week,'day':day,'header':top[:150]})
 (root/f'g{g}-index.json').write_text(json.dumps(found,ensure_ascii=False,indent=2));print('G',g,'plans',len(found),'week range',sorted(set(x['week'] for x in found)),'daily',sum(x['day']>0 for x in found),'summary',sum(x['day']==0 for x in found),'unmapped',un)
