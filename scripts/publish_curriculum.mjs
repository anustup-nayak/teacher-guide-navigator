// Explicit local publication of reviewed files; never reads originals/extracted.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const [id,...flags]=process.argv.slice(2),check=flags.includes('--check');
if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id||'')||flags.some(f=>f!=='--check'))throw Error('Usage: node scripts/publish_curriculum.mjs <pack-id> [--check]');
const pack=path.join(root,'curricula',id),config=JSON.parse(fs.readFileSync(path.join(pack,'pack.json'),'utf8'));
if(config.id!==id||config.status!=='reviewed-snapshot'||!config.reviewedFiles?.length)throw Error('No reviewed snapshot is ready');
const legacy=id==='up-math-2026';
if(config.publicationDirectory!==(legacy?'.':`packs/${id}`))throw Error('Publication directory does not match pack identity');
const target=path.join(root,'dist',config.publicationDirectory);
const allowed=new Set(['catalog.mjs','sources.json','resources.json','worksheets.json']);
// Validate every file before writing any of them. Page assets already belong to
// published resource folders; they are checked by registry/release tests.
const files=config.reviewedFiles.map(name=>{
 if(!allowed.has(name))throw Error(`Unsupported reviewed file: ${name}`);
 const source=path.join(pack,'reviewed',name),destination=path.join(target,name);
 const data=fs.readFileSync(source);
 if(check&&(!fs.existsSync(destination)||!data.equals(fs.readFileSync(destination))))throw Error(`Published file differs from reviewed snapshot: ${name}`);
 return {destination,data};
});
if(!check){fs.mkdirSync(target,{recursive:true});for(const {destination,data} of files)fs.writeFileSync(destination,data);}
console.log(`${id}: ${files.length} reviewed files ${check?'match publication':'published locally'}`);
