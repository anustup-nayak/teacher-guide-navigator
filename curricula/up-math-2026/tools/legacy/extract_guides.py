"""Build app records from the verified Chintamani Drive source set.
Requires original PDFs and decoded/OCR line JSON generated in source_root.
Page images retain diagrams and the original wording when text decoding is uncertain.
"""
import argparse,json,re,pathlib,hashlib,fitz,concurrent.futures
from PIL import Image
parser=argparse.ArgumentParser();parser.add_argument('source_root');parser.add_argument('--output',default='dist');args=parser.parse_args();root=pathlib.Path(args.source_root);out=pathlib.Path(args.output);(out/'source').mkdir(parents=True,exist_ok=True)
SOURCE_IDS={1:'15MR-E_EOYXiw-h0tt6g1_9vS2cFCGCkC',2:'1QyqrgIO_pS4frPXXDDKhFBSzHRPSMOlY',3:'1kw6DYbMNWFdvlYWEirOoPN2IBeq4NPF9'}
WB_IDS={1:'1mpngGwXEJcEHORFodQjdg18Wkz-B-4hJ',2:'1DwqkhIEuY-hww3hPwyZBq5PsTEDXJc-U',3:'1y2v4huI0CJupmymLCVU4SaKK8bxhMoC0'}
TB_IDS={1:'12I2U21F2He48PAfq9F_ySUTkp1GOitRZ',2:'1IY_Y99y4qMY8BwQ0bX4khniagF1nI2sn',3:'1ZnKoDfHF4VqhIND8ZkWWeipsIakRyeQ8'}
numtrans=str.maketrans('०१२३४५६७८९','0123456789')
def clean(s):
 s=s.replace('lIrkg','सप्ताह').replace('\u00ad','').replace('\ufeff','').replace('30$10','30+10').replace('20$20','20+20');return re.sub(r'\s+',' ',s).strip()
def byrect(page,box,columns=False):
 w,h=page['width'],page['height'];a,b,c,d=box;lines=[l for l in page['lines'] if a*w<=((l['bbox'][0]+l['bbox'][2])/2)<=c*w and b*h<=((l['bbox'][1]+l['bbox'][3])/2)<=d*h]
 if columns:lines.sort(key=lambda l:(0 if l['bbox'][0]<w*.34 else 1 if l['bbox'][0]<w*.66 else 2,l['bbox'][1]))
 else:lines.sort(key=lambda l:(round(l['bbox'][1]/3),l['bbox'][0]))
 return lines

def textrect(page,box,columns=False):return clean(' '.join(l['text'] for l in byrect(page,box,columns)))
def paragraphs(lines):
 chunks=[];buf=[]
 for line in lines:
  text=clean(line['text'])
  if not text or re.fullmatch(r'[n•●?०o©®@&<>\d ]{1,3}',text):
   continue
  starts=bool(re.match(r'^[n•●]\s+',text))
  if starts and buf:chunks.append(clean(' '.join(buf)));buf=[]
  text=re.sub(r'^[n•●]\s+','',text)
  if re.search(r'(मिनट|दक्षता शिक्षण|गणितीय बातचीत)$',text) and len(text)<32:continue
  buf.append(text)
  if text.endswith(('।','?','?।')):chunks.append(clean(' '.join(buf)));buf=[]
 if buf:chunks.append(clean(' '.join(buf)))
 return [c for c in chunks if len(c)>8]

def topic_for(title,code):
 # Navigation group is inferred from source wording; the original objective remains unchanged.
 t=title
 if any(x in t for x in ['दूर-पास','ऊपर-नीचे','दाएं-बाएं','आगे-पीछे','दाएँ-बाएँ']):return 'स्थानिक समझ'
 if any(x in t for x in ['वर्गीकरण','एक-एक की संगति','क्रम की समझ']):return 'संख्या पूर्व अवधारणाएँ'
 if any(x in t for x in ['पैटर्न']):return 'पैटर्न'
 if any(x in t for x in ['सिक्क','नोट','रुपय','मुद्रा']):return 'मुद्रा'
 if any(x in t for x in ['कैलेंडर','घड़ी','समय','महीन','सप्ताह के दिन']):return 'समय और कैलेंडर'
 if any(x in t for x in ['आधा','आधे','चौथ','चैथ','तीन-चौथ','पूरे','आधा-पूरा']):return 'भिन्न'
 if any(x in t for x in ['मापन','लम्बा','लंबा','वजन','भार','धारिता','ग्राम','किलोग्राम','मीटर','लीटर','इकाइयों']):return 'मापन'
 if any(x in t for x in ['आकार','आकृति','पृष्ठ के प्रकार','पृष्ठों','कोनों','भुजाओं','किनारों']):return 'आकार और ज्यामिति'
 if any(x in t for x in ['आँकड़','आंकड़','सूची बनाना','आलेख']):return 'आँकड़े'
 if any(x in t for x in ['भाग','गुणा','जोड़','घटाव','संक्रिया','बाँट','बार-बार']):return 'संक्रियाएँ'
 return 'संख्या ज्ञान और गिनती'

pages={g:json.loads((root/f'g{g}-decoded.json').read_text()) for g in [1,2,3]};indices={g:json.loads((root/f'g{g}-index.json').read_text()) for g in [1,2,3]}
lo_map={}
for g in [1,2,3]:
 p=pages[g][1];codes=[l for l in p['lines'] if re.fullmatch(r'M\s*-?\s*\d{3}(?:\.\d)?',l['text'].strip())]
 for l in codes:
  cy=(l['bbox'][1]+l['bbox'][3])/2;other=[x for x in p['lines'] if x['bbox'][0]>p['width']*.16 and x['bbox'][1]>p['height']*.16];mine=[x for x in other if min(codes,key=lambda c:abs((c['bbox'][1]+c['bbox'][3])/2-(x['bbox'][1]+x['bbox'][3])/2)) is l]
  code=re.sub(r'[\s-]','',l['text']);lo_map[code]=clean(' '.join(x['text'] for x in mine))

used=set();catalog=[];manifest=[]
for g in [1,2,3]:
 pdf=root/f'g{g}.pdf';manifest.append({'grade':g,'subject':'math','document':f'UP Numeracy Grade {g} TG AY 2026-2027.pdf','driveId':SOURCE_IDS[g],'url':f'https://drive.google.com/file/d/{SOURCE_IDS[g]}/view','pdfPages':len(pages[g]),'sha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),'wbUrl':f'https://drive.google.com/file/d/{WB_IDS[g]}/view','tbUrl':f'https://drive.google.com/file/d/{TB_IDS[g]}/view'})
 daily_by_week={}
 for idx in indices[g]:
  if not idx['day']:continue
  p=pages[g][idx['page']-1];w,h=p['width'],p['height'];title=textrect(p,(.20,.028,.85,.104))
  title=clean(re.sub(r'^.*?शिक्षण उद्देश्य\s*[:ः]\s*','',title)).strip(' ।')
  if g==1 and idx['page']==18 or g==2 and idx['page']==19:title='दूर-पास और ऊपर-नीचे की अवधारणा को समझना'
  if g==1 and idx['page']==19 or g==2 and idx['page']==20:title='दाएं-बाएं और आगे-पीछे की अवधारणा को समझना'
  title=re.sub(r'\b40\s*मिनट\b','',title).strip();title=title or 'शिक्षण उद्देश्य — मूल पृष्ठ देखें'
  header=textrect(p,(.69,.102,.99,.184));code_match=re.search(r'M\s*-?\s*(\d{3}(?:\.\d)?)',header)
  code='M'+code_match.group(1) if code_match else None
  manual={(1,28):('1 से 9 तक की संख्या (ठोस वस्तुओं और चित्रों के साथ) की विभिन्न व्यवस्थाओं (Number Conservation) में गिनती को समझना','M102.3'),(1,33):('शून्य की अवधारणा (मात्रात्मक और प्रतीकात्मक) को समझना','M102.2'),(1,81):('परिवेश की विभिन्न वस्तुओं के माध्यम से त्रि-आयामी (3D) आकृतियों को पहचानना','M104'),(2,62):('परिवेश की विभिन्न वस्तुओं और चित्रों में 2D आकृतियों (आयत, वर्ग, त्रिभुज, अंडाकार और वृत्त) को पहचानकर समझना','M205')}
  if (g,idx['page']) in manual:title,code=manual[(g,idx['page'])]
  if (g,idx['page']) in [(1,18),(2,19)]:code='M101.1'
  topic=topic_for(title,code);topx=.34 if g<3 else .34
  materials=textrect(p,(.09,.104,.34,.144))
  materials=clean(re.sub(r'^.*?संसाधन\s*[:ः]\s*','',materials))
  prior=textrect(p,(.39 if g<3 else .39,.102,.66,.147));prior=clean(re.sub(r'^.*?आवश्यक पूर्व ज्ञान\s*[:ः]\s*','',prior))
  mistake=textrect(p,(.39,.143,.66,.182));mistake=clean(re.sub(r'^.*?सामान्य भूल\s*[:ः]\s*','',mistake))
  vocab=textrect(p,(.09,.143,.34,.182));vocab=clean(re.sub(r'^.*?(?:नए|नये) शब्द\s*[:ः]\s*','',vocab))
  refs=clean(header.split('निपुण')[0].replace('पाठ्यपुस्तक:','').replace('पाठ्यपुस्तकः',''))
  image=f'source/g{g}-p{idx["page"]:03d}.webp';used.add((g,idx['page']))
  source={'status':'source-linked','label':'UP संदर्शिका 2026–27','document':manifest[-1]['document'],'page':idx['page']-2,'pdfPage':idx['page'],'width':p['width'],'height':p['height'],'image':image,'url':manifest[-1]['url'],'extraction':p.get('method','legacy-font'),'notice':'मूल संदर्शिका से लिया गया पाठ। विरासत फ़ॉन्ट / OCR के कारण कुछ अक्षरों में त्रुटि हो सकती है; मूल पृष्ठ भी उपलब्ध है।','topicBasis':'विषय समूह ऐप में शिक्षण उद्देश्य के आधार पर बनाए गए हैं; मूल उद्देश्य अपरिवर्तित है।'}
  phases=[]
  if g<3:
   patterns=[('conversation','बातचीत','गणितीय बातचीत',10),('i-do','I do','मैं करूँ',7),('we-do','We do','हम करें',13),('you-do','You do','आप करो',10)]
   y=[]
   for pid,name,needle,minutes in patterns:
    candidates=[l['bbox'][1]/h for l in p['lines'] if needle in l['text'] and l['bbox'][0]<w*.36 and l['bbox'][1]>h*.19]
    y.append(min(candidates) if candidates else {'conversation':.215,'i-do':.324,'we-do':.47,'you-do':.588}[pid])
   periods=[l['bbox'][1]/h for l in p['lines'] if 'कालांश' in l['text'] and l['bbox'][0]<w*.2 and l['bbox'][1]>h*.66];end=min(periods) if periods else .73
   for i,(pid,name,needle,minutes) in enumerate(patterns):
    b=y[i];d=y[i+1] if i<3 else end;box=(.05,b,.95,d)
    lines=byrect(p,(.34 if i else .06,b+.024,.94,d-.003),True)
    phases.append({'id':pid,'title':name,'subtitle':needle+' · कालांश 1','minutes':minutes,'actions':paragraphs(lines),'sourceRect':box,'image':image,'extraction':source['extraction']})
   phases.append({'id':'practice','title':'अभ्यास','subtitle':'कार्यपत्रक + प्रक्रियात्मक प्रवाह · कालांश 2','minutes':40,'actions':paragraphs(byrect(p,(.05,end,.95,end+.035),True)),'sourceRect':(.05,end,.95,end+.036),'image':image})
   phases.append({'id':'support','title':'खेल और रिमीडियल','subtitle':'गणित खेल और आवश्यकता के अनुसार सहायता · कालांश 3','minutes':40,'actions':paragraphs(byrect(p,(.05,end+.035,.95,.958),True)),'sourceRect':(.05,end+.035,.95,.96),'image':image})
  else:
   boxes=[('conversation','बातचीत','गणितीय बातचीत · कालांश 1',10,(.06,.209,.95,.349),(.06,.229,.95,.349)),('i-do','I do','मैं करूँ · कालांश 1',7,(.05,.348,.66,.618),(.35,.371,.65,.618)),('we-do','We do','हम करें · कालांश 1',13,(.67,.348,.95,.618),(.67,.371,.95,.618)),('you-do','You do','आप करो · कालांश 1',10,(.05,.618,.95,.754),(.34,.641,.95,.754)),('practice','अभ्यास','दक्षता अभ्यास कार्यपत्रक + प्रक्रियात्मक प्रवाह · कालांश 2',40,(.05,.752,.95,.788),(.05,.752,.95,.788)),('support','गणित खेल / अभ्यास','गणित खेल और आगे का अभ्यास · कालांश 3',40,(.05,.788,.95,.963),(.05,.808,.95,.963))]
   for pid,name,sub,m,box,textbox in boxes:phases.append({'id':pid,'title':name,'subtitle':sub,'minutes':m,'actions':paragraphs(byrect(p,textbox,True)),'sourceRect':box,'image':image})
  for phase in phases:
   if not phase['actions']:phase['actions']=['इस चरण की गतिविधि मूल संदर्शिका के चित्र में देखें।']
  record={'id':f'g{g}-math-w{idx["week"]:02d}-d{idx["day"]:02d}','grade':g,'subject':'math','topic':topic,'topicOrder':1,'subtopic':title,'subtopicOrder':idx['week']*10+idx['day'],'lessonOrder':idx['week']*10+idx['day'],'week':idx['week'],'day':idx['day'],'title':title,'loCode':code,'outcome':title,'loStatement':lo_map.get(code),'materials':[materials] if materials else [],'vocabulary':[vocab] if vocab else [],'priorKnowledge':prior or None,'commonMistake':mistake or None,'phases':phases,'assessment':['मूल संदर्शिका में दिए प्रश्नों और आकलन निर्देशों के अनुसार बच्चों की समझ जाँचें।'],'duration':120,'periods':3,'mainDuration':40,'structure':'source-grr','source':source,'references':[{'label':f'संदर्शिका पृष्ठ {idx["page"]-2} (PDF {idx["page"]})','href':image,'kind':'source'},{'label':'मूल संदर्शिका · Drive','href':source['url'],'kind':'guide'},{'label':'कार्यपुस्तिका · कक्षा '+str(g),'href':manifest[-1]['wbUrl'],'kind':'workbook'},{'label':'पाठ्यपुस्तक · कक्षा '+str(g),'href':manifest[-1]['tbUrl'],'kind':'textbook'}],'textbookReference':refs}
  catalog.append(record);daily_by_week.setdefault(idx['week'],[]).append(record)
 # Days 4–6 use the source's shared weekly page; they are not invented GRR lessons.
 for idx in indices[g]:
  if idx['day']:continue
  p=pages[g][idx['page']-1];image=f'source/g{g}-p{idx["page"]:03d}.webp';used.add((g,idx['page']));week=idx['week'];related=daily_by_week.get(week,[])
  for day,title in [(4,'खोजें और जानें'),(5,'समेकन और आकलन'),(6,'रिमीडियल शिक्षण और पुनरावृत्ति')]:
   if g<3:box={4:(.05,.10,.95,.31),5:(.05,.31,.95,.66),6:(.05,.66,.95,.96)}[day]
   else:box={4:(.05,.155,.95,.318),5:(.05,.318,.95,.605),6:(.05,.605,.95,.945)}[day]
   text=paragraphs(byrect(p,box,True));source={'status':'source-linked','label':'UP संदर्शिका 2026–27','document':manifest[-1]['document'],'page':idx['page']-2,'pdfPage':idx['page'],'width':p['width'],'height':p['height'],'image':image,'url':manifest[-1]['url'],'extraction':p.get('method','legacy-font'),'notice':'यह दिन स्रोत के साप्ताहिक समेकन / पुनरावृत्ति पृष्ठ से जुड़ा है। जहाँ संदर्शिका में स्थान खाली है, वहाँ शिक्षक को योजना बनानी है।','topicBasis':'साप्ताहिक समेकन का स्रोत खंड।'}
   catalog.append({'id':f'g{g}-math-w{week:02d}-d{day:02d}','grade':g,'subject':'math','topic':'साप्ताहिक समेकन और पुनरावृत्ति','topicOrder':99,'subtopic':f'सप्ताह {week} · {title}','subtopicOrder':week*10+day,'lessonOrder':week*10+day,'week':week,'day':day,'title':title,'loCode':None,'outcome':'इस सप्ताह के तीन शिक्षण उद्देश्यों को पक्का करना।','loStatement':None,'relatedObjectives':[l['outcome'] for l in related],'materials':['संदर्शिका के निर्देशानुसार सामग्री चुनें; खाली सूची शिक्षक भरेंगे।'],'vocabulary':[],'priorKnowledge':None,'phases':[{'id':'source-plan','title':title,'subtitle':f'दिवस {day} · साप्ताहिक योजना','minutes':40 if g==3 and day in [5,6] else None,'actions':text or ['इस दिन के लिए मूल संदर्शिका के निर्देश देखें और अपनी योजना नोट में लिखें।'],'sourceRect':box,'image':image,'extraction':source['extraction']}],'assessment':['साप्ताहिक आकलन और रिमीडियल निर्देश मूल पृष्ठ पर देखें।'],'duration':40 if g==3 and day in [5,6] else None,'structure':'weekly-template','source':source,'references':[{'label':f'संदर्शिका पृष्ठ {idx["page"]-2} (PDF {idx["page"]})','href':image,'kind':'source'},{'label':'मूल संदर्शिका · Drive','href':source['url'],'kind':'guide'},{'label':'कार्यपुस्तिका · कक्षा '+str(g),'href':manifest[-1]['wbUrl'],'kind':'workbook'}]})

catalog.sort(key=lambda l:(l['grade'],l['week'],l['day']))
(out/'catalog.mjs').write_text('export const LESSONS = '+json.dumps(catalog,ensure_ascii=False,separators=(',',':'))+';\nexport const SUBJECTS = {math: \'Mathematics\'};\n')
(out/'sources.json').write_text(json.dumps({'emailDate':'2026-10-23','academicYear':'2026-2027','sources':manifest,'loDefinitions':lo_map},ensure_ascii=False,indent=2))
print('Records:',len(catalog),'daily:',sum(l['structure']=='source-grr' for l in catalog),'weekly:',sum(l['structure']=='weekly-template' for l in catalog),'codes missing:',sum(l['loCode'] is None for l in catalog if l['structure']=='source-grr'),flush=True)
# Each worker owns a document instance. Lossless geometry is retained in JSON sourceRect.
def render_one(item):
 g,num=item;target=out/'source'/f'g{g}-p{num:03d}.webp'
 if not target.exists():
  d=fitz.open(root/f'g{g}.pdf');pix=d[num-1].get_pixmap(matrix=fitz.Matrix(2.1,2.1),alpha=False);im=Image.frombytes('RGB',[pix.width,pix.height],pix.samples);im.save(target,'WEBP',quality=82,method=4)
 return target.stat().st_size
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:sizes=list(pool.map(render_one,sorted(used)))
print('Source page images:',len(sizes),'MB:',round(sum(sizes)/1e6,2),flush=True)
summary={str(g):{'lessons':sum(l['grade']==g for l in catalog),'weeks':sorted(set(l['week'] for l in catalog if l['grade']==g)),'sourcePages':sum(a==g for a,b in used)} for g in [1,2,3]}
(root/'extraction-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2));print(json.dumps(summary),flush=True)
