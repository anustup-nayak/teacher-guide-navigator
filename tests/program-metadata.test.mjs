import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DIMENSIONS,validateProgramMetadata} from '../scripts/content/program_metadata.mjs';
import {loadPack,buildRelease,sha256,SCHEMA_VERSION} from '../scripts/content/compile.mjs';
import {createContentQuery} from '../content/query.mjs';
const packs=['up-math-2026','up-hindi-2026'];
for(const pack of packs)test(`${pack}: full program understanding is metadata, evidence-backed and honestly unreviewed`,()=>{
 const data=loadPack(pack);assert.deepEqual(validateProgramMetadata(data),[]);
 assert.deepEqual(data.understanding.dimensions.map(d=>d.id),DIMENSIONS);
 assert.equal(data.understanding.provenance.review,'unreviewed');assert(data.understanding.questions.some(q=>q.status==='open'&&!q.blocking));
 const old=JSON.parse(fs.readFileSync(new URL(`../content/${pack}/1.0.0/manifest.json`,import.meta.url)));
 const release=buildRelease(data,{version:'1.1.0',previous:old});assert.equal(release.manifest.schemaVersion,SCHEMA_VERSION);assert.equal(release.manifest.programStructure.status,'documented');
 assert.equal(release.manifest.programStructure.dimensions.length,9);assert(release.changelog.changed.includes(`program:${pack}`));
 const q=createContentQuery(release),info=q.programStructure();assert.equal(info.references.file,'structure.json');assert(info.structure.calendar.length);assert.equal(info.understanding.status,'documented');
 assert(info.understanding.dimensions.every(d=>!d.summary)); // Draft/editorial text is not promoted by a metadata accessor.
 assert.deepEqual(q.lesson(data.lessons[0].id).title,data.lessons[0].title);
});
test('metadata readiness blocks missing structure, uninspected dimensions, empty evidence and unresolved blocking questions',()=>{
 const base=loadPack(packs[0]);
 for(const edit of [d=>delete d.program.structure,d=>d.program.grades.push(4),d=>d.understanding.status='not-started',d=>d.understanding.dimensions.pop(),d=>d.understanding.dimensions.push(d.understanding.dimensions[0]),d=>d.understanding.dimensions[0].status='not-inspected',d=>d.understanding.dimensions[0].sourceRefs=[],d=>d.understanding.dimensions[0].sourceRefs[0].pdf=9999,d=>d.understanding.questions[0].blocking=true,d=>d.profileText='']){
  const d=structuredClone(base);edit(d);assert(validateProgramMetadata(d).length);assert.throws(()=>buildRelease(d,{version:'1.1.0'}));
 }
});
test('retained 1.0 releases keep every original file/hash and remain valid metadata predecessors',()=>{
 for(const pack of packs){const root=new URL(`../content/${pack}/1.0.0/`,import.meta.url),manifest=JSON.parse(fs.readFileSync(new URL('manifest.json',root)));for(const [file,entry]of Object.entries(manifest.files)){const bytes=fs.readFileSync(new URL(file,root));assert.equal(sha256(bytes),entry.sha256);assert.equal(bytes.length,entry.bytes);}}
});
