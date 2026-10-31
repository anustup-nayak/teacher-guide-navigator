import test from 'node:test';
import assert from 'node:assert/strict';
import {LESSONS} from '../dist/data.mjs';
import {lessonSections,sectionAtOffset} from '../dist/lesson-navigation.mjs';
test('every lesson exposes its complete source loop with unique stable chip targets',()=>{
 for(const lesson of LESSONS){const sections=lessonSections(lesson);assert.equal(sections.length,lesson.phases.length+3);assert.equal(new Set(sections.map(s=>s.id)).size,sections.length);assert.deepEqual(sections.filter(s=>s.kind==='phase').map(s=>s.phase),lesson.phases);assert.equal(sections[0].kind,'preparation');assert.equal(sections.at(-1).kind,'references');for(const s of sections.filter(s=>s.kind==='phase'))assert.equal(s.id,`lesson-phase-${s.index}`);}
});
test('weekly templates keep one phase and future guides can have arbitrary phases',()=>{
 const template=LESSONS.find(l=>l.structure==='weekly-template');assert.equal(lessonSections(template).filter(s=>s.kind==='phase').length,1);
 assert.equal(lessonSections({phases:Array.from({length:9},(_,i)=>({id:`custom-${i}`}))}).length,12);
});
test('reading edge tracks the latest section and handles gaps and boundaries',()=>{
 const sections=[{id:'prepare',top:-200},{id:'phase-0',top:160},{id:'phase-1',top:900}];
 assert.equal(sectionAtOffset(sections,0),'prepare');assert.equal(sectionAtOffset(sections,160),'phase-0');assert.equal(sectionAtOffset(sections,500),'phase-0');assert.equal(sectionAtOffset(sections,1000),'phase-1');assert.equal(sectionAtOffset([],0),undefined);
});

import {canTrackLesson} from '../dist/lesson-navigation.mjs';
test('pending list, lesson or deep-section navigation cannot be overwritten by old scroll tracking',()=>{const rendered={screen:'lesson',id:'one',view:'teach',step:1};assert.equal(canTrackLesson(rendered,{...rendered}),true);assert.equal(canTrackLesson(rendered,{screen:'find'}),false);assert.equal(canTrackLesson(rendered,{...rendered,id:'two'}),false);assert.equal(canTrackLesson(rendered,{...rendered,step:4}),false);assert.equal(canTrackLesson(rendered,{...rendered,view:'prepare'}),false);});
