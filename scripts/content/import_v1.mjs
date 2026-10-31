// Explicit, one-time migration. Never run implicitly during compilation.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {CURRICULA} from '../../dist/curricula.mjs';
import {importLesson,splitCatalog} from './v1_codec.mjs';
const ROOT=fileURLToPath(new URL('../../',import.meta.url));
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const json=x=>JSON.stringify(x,null,1)+'\n';
export function seedPack(pack,root=ROOT){
  const dir=path.join(root,'curricula',pack.id), config=read(path.join(dir,'pack.json'));
  const source=fs.readFileSync(path.join(dir,'reviewed/catalog.mjs'),'utf8');
  const {lessons,format}=splitCatalog(source),documents=read(path.join(dir,'originals/manifest.json')).documents;
  const resources=read(path.join(root,'dist',pack.resources));
  const structure=read(path.join(dir,'model/structure.json'));
  const assets=documents.flatMap(d=>(resources[d.kind]?.[d.grade]?.pages||[]).map((image,i)=>({id:`${d.id}/p${i+1}`,kind:d.kind==='workbook'?'workbook':'resource',grade:d.grade,image,source:{doc:d.id,pdf:i+1,printed:resources[d.kind][d.grade].printedPages?.[image]??null},provenance:{assertion:'stated',review:'unreviewed'}})));
  const program={pack:pack.id,state:pack.state,subject:pack.subject,academicYear:pack.academicYear,grades:[...new Set(lessons.map(l=>l.grade))].sort((a,b)=>a-b),documents:documents.map(d=>({id:d.id,kind:d.kind,grade:d.grade,title:{hi:d.originalFilename||d.file}})),provenance:{assertion:'editorial',review:'unreviewed',note:'Pack identity and archive metadata; no new source/academic approval.'}};
  const converted=lessons.map(v1=>importLesson(v1,{documents,structure}));
  const compatibility={format,order:lessons.map(l=>l.id),lessons:Object.fromEntries(converted.map(x=>[x.lesson.id,x.compatibility]))};
  const output={'model/program.json':json(program),'model/assets.json':json({pack:pack.id,assets}),'compat/v1.json':json(compatibility)};
  for(const g of program.grades)output[`model/lessons/${g}.json`]=json(converted.filter(x=>x.lesson.grade===g).map(x=>x.lesson));
  // Preflight all destinations before any writes. Existing model authorship is never reset.
  for(const name of Object.keys(output))if(fs.existsSync(path.join(dir,name)))throw Error(`${pack.id}/${name} exists; migration refuses to overwrite`);
  for(const [name,text]of Object.entries(output)){fs.mkdirSync(path.dirname(path.join(dir,name)),{recursive:true});fs.writeFileSync(path.join(dir,name),text);}
  return {pack:pack.id,lessons:lessons.length,assets:assets.length,files:Object.keys(output)};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const args=process.argv.slice(2);if(!args.includes('--write-model'))throw Error('Explicit --write-model required; this is a one-time migration');
  const wanted=args.filter(a=>!a.startsWith('--'));
  for(const pack of CURRICULA.filter(c=>!wanted.length||wanted.includes(c.id)))console.log(seedPack(pack));
}
