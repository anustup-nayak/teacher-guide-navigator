// Explicit, source-compared repairs only. Never normalise arbitrary Hindi or symbols.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {loadPack} from './compile.mjs';
import {exportCatalog} from './v1_codec.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const write=process.argv.includes('--write');
if(process.argv.slice(2).some(x=>!['--write','--check'].includes(x)))throw Error('Use --write or --check');
const json=x=>JSON.stringify(x,null,1)+'\n';
const digest=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const contains=(v,text)=>typeof v==='string'?v===text:Array.isArray(v)?v.some(x=>contains(x,text)):v&&typeof v==='object'?Object.values(v).some(x=>contains(x,text)):false;
const replace=(value,old,text)=>typeof value==='string'?(value===old?text:value):Array.isArray(value)?value.map(v=>replace(v,old,text)):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,replace(v,old,text)])):value;
for(const id of ['up-math-2026','up-hindi-2026']){
 const dir=path.join(root,'curricula',id),data=loadPack(id,root);
 const {repairs}=JSON.parse(fs.readFileSync(path.join(dir,'tools/source-text-repairs-r71.json')));
 for(const r of repairs){
  if(digest(path.join(root,'dist',r.evidence))!==r.sha256)throw Error(`Source image changed: ${r.evidence}`);
  const index=data.lessons.findIndex(l=>l.id===r.lesson);if(index<0)throw Error(`Missing repair lesson ${r.lesson}`);
  const lesson=data.lessons[index],step=lesson.periods.flatMap(p=>p.steps).find(s=>s.id===r.step);
  if(!step||step.source.doc!==r.source.doc||step.source.pdf!==r.source.pdf)throw Error(`Repair source mismatch: ${r.lesson}/${r.step}`);
  if(r.fields){
   if(write){Object.assign(step,r.fields);if('instructions'in step)step.instructions=r.fields.actions;}
   else for(const [k,v] of Object.entries(r.fields))if(JSON.stringify(step[k])!==JSON.stringify(v))throw Error(`Unapplied step repair: ${r.lesson}/${r.step}`);
  }else{
   const model=lesson,legacy=data.compat.lessons[r.lesson];
   if(!contains(model,r.old)&&!contains(model,r.new))throw Error(`Repair no longer matches: ${r.lesson}/${r.step}`);
   if(write){data.lessons[index]=replace(lesson,r.old,r.new);data.compat.lessons[r.lesson]=replace(data.compat.lessons[r.lesson],r.old,r.new);}
   else if(contains(model,r.old)||contains(legacy,r.old))throw Error(`Unapplied text repair: ${r.lesson}/${r.step}`);
  }
 }
 if(write){
  for(const grade of data.program.grades)fs.writeFileSync(path.join(dir,`model/lessons/${grade}.json`),json(data.lessons.filter(l=>l.grade===grade)));
  fs.writeFileSync(path.join(dir,'compat/v1.json'),json(data.compat));
  const catalog=exportCatalog(data.lessons,data.compat,data.assets);
  fs.writeFileSync(path.join(dir,'reviewed/catalog.mjs'),catalog);
  fs.writeFileSync(path.join(root,'dist',id==='up-math-2026'?'catalog.mjs':`packs/${id}/catalog.mjs`),catalog);
 }
 console.log(`${id}: ${repairs.length} source-compared repair records ${write?'applied':'verified'}`);
}
