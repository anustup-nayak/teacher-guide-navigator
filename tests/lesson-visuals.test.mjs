import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {LESSONS} from '../dist/data.mjs';
import {CURRICULA} from '../dist/curricula.mjs';
import {phaseVisual,cropGeometry,validRect,lessonPalette,lessonVisualAssets} from '../dist/lesson-visuals.mjs';
const style=CURRICULA[0].visualStyle;
test('all source visual viewports have valid geometry and resolve to supplied assets',()=>{
 let art=0;
 for(const l of LESSONS)for(const p of l.phases){const visual=phaseVisual(l,p,style);if(!visual)continue;art++;assert.ok(validRect(visual.rect),l.id+'/'+p.id);const g=cropGeometry(visual.rect,visual.width,visual.height);assert.ok(g?.aspect>0,l.id);assert.ok(Object.values(g).every(Number.isFinite));assert.ok(fs.existsSync(new URL('../dist/'+visual.image,import.meta.url)),visual.image);assert.ok(lessonVisualAssets(l,style).includes(visual.image));}
 assert.ok(art>1000);
});
test('source crop maths maps every requested edge to its viewport without stretching the page',()=>{
 const rect=[.1,.2,.4,.6],g=cropGeometry(rect,600,800);
 assert.ok(Math.abs(g.aspect-.5625)<1e-9);
 assert.ok(Math.abs(g.left+g.width*.1)<1e-9);
 assert.ok(Math.abs(g.top+g.height*.2)<1e-9);
 assert.ok(Math.abs(g.left+g.width*.4-100)<1e-9);
 assert.ok(Math.abs(g.top+g.height*.6-100)<1e-9);
 assert.equal(cropGeometry([0,0,1,1],Infinity,800),null);
 for(const bad of [[0,0,0,1],[-1,0,1,1],[0,0,2,1],[0,NaN,1,1],null])assert.equal(cropGeometry(bad,600,800),null);
});
test('worksheet previews use the actual assigned workbook and have offline assets',()=>{
 const l=LESSONS.find(l=>l.worksheets.length),p=l.phases.find(p=>p.id==='practice');
 const v=phaseVisual(l,p,style);assert.equal(v.kind,'worksheet');assert.equal(v.image,l.worksheets[0].image);
 assert.ok(lessonVisualAssets(l,style).includes(v.image));assert.equal(new Set(lessonVisualAssets(l,style)).size,lessonVisualAssets(l,style).length);
});
test('Grade 3 shares its original demonstration artwork honestly and retains its source palette',()=>{
 const l=LESSONS.find(l=>l.grade===3&&l.structure==='source-grr');
 const demo=phaseVisual(l,l.phases.find(p=>p.id==='i-do'),style),guided=phaseVisual(l,l.phases.find(p=>p.id==='we-do'),style);
 assert.equal(guided.shared,true);assert.equal(guided.image,demo.image);assert.deepEqual(guided.rect,demo.rect);
 assert.equal(lessonPalette(l,style).teaching,'#ffcd00');assert.equal(lessonPalette({...l,structure:'weekly-template',day:4},style).teaching,'#cbbfa3');assert.equal(lessonPalette(LESSONS[0],style).practice,'#e28f98');
});
test('new curricula never inherit UP crops from grade number and can provide their own reviewed artwork',()=>{
 const l=LESSONS[0],p=l.phases[1];assert.equal(phaseVisual(l,p,{}),null);assert.equal(phaseVisual({...l,source:{...l.source,width:0}},p,style),null);
 const explicit={overrides:{[l.id]:{[p.id]:{rect:[.1,.2,.3,.4],alt:{en:'A source illustration'}}}}};
 assert.equal(phaseVisual(l,p,explicit).provenance,'source-compared');
 assert.deepEqual(lessonPalette(l,{palette:{blue:'red;bad',teaching:'#efb05f',unexpected:'#ffffff'}}),{teaching:'#efb05f'});
});
