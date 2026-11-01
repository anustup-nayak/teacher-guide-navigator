import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {CURRICULA} from '../dist/curricula.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
const strings=v=>typeof v==='string'?[v]:Array.isArray(v)?v.flatMap(strings):v&&typeof v==='object'?Object.values(v).flatMap(strings):[];
test('every explicit r71 repair stays applied, source-linked, and backed by unchanged page evidence',()=>{
 for(const pack of CURRICULA){
  const {repairs}=read(`curricula/${pack.id}/tools/source-text-repairs-r71.json`);
  const lessons=[1,2,3].flatMap(g=>read(`curricula/${pack.id}/model/lessons/${g}.json`));
  for(const r of repairs){
   const l=lessons.find(l=>l.id===r.lesson),step=l.periods.flatMap(p=>p.steps).find(s=>s.id===r.step);
   assert.equal(step.source.doc,r.source.doc);assert.equal(step.source.pdf,r.source.pdf);
   const hash=crypto.createHash('sha256').update(fs.readFileSync(new URL('../dist/'+r.evidence,import.meta.url))).digest('hex');assert.equal(hash,r.sha256);
   if(r.fields)for(const [k,v] of Object.entries(r.fields))assert.deepEqual(step[k],v);
   else {assert.ok(strings(l).includes(r.new),r.lesson);assert.ok(!strings(l).includes(r.old),r.lesson);}
  }
 }
});
test('Math teaching instructions contain the source plus symbol, never a dollar placeholder',()=>{
 const math=CURRICULA.find(p=>p.id==='up-math-2026');
 for(const l of math.lessons)for(const p of l.phases)for(const s of [...p.actions,...p.questions,...(p.instructions||[])])assert.ok(!s.includes('$'),`${l.id}/${p.id}`);
 const l=math.lessons.find(l=>l.id==='g2-math-w14-d01');
 assert.ok(l.phases.find(p=>p.id==='i-do').actions.some(s=>s.includes('26 + 13 = 39')));
 assert.ok(l.phases.find(p=>p.id==='we-do').questions.includes('क्या जोड़ बड़ी संख्या से शुरू किया?'));
});
