import test from 'node:test';
import assert from 'node:assert/strict';
import {createContentQuery} from '../content/query.mjs';
import {loadPack,buildRelease} from '../scripts/content/compile.mjs';
const base=loadPack('up-math-2026');
function linkedFixture(review='owner-approved'){
  const d=structuredClone(base),l=d.lessons[0],source=l.source,prov={assertion:'stated',review:'source-compared',sources:[source]};
  // The fixture supplies its own single outcome; drop the pack's real outcome links (release 1.2.0+).
  for(const x of d.lessons)x.outcomes=[];
  d.routines={pack:d.pack,routines:[{id:'math-remedial',type:'remediation',name:'मेज से जोड़',grades:[1],provenance:prov}]};
  d.outcomes={pack:d.pack,outcomes:[{id:'M101.1',grade:1,code:'M101.1',family:'M101',statement:'जोड़ की समझ',provenance:prov}],objectives:[]};
  d.assessments={pack:d.pack,assessments:[{id:'weekly',type:'weekly',name:'जाँच',when:'सप्ताह 9',grades:[1],groups:[{id:'A',rule:'मूल पृष्ठ का नियम',plan:[{to:'routine:math-remedial',assertion:'stated',review,source}]}],provenance:prov}]};
  const step=l.periods[0].steps[0];
  step.routine={to:'routine:math-remedial',assertion:'derived',review,rule:'test-reviewed-match',source};
  l.outcomes=[{to:'lo:M101.1',assertion:'derived',review,rule:'test-reviewed-match',source}];
  l.assessment=[{to:'assessment:weekly',assertion:'stated',review:'source-compared',source}];
  const r=buildRelease(d,{version:'1.0.0'});return {r,id:l.id,step:step.id};
}
test('website queries use explicit reviewed links for outcome, routine, weekly assessment and remediation',()=>{
  const {r,id,step}=linkedFixture();const q=createContentQuery(r);
  assert.equal(q.lesson(id).id,id);assert.equal(q.stepsByRoutine('math-remedial')[0].id,`${id}/${step}`);
  assert.deepEqual(q.lessonsForOutcome('M101.1').map(l=>l.id),[id]);
  assert.equal(q.assessmentFor(1,9)[0].id,'weekly');assert.equal(q.remediationFor(1,9,'M101.1').steps.length,1);
  assert.equal(q.remediationFor(1,9,'no-such-outcome').groups.length,0);
  assert.deepEqual(q.assessmentFor(2,9),[]);assert.deepEqual(q.assessmentFor(1,10),[]);
});
test('proposed derived links stay hidden; source-compared is not owner/curriculum approval',()=>{
  for(const review of ['unreviewed','source-compared']){
    const {r,id}=linkedFixture(review),q=createContentQuery(r);
    assert.deepEqual(q.lessonsForOutcome('M101.1'),[]);assert.deepEqual(q.stepsByRoutine('math-remedial'),[]);
    assert.deepEqual(q.lesson(id).outcomes,[]);assert(q.links(`lesson:${id}`).every(l=>l.assertion==='stated'||['reviewed','owner-approved'].includes(l.review)));
    assert.equal(createContentQuery(r,{includeUnreviewedLinks:true}).lessonsForOutcome('M101.1').length,1);
  }
});
test('guide/editorial summaries require approval, source text remains citable, proposed crosswalks stay hidden',()=>{
  const {r,id}=linkedFixture();r.entities.section.push({id:'test-section',provenance:{assertion:'stated',review:'unreviewed'}});
  r.entities.passage.push({id:'test-section/1',section:'test-section',order:1,sourceText:['मूल पाठ'],summary:['Unapproved editorial'],classroomActions:['Unapproved action'],source:base.lessons[0].source,provenance:{assertion:'stated',review:'unreviewed'}});
  r.entities.lo.push({id:'proposed-code',code:'H101',statement:'Proposed mapping',provenance:{assertion:'stated',review:'unreviewed'}});
  r.graph.push({from:'lo:M101.1',to:'lo:proposed-code',relation:'equivalent',assertion:'derived',review:'unreviewed',rule:'test-proposed-crosswalk'});
  const q=createContentQuery(r);assert.deepEqual(q.passages('test-section')[0].sourceText,['मूल पाठ']);assert(!q.passages('test-section')[0].summary);assert(!q.passages('test-section')[0].classroomActions);
  assert.deepEqual(q.lessonsForOutcome('H101'),[]);assert(q.cite('passage:test-section/1')[0].image);
  r.entities.passage[0].provenance.review='owner-approved';assert(createContentQuery(r).passages('test-section')[0].summary);
  r.graph[r.graph.length-1].review='owner-approved';assert.equal(createContentQuery(r).lessonsForOutcome('H101')[0].id,id);
});
test('search normalizes Hindi and local digits, includes lesson actions, filters grade/kind and ignores metadata',()=>{
  const {r,id}=linkedFixture();r.entities.routine[0].name='जोड़ 12';
  const q=createContentQuery(r);assert.equal(q.search('जोड़ १२',{kind:'routine',grade:1})[0].entity.id,'math-remedial');
  assert.deepEqual(q.search('जोड़ 12',{grade:2}),[]);
  assert(q.search('मेज',{kind:'lesson',grade:1}).some(h=>h.entity.id===id));
  assert.deepEqual(q.search('test-reviewed-match'),[]);assert.deepEqual(q.search(''),[]);assert.equal(q.search('मेज',{limit:1}).length,1);
});
test('query instances are isolated, result mutation cannot change canonical release, missing entities are honest',()=>{
  const {r,id}=linkedFixture(),q=createContentQuery(r),before=r.entities.lesson[0].title;
  q.lesson(id).title='changed';assert.equal(q.lesson(id).title,before);assert.equal(r.entities.lesson[0].title,before);
  const hindi=buildRelease(loadPack('up-hindi-2026'),{version:'1.0.0'}),other=createContentQuery(hindi);
  assert.equal(other.lesson(id),null);assert.equal(q.routine('missing'),null);assert.equal(q.day(1,13,1),null);assert.deepEqual(q.cite('missing'),[]);
  r.entities.lesson.push(r.entities.lesson[0]);assert.throws(()=>createContentQuery(r),/Duplicate/);
});
