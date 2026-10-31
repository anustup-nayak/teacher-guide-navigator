import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CURRICULA,validateCurricula} from '../dist/curricula.mjs';
import {validateCatalog} from '../dist/core.mjs';
import {groupKey,levelsInGroup,subjectsAtLevel,packForSelection,selectionForGroup} from '../dist/domain/selection.mjs';
import {phaseVisual,lessonPalette} from '../dist/lesson-visuals.mjs';
const [math,hindi]=CURRICULA,root=new URL('../dist/',import.meta.url),exists=p=>fs.existsSync(new URL(p,root));
const byId=id=>hindi.lessons.find(l=>l.id===id);

test('Hindi joins the UP 2026–27 group as its own delivery; Math stays first and default',()=>{
 assert.equal(math.id,'up-math-2026');assert.equal(hindi.id,'up-hindi-2026');assert.deepEqual(validateCurricula(CURRICULA),[]);
 assert.equal(groupKey(math),groupKey(hindi));assert.notEqual(hindi.storageKey,math.storageKey);assert.equal(math.storageKey,'up-sandarshika-2026-v1');
 const group=groupKey(math);assert.deepEqual(levelsInGroup(CURRICULA,group),[1,2,3]);
 for(const g of [1,2,3]){assert.deepEqual(subjectsAtLevel(CURRICULA,group,g).map(s=>s.id),['math','hindi']);assert.equal(packForSelection(CURRICULA,{group,grade:g,subject:'hindi'}),hindi);}
 assert.equal(selectionForGroup(CURRICULA,group,2,'hindi').pack,hindi,'grade change keeps Hindi');
 assert.equal(selectionForGroup(CURRICULA,group,3,'math').pack,math);
});

test('366 Hindi day plans cover the source schedule; review weeks stay original pages',()=>{
 assert.deepEqual(validateCatalog(hindi.lessons),[]);assert.equal(hindi.lessons.length,366);
 const count=g=>hindi.lessons.filter(l=>l.grade===g).length;assert.deepEqual([count(1),count(2),count(3)],[90,138,138]);
 for(const l of hindi.lessons){assert.equal(l.subject,'hindi');assert.match(l.id,/^g[123]-hindi-w\d\d-d0[1-6]$/);assert.ok(![13,20].includes(l.week),l.id);assert.ok(l.week>=(l.grade===1?9:1)&&l.week<=25,l.id);}
 assert.deepEqual(Object.keys(hindi.reviewPages),['1','2','3']);
});

test('every lesson keeps source periods, roles, minutes and actions with page provenance',()=>{
 for(const l of hindi.lessons){
  assert.ok([2,3].includes(l.periods),l.id);assert.equal(l.structure,'source-periods');assert.ok(exists(l.source.image),l.source.image);
  assert.ok(l.title&&!l.title.endsWith('।'),l.id);assert.ok(l.materials.length&&l.assessment.length,l.id);
  for(const p of l.phases){
   assert.ok(['teaching','practice','support'].includes(p.role),`${l.id} ${p.id}`);assert.match(p.period,/^\d( एवं \d)? · /);
   assert.ok(p.actions.length&&p.title,`${l.id} ${p.id}`);assert.ok(p.minutes==null||/^\d+(–\d+)?$/.test(p.minutes),`${l.id} ${p.id} ${p.minutes}`);
   assert.ok(exists(p.image),p.image);
   for(const text of [p.title,...p.actions])assert.doesNotMatch(text,/[ळ¤£]|[A-Za-z]{2,}\d|/,`${l.id} ${p.id}: ${text}`);
  }
 }
 const day6=hindi.lessons.filter(l=>l.day===6);assert.ok(day6.some(l=>l.phases.some(p=>p.period.startsWith('2 एवं 3'))),'combined weekly-assessment period');
});

test('workbook pages follow the guide’s printed citations and grid crops point at real pages',()=>{
 const sheets=hindi.lessons.flatMap(l=>l.worksheets.map(w=>({l,w})));
 assert.ok(sheets.length>=320);for(const {l,w} of sheets){assert.ok(exists(w.image),w.image);assert.equal(w.grade,l.grade);assert.ok(Number.isInteger(w.page));}
 assert.ok(hindi.lessons.filter(l=>l.grade===1).every(l=>l.worksheets.length),'every Grade 1 day cites a workbook page');
 const g1=byId('g1-hindi-w09-d02');assert.equal(g1.worksheets[0].page,6);
 const wbStep=g1.phases.find(p=>p.worksheetPreview);assert.ok(wbStep);assert.equal(phaseVisual(g1,wbStep,hindi.visualStyle).kind,'worksheet');
 const crops=Object.entries(hindi.visualStyle.overrides);assert.ok(crops.length>=100);
 for(const [id,phases] of crops)for(const [pid,o] of Object.entries(phases)){const l=byId(id);const p=l.phases.find(x=>x.id===pid);assert.ok(p&&exists(o.image));assert.equal(phaseVisual(l,p,hindi.visualStyle).kind,'source-excerpt');}
 assert.deepEqual(lessonPalette(g1,hindi.visualStyle),{blue:'#2d6f9b',teaching:'#faa74a',practice:'#f48a90',support:'#c7a0cb'});
});

test('decoded text matches page images on checked lessons, including the reviewed repair',()=>{
 const g1=byId('g1-hindi-w09-d02');
 assert.deepEqual(g1.phases.map(p=>[p.title,p.minutes]),[['चित्र चार्ट पर शिक्षक द्वारा चर्चा','5–7'],['चित्र चार्ट पर समृद्ध चर्चा','10–15'],['लेखन कार्य','10–15'],['गतिविधियों की संकल्पना पर कार्य','12–15'],['कार्यपुस्तिका पर कार्य','20–22'],['आदर्श वाचन और लोगोग्राफिक पठन','15–17'],['समूह-A के साथ रिमीडियल कार्य','20']]);
 assert.equal(g1.title,'‘क’ वर्ण की ध्वनि और प्रतीक को पहचानना और लिखने का अभ्यास करना');
 assert.ok(g1.phases[0].questions.includes('यह चित्र कहाँ का है?'));
 const g2=byId('g2-hindi-w01-d05');assert.ok(g2.phases.flatMap(p=>p.actions).some(a=>a.includes('कुछ शब्दों को बोर्ड पर लिखें')),'scrambled glyph order rebuilt');
 const g3=byId('g3-hindi-w19-d06');assert.equal(g3.contentStatus,'source-compared');
 assert.deepEqual(g3.phases.filter(p=>p.period.startsWith('1 ')).map(p=>p.title),['शिक्षक द्वारा अनुभव सुनाना','बच्चों द्वारा अनुभव साझा करना','लेखन कार्य']);
 assert.ok(!JSON.stringify(g3).includes('घर के सदस्य'),'older overprinted edit excluded');
 const grid=byId('g1-hindi-w17-d05').phases.find(p=>p.title.includes('समूह-A'));assert.ok(grid.actions[0].includes('बच्चों को वर्ण एवं अक्षर पहचानने'),'grid letters kept out of instructions');
});
