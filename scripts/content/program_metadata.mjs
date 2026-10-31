// Program understanding is an explicit authoring gate, not an inferred extraction score.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {validate,loadSchema} from './schema.mjs';
export const DIMENSIONS=Object.freeze([...loadSchema('program-understanding').$defs.dimensionId.enum]);
export const STRUCTURE_REFS=Object.freeze({file:'structure.json',understanding:'program-understanding.json',profile:'PROGRAM_PROFILE.md',sections:'sections.json',pageMap:'pagemap.json'});
export const PACK_METADATA=Object.freeze({program:'model/program.json',structure:'model/structure.json',understanding:'model/program-understanding.json',profile:'model/PROGRAM_PROFILE.md'});
export function validateProgramMetadata(data){
  const u=data.understanding,errors=validate('program-understanding',u);
  if(errors.length)return errors;
  if(u.pack!==data.pack||u.profile!==STRUCTURE_REFS.profile)errors.push('Program understanding identity/profile mismatch');
  if(u.status!=='documented')errors.push('Program understanding is not documented');
  for(const [key,value]of Object.entries(STRUCTURE_REFS))if(data.program.structure?.[key]!==value)errors.push(`Program structure metadata needs ${key}: ${value}`);
  if(!data.profileText?.trim())errors.push('Program profile is empty');
  const pages=new Set((data.assets||[]).map(a=>`${a.source.doc}:${a.source.pdf}`));
  for(const ref of [...u.dimensions.flatMap(d=>d.sourceRefs),...u.questions.flatMap(q=>q.sourceRefs)])if(!data.program.documents.some(d=>d.id===ref.doc)||!pages.has(`${ref.doc}:${ref.pdf}`))errors.push('Program understanding cites an unavailable document/page');
  const documentGrades=new Map(data.program.documents.map(d=>[d.id,d.grade]));
  const understoodGrades=new Set(u.dimensions.flatMap(d=>d.sourceRefs.map(ref=>documentGrades.get(ref.doc))));
  for(const grade of data.program.grades)if(!understoodGrades.has(grade))errors.push(`Grade ${grade}: program understanding needs source evidence for this grade`);
  const ids=u.dimensions.map(d=>d.id);
  if(new Set(ids).size!==ids.length||DIMENSIONS.some(id=>!ids.includes(id)))errors.push('Every program-understanding dimension must appear exactly once');
  for(const d of u.dimensions){
    if(!d.summary.trim())errors.push(`${d.id}: understanding/rationale is empty`);
    if(d.status==='not-inspected'||d.status==='unresolved')errors.push(`${d.id}: program structure understanding is incomplete`);
    if(d.status!=='not-applicable'&&!d.sourceRefs.length)errors.push(`${d.id}: source evidence is required`);
  }
  const questionIds=new Set();for(const q of u.questions){
    if(questionIds.has(q.id))errors.push('Duplicate program question id');questionIds.add(q.id);
    if(q.blocking&&q.status==='open')errors.push(`${q.id}: blocking program question remains open`);
    if(q.status==='resolved'&&!q.resolution?.trim())errors.push(`${q.id}: record the actual resolution`);
  }
  return errors;
}
export function loadProgramMetadata(root,pack){
  const dir=path.join(root,'curricula',pack),config=JSON.parse(fs.readFileSync(path.join(dir,'pack.json'),'utf8'));
  for(const [key,value]of Object.entries(PACK_METADATA))if(config.metadata?.[key]!==value)throw Error(`Pack metadata must identify ${key}: ${value}`);
  const read=name=>JSON.parse(fs.readFileSync(path.join(dir,'model',name),'utf8'));
  const data={pack,program:read('program.json'),understanding:read('program-understanding.json'),assets:read('assets.json').assets,profileText:fs.readFileSync(path.join(dir,'model/PROGRAM_PROFILE.md'),'utf8')};
  const errors=validateProgramMetadata(data);if(errors.length)throw Error(`${pack}: ${errors.join('; ')}`);
  return data;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const root=fileURLToPath(new URL('../../',import.meta.url));
  const wanted=process.argv.slice(2),packs=wanted.length?wanted:fs.readdirSync(path.join(root,'curricula')).filter(p=>fs.existsSync(path.join(root,'curricula',p,'model/program.json')));
  for(const pack of packs){const data=loadProgramMetadata(root,pack);const errors=validateProgramMetadata(data);if(errors.length)throw Error(errors.join('; '));console.log(`${pack}: documented program structure; ${DIMENSIONS.length} evidence-backed dimensions; ${data.understanding.questions.filter(q=>q.status==='open').length} explicit non-blocking questions`);}
}
