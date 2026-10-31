import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=new URL('../',import.meta.url);
test('UP reviewed snapshot exactly matches every published parsed file',()=>{
 const config=JSON.parse(fs.readFileSync(new URL('curricula/up-math-2026/pack.json',root)));
 for(const file of config.reviewedFiles)assert.deepEqual(fs.readFileSync(new URL('curricula/up-math-2026/reviewed/'+file,root)),fs.readFileSync(new URL('dist/'+file,root)),file);
});
test('publisher keeps staging private, detects drift and rejects unreviewed content',()=>{
 const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'curriculum-publish-'));
 try{
  fs.mkdirSync(path.join(temporary,'scripts'));fs.copyFileSync(new URL('scripts/publish_curriculum.mjs',root),path.join(temporary,'scripts/publish_curriculum.mjs'));
  const pack=path.join(temporary,'curricula','test-pack');fs.mkdirSync(path.join(pack,'reviewed'),{recursive:true});fs.mkdirSync(path.join(pack,'originals'));fs.writeFileSync(path.join(pack,'originals','private.pdf'),'private');
  const config={id:'test-pack',publicationDirectory:'packs/test-pack',status:'awaiting-review',reviewedFiles:['catalog.mjs']};
  const save=()=>fs.writeFileSync(path.join(pack,'pack.json'),JSON.stringify(config));save();
  fs.writeFileSync(path.join(pack,'reviewed','catalog.mjs'),'export const LESSONS=[];');
  const run=(...args)=>spawnSync(process.execPath,[path.join(temporary,'scripts/publish_curriculum.mjs'),'test-pack',...args],{encoding:'utf8'});
  assert.notEqual(run().status,0);assert.ok(!fs.existsSync(path.join(temporary,'dist')));
  config.status='reviewed-snapshot';save();assert.equal(run().status,0);
  assert.deepEqual(fs.readdirSync(path.join(temporary,'dist','packs','test-pack')),['catalog.mjs']);
  assert.equal(run('--check').status,0);
  fs.writeFileSync(path.join(pack,'reviewed','catalog.mjs'),'changed');assert.notEqual(run('--check').status,0);
  config.reviewedFiles=['../originals/private.pdf'];save();assert.notEqual(run().status,0);
 }finally{fs.rmSync(temporary,{recursive:true,force:true});}
});
