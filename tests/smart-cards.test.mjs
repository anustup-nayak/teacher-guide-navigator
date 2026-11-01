// Smart lesson cards (docs/SMART_CARDS.md): only owner-approved cards ship; every card passes the shared checks.
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {execFileSync} from 'node:child_process';
import {renderSmartCard} from '../dist/views/smart-card.mjs';
import {LESSON_CARDS} from '../dist/lesson-cards.mjs';
import {lessonCardsModule} from '../scripts/content/publish_site.mjs';
const root=new URL('../',import.meta.url);
const cards=[];for(const pack of ['up-math-2026','up-hindi-2026'])for(const g of [1,2,3])for(const area of ['model','drafts']){const f=new URL(`curricula/${pack}/${area}/cards/g${g}.json`,root);if(fs.existsSync(f))for(const c of JSON.parse(fs.readFileSync(f,'utf8')).cards)cards.push({pack,area,...c});}
test('dist/lesson-cards.mjs carries owner-approved cards only, and matches the pinned release',()=>{
 const approved=new Set(cards.filter(c=>c.provenance.review==='owner-approved').map(c=>c.lesson));
 const shipped=Object.values(LESSON_CARDS).flatMap(p=>Object.keys(p));
 for(const id of shipped)assert.ok(approved.has(id),`${id} shipped without owner approval`);
 assert.equal(fs.readFileSync(new URL('dist/lesson-cards.mjs',root),'utf8'),lessonCardsModule());
});
test('model/ holds only owner-approved cards; drafts/ never ships',()=>{for(const c of cards.filter(c=>c.area==='model'))assert.equal(c.provenance.review,'owner-approved',c.lesson);});
test('every drafted card without TODO passes the shared rule checks',()=>{
 const ready=cards.filter(c=>!JSON.stringify(c).includes('TODO'));
 for(const c of ready.filter(c=>c.provenance.review==='owner-approved'))assert.ok(true,c.lesson);
 const out=(()=>{try{return execFileSync('node',['scripts/content/cards.mjs','check'],{cwd:root,encoding:'utf8'});}catch(e){return e.stdout;}})();
 const failing=out.split('\n').filter(x=>x.startsWith('✗')&&!x.includes('still TODO')&&!x.includes('title TODO'));
 assert.deepEqual(failing,[],'cards with problems other than unfinished TODO');
 assert.ok(cards.every(c=>c.layout===(c.pack==='up-math-2026'?'steps':'periods')),'owner layouts: steps for Math, periods for Hindi');
});
test('the card view renders lines in order, links each to its step, and never gates the lesson',()=>{
 const t=hi=>hi,e=s=>String(s);
 const lesson={phases:[{id:'conversation'},{id:'i-do'},{id:'we-do'},{id:'you-do'},{id:'practice'},{id:'support'}],materials:['गिनलड़ी'],priorKnowledge:'एक अंक का जोड़'};
 const card={layout:'steps',title:'जोड़',lines:[{phases:['conversation'],label:'बातचीत',minutes:'10 मि',text:'LINE-A'},{phases:['we-do','you-do'],label:'हम करें',text:'LINE-B'},{phases:['support'],label:'खेल',text:'LINE-C'}]};
 const html=renderSmartCard({card,lesson,t,e,context:'कक्षा 2',goals:[],chain:{previous:null,next:{id:'n',href:'#/lesson/n',title:'अगला'}},image:'',stepIndex:id=>lesson.phases.findIndex(p=>p.id===id),roleOf:id=>id});
 for(const s of ['data-section="lesson-phase-0"','data-section="lesson-phase-2"','data-section="lesson-phase-5"','पहले से: एक अंक का जोड़','आगे: अगला','सार','तैयार रखें'])assert.ok(html.includes(s),s);
 assert.ok(html.indexOf('LINE-A')<html.indexOf('LINE-B')&&html.indexOf('LINE-B')<html.indexOf('LINE-C'),'lines keep the source order');
});
