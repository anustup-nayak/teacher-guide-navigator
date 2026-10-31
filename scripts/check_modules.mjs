import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):e.name.endsWith('.mjs')?[path.join(dir,e.name)]:[]);}
for(const file of [...walk('dist'),'dist/sw.js']){const result=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});if(result.status!==0)process.exit(result.status||1);}
