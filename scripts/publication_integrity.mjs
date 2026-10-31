import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
export const digest=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
export const configurationHash=pack=>crypto.createHash('sha256').update(JSON.stringify(canonical(Object.fromEntries(Object.entries(pack).filter(([key])=>key!=='lessons'))))).digest('hex');
const fields=['id','state','subject','academicYear','storageKey'];
export function snapshotPack(pack,root){
 const directory=pack.id==='up-math-2026'?'':`packs/${pack.id}/`;
 const files=[`${directory}catalog.mjs`,`${directory}sources.json`,pack.resources,pack.worksheets];
 return {...Object.fromEntries(fields.map(f=>[f,pack[f]])),configurationHash:configurationHash(pack),grades:[...new Set(pack.lessons.map(l=>l.grade))].sort((a,b)=>a-b),files:Object.fromEntries(files.map(f=>[f,digest(path.join(root,'dist',f))]))};
}
export function verifyPreserved(baseline,packs,root){
 const errors=[];
 for(const previous of baseline.packs||[]){const pack=packs.find(p=>p.id===previous.id);if(!pack){errors.push(`Previously published pack removed: ${previous.id}`);continue;}if(configurationHash(pack)!==previous.configurationHash)errors.push(`Published configuration changed: ${previous.id}`);for(const field of fields)if(pack[field]!==previous[field])errors.push(`Published identity changed: ${previous.id}.${field}`);const grades=[...new Set(pack.lessons.map(l=>l.grade))].sort((a,b)=>a-b);if(JSON.stringify(grades)!==JSON.stringify(previous.grades))errors.push(`Published grade coverage changed: ${previous.id}; add a disjoint delivery pack`);for(const [file,hash] of Object.entries(previous.files)){const full=path.join(root,'dist',file);if(!fs.existsSync(full)||digest(full)!==hash)errors.push(`Previously published content changed: ${file}`);}}
 for(const [file,hash] of Object.entries(baseline.assets||{})){const full=path.join(root,'dist',file);if(!fs.existsSync(full)||digest(full)!==hash)errors.push(`Previously published page changed: ${file}`);}
 return errors;
}
