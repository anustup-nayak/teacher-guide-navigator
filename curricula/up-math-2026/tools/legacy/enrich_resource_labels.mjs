import fs from 'node:fs';
import {LESSONS} from '../../../../dist/data.mjs';
const file='curricula/up-math-2026/reviewed/resources.json',r=JSON.parse(fs.readFileSync(file)),sheets=JSON.parse(fs.readFileSync('dist/worksheets.json'));
for(const docs of Object.values(r))for(const d of Object.values(docs))d.printedPages={};
function label(kind,grade,image,page){const map=r[kind][grade].printedPages;if(map[image]!=null&&map[image]!==page)throw Error('Conflicting printed page');map[image]=page;}
for(const l of LESSONS)label('guide',l.grade,l.source.image,l.source.page);
for(const w of sheets)label('workbook',w.grade,w.image,w.page);
fs.writeFileSync(file,JSON.stringify(r));
