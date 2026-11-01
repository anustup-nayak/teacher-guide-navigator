// आज home and teacher position (owner-approved 1 Nov 2026; docs/UX_REVIEW_2026-11.md).
import test from 'node:test';import assert from 'node:assert/strict';
import {teacherPosition,weekLessons,lessonChain,lessonGoals,shouldAskTaught,dismissTaught,confirmTaught,PROMPT_STOP_AFTER} from '../dist/domain/progress.mjs';
import {renderToday} from '../dist/views/today.mjs';
import {CURRICULA} from '../dist/curricula.mjs';
import {LESSON_GOALS} from '../dist/lesson-goals.mjs';
const math=CURRICULA.find(c=>c.id==='up-math-2026'),L=math.lessons;
test('next lesson is the one after the furthest lesson marked taught, in the guide order',()=>{
 assert.equal(teacherPosition(L,1,{}).next.id,'g1-math-w09-d01','nothing taught: first lesson');
 assert.equal(teacherPosition(L,1,{'g1-math-w09-d01':true}).next.id,'g1-math-w09-d02');
 assert.equal(teacherPosition(L,1,{'g1-math-w09-d01':true,'g1-math-w09-d03':true}).next.id,'g1-math-w09-d04','skipped days do not pull next backwards');
 assert.equal(teacherPosition(L,2,{}).next.id,'g2-math-w01-d01');
 const all=Object.fromEntries(L.filter(l=>l.grade===3).map(l=>[l.id,true]));const done=teacherPosition(L,3,all);assert.equal(done.next,null);assert.ok(done.finished);assert.equal(done.taught,done.total);
});
test('week strip, chain and goal position come from the sequence',()=>{
 assert.deepEqual(weekLessons(L,1,9).map(l=>l.day),[1,2,3,4,5,6]);
 const c=lessonChain(L,L.find(l=>l.id==='g1-math-w09-d02'));assert.equal(c.previous.id,'g1-math-w09-d01');assert.equal(c.next.id,'g1-math-w09-d03');
 assert.equal(lessonChain(L,L.find(l=>l.id==='g1-math-w09-d01')).previous,null);
 const [g]=lessonGoals(LESSON_GOALS['up-math-2026'],L,L.find(l=>l.id==='g1-math-w09-d01'),{'g1-math-w09-d01':true});
 assert.equal(g.id,'g1-m101');assert.equal(g.position,1);assert.equal(g.total,6);assert.equal(g.taught,1);
 const [w]=lessonGoals(LESSON_GOALS['up-math-2026'],L,L.find(l=>l.id==='g1-math-w09-d05'));assert.equal(w.position,null,'weekly days show the goal without a position');
});
test('the taught prompt asks once a day and stops after three dismissals',()=>{
 const lesson={id:'x'};assert.ok(shouldAskTaught({lesson,record:{},today:'d1'}));
 assert.ok(!shouldAskTaught({lesson,completed:{x:true},record:{},today:'d1'}),'already marked');
 let r=dismissTaught({},'x','d1');assert.ok(!shouldAskTaught({lesson,record:r,today:'d1'}),'not twice the same day');assert.ok(shouldAskTaught({lesson,record:r,today:'d2'}));
 for(let i=1;i<PROMPT_STOP_AFTER;i++)r=dismissTaught(r,'x','d'+(i+2));assert.ok(!shouldAskTaught({lesson,record:r,today:'d9'}),'stops after three');
 assert.ok(shouldAskTaught({lesson,record:confirmTaught(),today:'d9'}),'a yes resets');
});
test('आज renders the next lesson, the week, the readiness note and every way out, with no gate',()=>{
 const t=(hi)=>hi,e=s=>String(s);const position=teacherPosition(L,1,{});
 const html=renderToday({t,e,grade:1,gradeText:'कक्षा 1',subjectText:'गणित',position,week:{number:9,lessons:weekLessons(L,1,9),completed:{}},ask:null,goals:[{id:'g1-m101',title:'स्थान',position:1,total:6}],readiness:{from:1,to:8,label:'स्कूल रेडिनेस'},card:l=>`<a class="lesson-card" href="#/lesson/${l.id}">${l.id}</a>`,dayLabel:()=>null,lessonHref:l=>`#/lesson/${l.id}`,hasGoals:true});
 for(const s of ['#/lesson/g1-math-w09-d01','पाठ 1 / 6','सप्ताह 1–8: स्कूल रेडिनेस','#/guide/goal/g1-m101','#/saved','#/help','aria-current="step"'])assert.ok(html.includes(s),s);
 assert.equal((html.match(/class="today-day[ "]/g)||[]).length,6);
 // the whole year and all lessons are one tap away in the header tabs (audit X3, 1 Nov 2026), not repeated here
 assert.ok(!html.includes('href="#/find"'));
});
