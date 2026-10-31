import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {CURRICULA,validateCurricula} from '../dist/curricula.mjs';
import {verifyPreserved} from './publication_integrity.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const baseline=JSON.parse(fs.readFileSync(path.join(root,'curricula/published-baseline.json'),'utf8'));
const errors=[...validateCurricula(CURRICULA),...verifyPreserved(baseline,CURRICULA,root)];
for(const pack of CURRICULA){if(!baseline.packs.some(p=>p.id===pack.id))errors.push(`New delivery not recorded in preservation baseline: ${pack.id}`);const run=spawnSync(process.execPath,[path.join(root,'scripts/publish_curriculum.mjs'),pack.id,'--check'],{cwd:root,stdio:'inherit'});if(run.status!==0)errors.push(`Publication mismatch: ${pack.id}`);}
if(errors.length)throw Error(errors.join('\n'));console.log('All registered publications and previously published payloads/pages preserved');
