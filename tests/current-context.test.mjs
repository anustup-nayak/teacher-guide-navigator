import test from 'node:test';
import assert from 'node:assert/strict';
import {describeCurrentContext} from '../dist/views/current-context.mjs';
const pack={subjectLabel:{hi:'गणित',en:'Math'}},prefs={mode:'week',week:9};
test('persistent context identifies selected grade/subject and actual browse/screen location',()=>{assert.deepEqual(describeCurrentContext({pack,grade:2,lang:'hi',prefs,screen:'find'}),{identity:'कक्षा 2 · गणित',location:'पाठ चुनें · सप्ताह 9'});assert.equal(describeCurrentContext({pack,grade:2,lang:'en',prefs,screen:'saved'}).location,'My list');assert.equal(describeCurrentContext({pack,grade:2,lang:'en',prefs,screen:'help'}).location,'Help');assert.equal(describeCurrentContext({pack,grade:2,lang:'en',prefs:{...prefs,query:'count'},screen:'find'}).location,'Search results');});
test('lesson context uses the actual lesson grade/day and active source section, including Balvatika',()=>{const context=describeCurrentContext({pack,grade:3,lang:'en',prefs,screen:'lesson',lesson:{grade:0,week:1,day:2},section:'Independent practice'});assert.equal(context.identity,'Balvatika · Math');assert.equal(context.location,'Week 1 · Day 2 · Independent practice');});
