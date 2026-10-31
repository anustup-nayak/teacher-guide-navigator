import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CURRICULA,selectCurriculum,gradesFor,reviewWeeksFor,validateCurricula} from '../dist/curricula.mjs';
import {LESSONS} from '../dist/data.mjs';
import {createStore,validateCatalog,findLessons,neighbours,parseRoute} from '../dist/core.mjs';
const up=CURRICULA[0];
const other={...up,id:'other-science-2027',state:'OTHER',subject:'science',storageKey:'other-science-2027-v1',useUPStageLabels:false,reviewPages:{},lessons:LESSONS.slice(0,2).map((l,i)=>({...l,grade:8,subject:'science',week:13,day:i+1}))};
test('UP remains the default, preserving legacy routes and exact storage identity',()=>{
 assert.equal(selectCurriculum(CURRICULA,null),up);
 assert.equal(selectCurriculum(CURRICULA,'unknown'),up);
 assert.equal(up.lessons,LESSONS);
 assert.equal(up.storageKey,'up-sandarshika-2026-v1');
 assert.equal(parseRoute('#/lesson/g1-math-w09-d01/teach/2').id,LESSONS[0].id);
 assert.deepEqual(gradesFor(up),[1,2,3]);
 assert.deepEqual(validateCurricula(CURRICULA),[]);
});
test('another state, subject and grade can reuse local lesson IDs without sharing teacher data',()=>{
 const packs=[up,other];assert.deepEqual(validateCurricula(packs),[]);
 assert.equal(selectCurriculum(packs,other.id),other);
 assert.deepEqual(gradesFor(other),[8]);assert.deepEqual(validateCatalog(other.lessons),[]);
 assert.equal(findLessons(other.lessons,{grade:8,subject:'science',week:13}).length,2);
 assert.equal(neighbours(other.lessons,other.lessons[0].id).next,other.lessons[1]);
 const disk=new Map(),store=createStore({getItem:k=>disk.get(k),setItem:(k,v)=>disk.set(k,v)});
 store.set(up.storageKey+'-notes',{[LESSONS[0].id]:'UP note'});
 store.set(other.storageKey+'-notes',{[LESSONS[0].id]:'Science note'});
 assert.equal(store.get(up.storageKey+'-notes')[LESSONS[0].id],'UP note');
});
test('review weeks belong to their pack and grade, not global week numbers',()=>{
 assert.deepEqual(reviewWeeksFor(up,1),[13,20]);assert.deepEqual(reviewWeeksFor(other,8),[]);
 assert.deepEqual(reviewWeeksFor({...other,reviewPages:{8:{7:3}}},8),[7]);
 assert.deepEqual(reviewWeeksFor(up,8),[]);
});
test('registry rejects colliding storage identities, wrong subjects and ambiguous review mappings',()=>{
 assert.ok(validateCurricula([up,{...other,storageKey:up.storageKey}]).some(e=>e.includes('storage namespace')));
 assert.ok(validateCurricula([up,{...other,id:up.id}]).some(e=>e.includes('duplicate curriculum')));
 assert.ok(validateCurricula([{...other,subject:'math'}]).some(e=>e.includes('different subject')));
 assert.ok(validateCurricula([{...other,reviewPages:{8:{13:1}}}]).some(e=>e.includes('overlaps')));
});
test('all registered packs have valid content and shipped resource indices; registry is in offline shell',()=>{
 for(const pack of CURRICULA){assert.deepEqual(validateCatalog(pack.lessons),[]);for(const file of [pack.resources,pack.worksheets])assert.ok(fs.existsSync(new URL('../dist/'+file,import.meta.url)));}
 assert.match(fs.readFileSync(new URL('../dist/sw.js',import.meta.url),'utf8'),/['"]curricula\.mjs['"]/);
});
