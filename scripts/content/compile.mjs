// Build product-neutral content releases from model JSON, never from browser state/PDFs.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {validate} from './schema.mjs';
import {loadProgramMetadata,validateProgramMetadata} from './program_metadata.mjs';
import {checkStructure,dayTypeFor} from './structure.mjs';
import {exportCatalog} from './v1_codec.mjs';
export const SCHEMA_VERSION='1.1.0';
const ROOT=fileURLToPath(new URL('../../',import.meta.url));
const json=x=>JSON.stringify(x,null,1)+'\n';
export const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const safeId=s=>typeof s==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
const versionOK=s=>typeof s==='string'&&/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[a-z0-9-]+(?:\.[a-z0-9-]+)*)?$/.test(s)&&!(s.split('-').slice(1).join('-').split('.').some(v=>/^0\d+$/.test(v)));
function compareVersions(a,b){
  const [av,ap]=a.split(/-(.*)/s),[bv,bp]=b.split(/-(.*)/s);
  const aa=av.split('.').map(Number),bb=bv.split('.').map(Number);
  for(let i=0;i<3;i++)if(aa[i]!==bb[i])return aa[i]>bb[i]?1:-1;
  if(ap===bp)return 0;if(ap===undefined)return 1;if(bp===undefined)return -1;
  const ax=ap.split('.'),bx=bp.split('.');
  for(let i=0;i<Math.max(ax.length,bx.length);i++){
    if(ax[i]===bx[i])continue;if(ax[i]===undefined)return -1;if(bx[i]===undefined)return 1;
    const an=/^\d+$/.test(ax[i]),bn=/^\d+$/.test(bx[i]);
    if(an&&bn)return BigInt(ax[i])>BigInt(bx[i])?1:-1;
    if(an!==bn)return an?-1:1;return ax[i]>bx[i]?1:-1;
  }return 0;
}
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name,'en')).flatMap(e=>{
  const p=path.join(dir,e.name);if(e.isSymbolicLink())throw Error(`Symlink not allowed: ${p}`);return e.isDirectory()?walk(p):[p];
});
export function loadPack(pack,root=ROOT){
  if(!safeId(pack))throw Error('Unsafe pack id');
  const dir=path.join(root,'curricula',pack), model=path.join(dir,'model');
  const config=read(path.join(dir,'pack.json'));
  const programMetadata=loadProgramMetadata(root,pack);
  if(config.status!=='reviewed-snapshot')throw Error(`${pack}: pack not reviewed for publication`);
  const inputFiles=[...walk(model).filter(p=>p.endsWith('.json')),path.join(dir,'compat/v1.json'),path.join(model,'PROGRAM_PROFILE.md')];
  const inputs=Object.fromEntries(inputFiles.map(p=>[path.relative(root,p).split(path.sep).join('/'),sha256(fs.readFileSync(p))]));
  const optional=name=>fs.existsSync(path.join(model,name))?read(path.join(model,name)):null;
  const assetModel=read(path.join(model,'assets.json'));if(assetModel.pack!==pack)throw Error('Asset pack identity mismatch');
  for(const a of assetModel.assets){const image=path.resolve(root,'dist',a.image);if(!image.startsWith(path.join(root,'dist')+path.sep)||!fs.existsSync(image)||!fs.statSync(image).isFile())throw Error('Missing or unsafe resource image');}
  const lessons=walk(path.join(model,'lessons')).filter(p=>p.endsWith('.json')).flatMap(p=>read(p));
  const guides=fs.existsSync(path.join(model,'guide'))?walk(path.join(model,'guide')).filter(p=>p.endsWith('.json')).map(read):[];
  const publication=path.resolve(root,'dist',config.publicationDirectory);
  if(publication!==path.join(root,'dist')&&!publication.startsWith(path.join(root,'dist')+path.sep))throw Error('Unsafe publication path');
  return {...programMetadata,pageMap:read(path.join(model,'pagemap.json')),pack,program:read(path.join(model,'program.json')),structure:read(path.join(model,'structure.json')),sections:read(path.join(model,'sections.json')),assets:assetModel.assets,lessons,guides,compat:read(path.join(dir,'compat/v1.json')),outcomes:optional('outcomes.json'),sequence:optional('sequence.json'),routines:optional('routines.json'),materials:optional('materials.json'),assessments:optional('assessments.json'),inputs,parityCatalog:fs.readFileSync(path.join(publication,'catalog.mjs'),'utf8')};
}
function assertSchema(schema,data){const errors=validate(schema,data);if(errors.length)throw Error(`${schema}: ${errors.slice(0,8).join('; ')}`);}
function eachSource(value,visit){
  if(!value||typeof value!=='object')return;
  if(typeof value.doc==='string'&&Number.isInteger(value.pdf))visit(value);
  for(const v of Object.values(value))eachSource(v,visit);
}
export function buildRelease(data,{version,previous=null}={}){
  if(!versionOK(version))throw Error('Version must be a safe semantic version');
  if(previous&&(previous.pack!==data.pack||!versionOK(previous.version)||compareVersions(version,previous.version)<=0))throw Error('Previous release pack/version mismatch');
  const metadataErrors=validateProgramMetadata(data);if(metadataErrors.length)throw Error(metadataErrors.join('; '));
  assertSchema('assets',{pack:data.pack,assets:data.assets});
  assertSchema('program',data.program);assertSchema('structure',data.structure);assertSchema('sections',data.sections);
  if(data.pack!==data.program.pack||data.sections.pack!==data.pack||data.structure.pack!==data.pack)throw Error('Pack identity mismatch');
  if(new Set(data.program.grades).size!==data.program.grades.length||[...new Set(data.lessons.map(l=>l.grade))].sort((a,b)=>a-b).join()!==[...data.program.grades].sort((a,b)=>a-b).join())throw Error('Program grade coverage mismatch');
  const structureErrors=checkStructure(data.structure);if(structureErrors.length)throw Error(structureErrors.join('; '));
  for(const lesson of data.lessons){assertSchema('lesson',lesson);if(dayTypeFor(data.structure,lesson.grade,lesson.week,lesson.day).dayType?.id!==lesson.dayType)throw Error(`${lesson.id}: wrong day type`);}
  for(const lesson of data.lessons){
    const t=dayTypeFor(data.structure,lesson.grade,lesson.week,lesson.day).dayType;
    if(t.planForm==='daily-plan'){const expected=t.periods.filter(p=>p.role!=='open').map(p=>p.number.join('+')).join(',');const actual=lesson.periods.map(p=>p.number.join('+')).join(',');if(expected!==actual)throw Error(`${lesson.id}: period structure mismatch`);}
    for(const period of lesson.periods){const shape=t.periods.find(p=>p.number.join()===period.number.join());for(const step of period.steps)for(const slot of step.slots||[])if(!shape?.slots.some(s=>s.id===slot))throw Error(`${lesson.id}: invalid slot ${slot}`);}
  }
  for(const guide of data.guides)assertSchema('guide',guide);
  for(const name of ['outcomes','sequence','routines','materials','assessments'])if(data[name]){assertSchema(name,data[name]);if(data[name].pack!==data.pack)throw Error(`${name}: wrong pack`);}
  const docs=new Map(data.program.documents.map(d=>[d.id,d]));
  if(docs.size!==data.program.documents.length)throw Error('Duplicate document id');
  const assetsByDoc=new Map(), imagePaths=new Set();
  for(const a of data.assets){
    if(!a.image||a.image.startsWith('/')||a.image.split('/').includes('..')||imagePaths.has(a.image))throw Error('Unsafe or duplicate resource image');
    if(!['resource','workbook'].includes(a.kind)||!a.id||!a.provenance)throw Error('Invalid asset record');
    const doc=docs.get(a.source.doc);if(!doc||doc.grade!==a.grade||a.id!==`${doc.id}/p${a.source.pdf}`||a.kind!==(doc.kind==='workbook'?'workbook':'resource'))throw Error('Asset/document identity mismatch');
    imagePaths.add(a.image);const d=assetsByDoc.get(a.source.doc)||new Set();if(d.has(a.source.pdf))throw Error('Duplicate document page');d.add(a.source.pdf);assetsByDoc.set(a.source.doc,d);
  }
  for(const [doc,pages]of assetsByDoc){if(!docs.has(doc)||[...pages].sort((a,b)=>a-b).some((p,i)=>p!==i+1))throw Error('Invalid or incomplete document page sequence');}
  const checkSource=s=>{
    if(!docs.has(s.doc)||!assetsByDoc.get(s.doc)?.has(s.pdf))throw Error(`Unresolved source ${s.doc} p${s.pdf}`);
    if(s.rect&&(!(s.rect.length===4)||s.rect.some(n=>!Number.isFinite(n)||n<0||n>1)||s.rect[0]>=s.rect[2]||s.rect[1]>=s.rect[3]))throw Error('Invalid source crop');
  };
  eachSource({understanding:data.understanding,program:data.program,lessons:data.lessons,guides:data.guides,assets:data.assets,structure:data.structure,...Object.fromEntries(['outcomes','sequence','routines','materials','assessments'].map(k=>[k,data[k]]))},checkSource);
  const v1=exportCatalog(data.lessons,data.compat,data.assets);
  if(v1!==data.parityCatalog)throw Error(`${data.pack}: v1 catalog byte parity failed`);
  const provenance={assertion:'stated',review:'unreviewed'};
  const sections=Object.entries(data.sections.guides).flatMap(([grade,g])=>g.sections.map(s=>({...s,id:`g${grade}/${s.id}`,grade:+grade,source:{doc:g.document,pdf:s.pdf[0],printed:s.pdf[0]>data.sections.printedOffset?s.pdf[0]-data.sections.printedOffset:null},provenance})));
  const populated=new Map(sections.map(s=>[s.id,s]));
  for(const guide of data.guides)for(const s of guide.sections){if(!populated.has(s.id))throw Error(`Guide section absent from page map: ${s.id}`);populated.set(s.id,{...populated.get(s.id),...s});}
  const entities={program:[{id:data.pack,...data.program}],document:data.program.documents.map(d=>({...d,provenance})),daytype:data.structure.dayTypes.map(t=>({...t,provenance:t.provenance||data.structure.provenance||provenance})),lesson:data.lessons,step:data.lessons.flatMap(l=>l.periods.flatMap(p=>p.steps.map(s=>({...s,id:`${l.id}/${s.id}`,lesson:l.id,grade:l.grade,week:l.week,day:l.day,period:p.number})))),section:[...populated.values()],passage:data.guides.flatMap(g=>g.sections.flatMap(s=>(s.passages||[]).map(p=>({...p,section:s.id,grade:g.grade})))),lo:data.outcomes?.outcomes||[],objective:data.outcomes?.objectives||[],unit:data.sequence?.units||[],routine:data.routines?.routines||[],material:data.materials?.materials||[],assessment:data.assessments?.assessments||[],resource:data.assets.filter(a=>a.kind==='resource'),workbook:data.assets.filter(a=>a.kind==='workbook')};
  const index=new Map();
  for(const [kind,list]of Object.entries(entities))for(const entity of list){const id=`${kind}:${entity.id}`;if(index.has(id))throw Error(`Duplicate entity ${id}`);index.set(id,entity);}
  const graph=[];
  const add=(from,relation,link)=>{
    if(!index.has(from)||!index.has(link.to))throw Error(`Dangling graph link ${from} -> ${link.to}`);
    if(!['stated','derived','editorial'].includes(link.assertion)||!['unreviewed','source-compared','reviewed','owner-approved'].includes(link.review))throw Error('Invalid link provenance');
    if(link.assertion==='derived'&&!link.rule)throw Error('Derived link needs named rule');
    if(link.assertion==='stated'&&!link.source&&!index.get(from)?.source&&!index.get(from)?.provenance?.sources?.length)throw Error('Stated link needs a source');
    graph.push({from,relation,...link});
  };
  function links(from,value,relation='link'){
    if(!value||typeof value!=='object')return;
    if(typeof value.to==='string'){add(from,relation,value);return;}
    for(const [key,v]of Object.entries(value))if(key!=='provenance'&&key!=='v1'){
      if(Array.isArray(v))for(const item of v)links(from,item,key);
      else if(v&&typeof v==='object')links(from,v,key);
    }
  }
  for(const [id,e]of index)links(id,id.startsWith('lesson:')?Object.fromEntries(Object.entries(e).filter(([k])=>k!=='periods')):id.startsWith('section:')?Object.fromEntries(Object.entries(e).filter(([k])=>k!=='passages')):e);
  for(const l of data.lessons){
    add(`lesson:${l.id}`,'dayType',{to:`daytype:${l.dayType}`,assertion:'derived',review:'unreviewed',rule:'calendar-day-type',source:l.source});
    for(const p of l.periods)for(const s of p.steps)add(`lesson:${l.id}`,'step',{to:`step:${l.id}/${s.id}`,assertion:'stated',review:s.provenance.review,source:s.source||l.source});
  }
  // Typed string references in the model also become graph edges (no implicit joins).
  for(const [from,e]of index){
    const proof={...(e.provenance?.rule?{rule:e.provenance.rule}:{}),assertion:e.provenance?.assertion||'stated',review:e.provenance?.review||'unreviewed',...(e.source?{source:e.source}:e.provenance?.sources?.[0]?{source:e.provenance.sources[0]}:{})};
    for(const ref of [...(e.source?[e.source]:[]),...(e.provenance?.sources||[])])add(from,'cites',{to:`document:${ref.doc}`,assertion:'stated',review:proof.review,source:ref});
    if(e.section)add(from,'section',{...proof,to:`section:${e.section}`});
    if(from.startsWith('lo:')&&e.parent)add(from,'parent',{...proof,to:`lo:${e.parent}`});
    if(from.startsWith('material:')&&e.document)add(from,'document',{...proof,to:`document:${e.document}`});
  }
  // A step's links belong to the step node, not implicitly to the parent lesson.
  const uniqueGraph=[...new Map(graph.map(e=>[JSON.stringify(e),e])).values()].sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b),'en'));
  const current=Object.fromEntries([...index].map(([id,e])=>[id,sha256(json(e))]));
  const legacyHashes=Object.fromEntries(Object.entries(data.compat.lessons).map(([id,value])=>[id,sha256(json(value))]));
  const old=previous?.entityHashes||{};
  const removed=Object.keys(old).filter(id=>!current[id]).sort();if(removed.length)throw Error(`Stable entities removed: ${removed.join(', ')}`);
  const changelog={pack:data.pack,version,previous:previous?.version||null,added:Object.keys(current).filter(id=>!old[id]).sort(),changed:[...new Set([...Object.keys(current).filter(id=>old[id]&&old[id]!==current[id]),...Object.keys(legacyHashes).filter(id=>previous?.legacyHashes?.[id]&&previous.legacyHashes[id]!==legacyHashes[id]).map(id=>`lesson:${id}`)])].sort(),removed};
  const files=new Map();
  for(const [kind,list]of Object.entries(entities))files.set(`entities/${kind}.json`,json(list));
  files.set('graph.json',json(uniqueGraph));files.set('structure.json',json(data.structure));
  files.set('program-understanding.json',json(data.understanding));files.set('PROGRAM_PROFILE.md',data.profileText);files.set('sections.json',json(data.sections));files.set('pagemap.json',json(data.pageMap));files.set('views/v1/catalog.mjs',v1);
  for(const grade of data.program.grades)files.set(`views/app/grade-${grade}.json`,json({pack:data.pack,version,grade,lessons:data.lessons.filter(l=>l.grade===grade)}));
  const oldFiles=Object.fromEntries(Object.entries(previous?.files||{}).filter(([name])=>name!=='CHANGELOG.json'));
  changelog.files={added:[...files.keys()].filter(n=>!oldFiles[n]).sort(),changed:[...files].filter(([n,t])=>oldFiles[n]&&oldFiles[n].sha256!==sha256(t)).map(([n])=>n).sort(),removed:Object.keys(oldFiles).filter(n=>!files.has(n)).sort()};
  files.set('CHANGELOG.json',json(changelog));
  const reviewSummary={};for(const entity of index.values()){const review=entity.provenance?.review||'unreviewed';reviewSummary[review]=(reviewSummary[review]||0)+1;}
  const manifest={pack:data.pack,version,schemaVersion:SCHEMA_VERSION,counts:Object.fromEntries(Object.entries(entities).map(([k,v])=>[k,v.length])),reviewSummary,programStructure:{...data.program.structure,status:data.understanding.status,review:data.understanding.provenance.review,dimensions:data.understanding.dimensions.map(d=>({id:d.id,status:d.status,sourceReferences:d.sourceRefs.length}))},pendingModels:['outcomes','sequence','routines','materials','assessments',...(!data.guides.length?['guide']:[])].filter(k=>k==='guide'||!data[k]),inputs:data.inputs,entityHashes:current,legacyHashes,files:Object.fromEntries([...files].map(([name,text])=>[name,{sha256:sha256(text),bytes:Buffer.byteLength(text)}]))};
  assertSchema('../content-release/manifest.schema.json',manifest);
  files.set('manifest.json',json(manifest));return {files,manifest,entities,graph:uniqueGraph,changelog,structure:data.structure,understanding:data.understanding};
}
export function writeRelease(release,directory,{check=false}={}){
  const expected=release.files;
  for(const name of expected.keys())if(path.isAbsolute(name)||name.split(/[\\/]/).some(p=>p==='..'||p==='.'||!p))throw Error('Unsafe release file path');
  if(fs.existsSync(directory)){
    if(fs.lstatSync(directory).isSymbolicLink())throw Error('Release directory cannot be a symlink');
    const actual=walk(directory).map(p=>path.relative(directory,p).split(path.sep).join('/'));
    if(actual.length!==expected.size||actual.some(n=>!expected.has(n))||[...expected].some(([n,t])=>!fs.existsSync(path.join(directory,n))||fs.readFileSync(path.join(directory,n),'utf8')!==t))throw Error('Immutable release differs; choose a new version (never overwrite)');
    return 'unchanged';
  }
  if(check)throw Error('Release missing; build explicitly first');
  fs.mkdirSync(path.dirname(directory),{recursive:true});const stage=fs.mkdtempSync(path.join(path.dirname(directory),'.compile-'));
  try{for(const [name,text]of expected){const p=path.join(stage,name);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,text);}fs.renameSync(stage,directory);}finally{fs.rmSync(stage,{force:true,recursive:true});}
  return 'created';
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const args=process.argv.slice(2), opts={};const packs=[];
  for(let i=0;i<args.length;i++){if(args[i]==='--check')opts.check=true;else if(['--version','--previous'].includes(args[i]))opts[args[i].slice(2)]=args[++i];else if(args[i].startsWith('--'))throw Error(`Unknown option ${args[i]}`);else packs.push(args[i]);}
  if(!versionOK(opts.version))throw Error('--version required (e.g. 1.0.0)');if(opts.previous&&!versionOK(opts.previous))throw Error('Invalid --previous');
  const wanted=packs.length?packs:fs.readdirSync(path.join(ROOT,'curricula')).filter(p=>fs.existsSync(path.join(ROOT,'curricula',p,'model/program.json')));
  for(const pack of wanted){const data=loadPack(pack),base=path.join(ROOT,'content',pack);const previous=opts.previous?read(path.join(base,opts.previous,'manifest.json')):null;const release=buildRelease(data,{version:opts.version,previous});console.log(`${pack}: ${writeRelease(release,path.join(base,opts.version),opts)}; ${release.manifest.counts.lesson} lessons; v1 byte parity PASS`);}
}
