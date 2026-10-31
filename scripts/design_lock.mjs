// Tripwire for the protected design (docs/DESIGN_CONTRACT.md). `check` compares protected files with
// docs/design-lock.json; `approve` records an owner-approved change. Never approve without the owner's yes.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),lockFile=path.join(root,'docs/design-lock.json');
export const PROTECTED=['dist/styles.css','dist/guide-cards.css','dist/index.html'];
// Release versions (?v=r56) change on every release and are not design.
const normalize=(file,text)=>file.endsWith('.html')?text.replace(/\?v=r\d+/g,'?v=rNN'):text;
export const hashFile=file=>crypto.createHash('sha256').update(normalize(file,fs.readFileSync(path.join(root,file),'utf8'))).digest('hex');
export const readLock=()=>JSON.parse(fs.readFileSync(lockFile,'utf8'));
export function designStatus(lock=readLock()){const changed=[];for(const file of PROTECTED){if(lock.files[file]!==hashFile(file))changed.push(file);}return {changed,missing:PROTECTED.filter(f=>!(f in lock.files))};}
function approve(args){const value=name=>{const i=args.indexOf(name);return i>=0?args[i+1]?.trim():''};
 const reason=value('--reason'),approvedBy=value('--approved-by'),initial=args.includes('--init');
 if(!reason||!approvedBy)throw Error('design:approve needs --reason "…" and --approved-by "owner, in chat, YYYY-MM-DD". Get the owner\'s explicit approval first (docs/DESIGN_CONTRACT.md).');
 const lock=fs.existsSync(lockFile)?readLock():(initial?{version:1,contract:'docs/DESIGN_CONTRACT.md',files:{},approvals:[]}:null);
 if(!lock)throw Error('docs/design-lock.json is missing; restore it from git rather than recreating it.');
 const files=initial&&!Object.keys(lock.files).length?PROTECTED:designStatus(lock).changed;
 if(!files.length){console.log('Design lock already matches; nothing to approve.');return;}
 for(const file of PROTECTED)lock.files[file]=hashFile(file);
 lock.approvals.push({date:new Date().toISOString().slice(0,10),reason,approvedBy,files});
 fs.writeFileSync(lockFile,JSON.stringify(lock,null,2)+'\n');console.log(`Recorded design approval for ${files.join(', ')}. Add a docs/HANDOFF.md log entry naming this approval.`);}
function check(){const {changed,missing}=designStatus();
 if(changed.length||missing.length){console.error(`Protected design files changed without a recorded approval: ${[...changed,...missing].join(', ')}\nRevert them, or get the owner's explicit approval and run: npm run design:approve -- --reason "…" --approved-by "…"\nSee docs/DESIGN_CONTRACT.md.`);process.exit(1);}
 console.log(`Design lock OK: ${PROTECTED.length} protected files match docs/design-lock.json`);}
if(process.argv[1]===fileURLToPath(import.meta.url)){const [command,...args]=process.argv.slice(2);if(command==='approve')approve(args);else if(command==='check'||!command)check();else throw Error(`Unknown command ${command}; use check or approve`);}
