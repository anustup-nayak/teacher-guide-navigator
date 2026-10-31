// Add new deliveries to the preservation baseline; never rewrites existing records.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {CURRICULA,validateCurricula} from '../dist/curricula.mjs';
import {snapshotPack,verifyPreserved,digest} from './publication_integrity.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),file=path.join(root,'curricula/published-baseline.json');
const baseline=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{version:1,packs:[],assets:{}};
const errors=[...validateCurricula(CURRICULA),...verifyPreserved(baseline,CURRICULA,root)];if(errors.length)throw Error(errors.join('\n'));
for(const pack of CURRICULA)if(!baseline.packs.some(p=>p.id===pack.id))baseline.packs.push(snapshotPack(pack,root));
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else if(entry.name.endsWith('.webp')){const relative=path.relative(path.join(root,'dist'),full).split(path.sep).join('/');if(!baseline.assets[relative])baseline.assets[relative]=digest(full);}}}
walk(path.join(root,'dist'));fs.writeFileSync(file,JSON.stringify(baseline,null,2)+'\n');console.log(`Preservation baseline: ${baseline.packs.length} deliveries, ${Object.keys(baseline.assets).length} page hashes; existing records preserved`);
