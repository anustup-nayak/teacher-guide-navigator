import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {loadPack,buildRelease,writeRelease,sha256} from '../scripts/content/compile.mjs';
import {exportCatalog,splitCatalog} from '../scripts/content/v1_codec.mjs';
import {validate} from '../scripts/content/schema.mjs';
import {seedPack} from '../scripts/content/import_v1.mjs';
import {createContentQuery} from '../content/query.mjs';
const packs=['up-math-2026','up-hindi-2026'];
const data=packs.map(p=>loadPack(p));
const clone=x=>structuredClone(x);
for(const input of data)test(`${input.pack}: all canonical lessons rebuild v1 bytes; deterministic grade views and graph`,()=>{
  const r=buildRelease(input,{version:'1.0.0'}),again=buildRelease(input,{version:'1.0.0'});
  assert.deepEqual([...r.files],[...again.files]);assert.equal(r.manifest.counts.lesson,366);
  assert.equal(r.files.get('views/v1/catalog.mjs'),input.parityCatalog);
  assert.equal(sha256(r.files.get('views/v1/catalog.mjs')),sha256(input.parityCatalog));
  assert.equal(input.lessons.reduce((n,l)=>n+l.periods.reduce((m,p)=>m+p.steps.length,0),0),r.manifest.counts.step);
  assert.deepEqual(validate('../content-release/manifest.schema.json',r.manifest),[]);
  for(const [file,info]of Object.entries(r.manifest.files)){assert.equal(sha256(r.files.get(file)),info.sha256);assert.equal(Buffer.byteLength(r.files.get(file)),info.bytes);}
  const keys=new Set(Object.entries(r.entities).flatMap(([k,arr])=>arr.map(e=>`${k}:${e.id}`)));
  for(const link of r.graph){assert(keys.has(link.from));assert(keys.has(link.to));assert(link.assertion);assert(link.review);}
  assert(r.graph.filter(e=>e.relation==='workbook').every(e=>e.from.startsWith('step:')));
  const q=createContentQuery(r);
  for(const lesson of input.lessons){assert.equal(q.day(lesson.grade,lesson.week,lesson.day).id,lesson.id);assert.equal(q.dayType(lesson.id).id,lesson.dayType);assert(q.cite(lesson.id).every(c=>c.doc&&c.pdf&&c.image));}
  assert.equal([1,2,3].reduce((n,g)=>n+JSON.parse(r.files.get(`views/app/grade-${g}.json`)).lessons.length,0),366);
  assert.equal(q.day(1,13,1),null);assert.equal(q.lesson('missing'),null);
});
test('canonical text owns the reconstruction; legacy bridge cannot mask a content edit',()=>{
  const input=clone(data[0]);input.lessons[0].periods[0].steps[0].actions[0]+=' TEST';
  assert.notEqual(exportCatalog(input.lessons,input.compat,input.assets),input.parityCatalog);
  assert.throws(()=>buildRelease(input,{version:'1.0.1'}),/byte parity/);
  for(const c of Object.values(data[0].compat.lessons)){assert(!('title'in c.fields));assert(!('phases'in c.fields));for(const p of Object.values(c.steps))for(const field of ['actions','instructions','title','minutes','questions'])assert(!(field in p.fields));}
  assert.throws(()=>splitCatalog('export const LESSONS = [broken'),/Unterminated/);
});
test('compiler rejects schema errors, dangling graph targets, duplicate identities, bad source pages and slots',()=>{
  for(const [mutate,message]of [
    [d=>d.lessons[0].title='',/schema|lesson/],
    [d=>d.lessons[0].periods[0].steps[0].routine={to:'routine:missing',assertion:'derived',review:'unreviewed',rule:'test-rule'},/Dangling/],
    [d=>d.lessons.push(clone(d.lessons[0])),/coverage/],
    [d=>d.lessons[0].source.pdf=9999,/Unresolved source/],
    [d=>d.lessons[0].periods[0].steps[0].source.rect=[0,0,2,1],/crop/],
    [d=>d.lessons[0].periods[0].number=[9],/period structure/],
    [d=>d.lessons[0].periods[0].steps[0].slots=['invented-slot'],/invalid slot/],
    [d=>d.program.pack='other-pack',/identity/]
  ]){const bad=clone(data[0]);mutate(bad);assert.throws(()=>buildRelease(bad,{version:'1.0.0'}),message);}
});
test('release writes are immutable/idempotent, check mode never creates, tampering and symlinks fail',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'teacher-compiler-'));
  try{
    const r=buildRelease(data[0],{version:'1.0.0'}),target=path.join(dir,'1.0.0');
    assert.throws(()=>writeRelease(r,target,{check:true}),/missing/);assert(!fs.existsSync(target));
    assert.equal(writeRelease(r,target),'created');const stamp=fs.statSync(path.join(target,'graph.json')).mtimeMs;
    assert.equal(writeRelease(r,target,{check:true}),'unchanged');assert.equal(fs.statSync(path.join(target,'graph.json')).mtimeMs,stamp);
    fs.writeFileSync(path.join(target,'graph.json'),'[]');assert.throws(()=>writeRelease(r,target),/Immutable/);
    const alias=path.join(dir,'link');fs.symlinkSync(target,alias,'dir');assert.throws(()=>writeRelease(r,alias),/symlink/);
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('changelog tracks entities by stable id; removal and previous-pack misuse fail',()=>{
  const first=buildRelease(data[0],{version:'1.0.0'});
  const next=buildRelease(data[0],{version:'1.0.1',previous:first.manifest});
  assert.deepEqual(next.changelog.added,[]);assert.deepEqual(next.changelog.changed,[]);
  const revised=clone(data[0]);revised.lessons[0].provenance.note='Source review evidence recorded';
  const changed=buildRelease(revised,{version:'1.0.1',previous:first.manifest});assert(changed.changelog.changed.includes(`lesson:${revised.lessons[0].id}`));
  const fake=clone(first.manifest);fake.entityHashes['routine:deleted']='0'.repeat(64);
  assert.throws(()=>buildRelease(data[0],{version:'1.0.1',previous:fake}),/removed/);
  assert.throws(()=>buildRelease(data[1],{version:'1.0.1',previous:first.manifest}),/pack\/version/);
  for(const version of ['../bad','1.0','1/2/3','01.0.0','1.0.0-.','1.0.0-rc.01'])assert.throws(()=>buildRelease(data[0],{version}),/version/);
});

test('legacy-only metadata changes appear against the lesson id and changed files',()=>{
  const first=buildRelease(data[0],{version:'1.0.0'}),updated=clone(data[0]);
  const id=updated.lessons[0].id;updated.compat.lessons[id].fields.shortTitle+=' (source correction)';
  updated.parityCatalog=exportCatalog(updated.lessons,updated.compat,updated.assets);
  const r=buildRelease(updated,{version:'1.0.1',previous:first.manifest});
  assert(r.changelog.changed.includes(`lesson:${id}`));assert(r.changelog.files.changed.includes('views/v1/catalog.mjs'));
});

test('one-time importer refuses an authored model without changing any input',()=>{
  const files=['program.json','assets.json','lessons/1.json','lessons/2.json','lessons/3.json'];
  const dir=new URL('../curricula/up-math-2026/model/',import.meta.url);
  const before=files.map(f=>fs.readFileSync(new URL(f,dir),'utf8'));
  assert.throws(()=>seedPack({id:'up-math-2026',resources:'resources.json'}),/refuses to overwrite/);
  assert.deepEqual(files.map(f=>fs.readFileSync(new URL(f,dir),'utf8')),before);
});
test('independent instruction variants are canonical and unsafe release paths cannot write',()=>{
  const d=clone(data[0]);const step=d.lessons.flatMap(l=>l.periods.flatMap(p=>p.steps)).find(s=>s.instructions?.length);
  assert(step);step.instructions[0]+=' TEST';assert.throws(()=>buildRelease(d,{version:'1.0.1'}),/byte parity/);
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'teacher-release-path-'));
  try{assert.throws(()=>writeRelease({files:new Map([['../escape','bad']])},path.join(dir,'release')),/Unsafe/);assert.deepEqual(fs.readdirSync(dir),[]);}finally{fs.rmSync(dir,{recursive:true,force:true});}
});

test('new releases advance semantic versions and prerelease identifiers in order',()=>{
  const first=buildRelease(data[0],{version:'1.0.0'});
  assert.throws(()=>buildRelease(data[0],{version:'0.9.0',previous:first.manifest}),/pack\/version/);
  const rc=buildRelease(data[0],{version:'1.0.1-rc.9',previous:first.manifest});
  assert.doesNotThrow(()=>buildRelease(data[0],{version:'1.0.1-rc.10',previous:rc.manifest}));
  assert.throws(()=>buildRelease(data[0],{version:'1.0.1-rc.8',previous:rc.manifest}),/pack\/version/);
  assert.doesNotThrow(()=>buildRelease(data[0],{version:'1.0.1',previous:rc.manifest}));
});
