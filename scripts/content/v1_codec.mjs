// Lossless migration bridge. Canonical teaching fields live ONLY in model lessons.
// Legacy-only fields, ordering and auxiliary JS exports stay outside the content core.
import {lessonFromV1} from './v1_lesson.mjs';
import {dayTypeFor, slotsOf} from './structure.mjs';
const copy = x => structuredClone(x);
const ROOT = ['id','grade','week','day','title','phases','source'];
const STEP = ['id','title','actions','minutes','questions','image','sourceRect','instructions'];
const omit = (o, keys) => Object.fromEntries(Object.entries(o).filter(([k])=>!keys.includes(k)));
function ordered(keys, values) {
  return Object.fromEntries(keys.map(k=>{
    if (!(k in values)) throw Error(`Missing compatibility field ${k}`);
    return [k,values[k]];
  }));
}
export function splitCatalog(text) {
  const marker='export const LESSONS = ', start=text.indexOf(marker)+marker.length;
  if (start<marker.length || text[start]!=='[') throw Error('Unsupported v1 catalog format');
  let depth=0, quoted=false, escape=false, end;
  for (let i=start;i<text.length;i++) {
    const c=text[i];
    if (quoted) {if(escape)escape=false;else if(c==='\\')escape=true;else if(c==='"')quoted=false;continue;}
    if(c==='"')quoted=true;else if(c==='['||c==='{')depth++;else if(c===']'||c==='}') {depth--;if(!depth){end=i+1;break;}}
  }
  if (!end) throw Error('Unterminated catalog');
  const lessons=JSON.parse(text.slice(start,end));
  if (JSON.stringify(lessons)!==text.slice(start,end)) throw Error('Catalog needs an explicit serialization adapter');
  return {lessons,format:{prefix:text.slice(0,start),suffix:text.slice(end)}};
}
// Lesson-level workbook links sit after `assessment`, matching lesson.schema.json order.
export function withWorkbook(lesson, workbook) {
  const out={};for(const [k,v] of Object.entries(lesson)){if(k==='workbook')continue;out[k]=v;if(k==='assessment')out.workbook=workbook;}
  for(const k of Object.keys(lesson))delete lesson[k];return out;
}
export function importLesson(v1, {documents, structure}) {
  const docs=Object.fromEntries(documents.filter(d=>d.grade===v1.grade).map(d=>[d.kind,d.id]));
  const {dayType}=dayTypeFor(structure,v1.grade,v1.week,v1.day);
  if(!dayType)throw Error(`${v1.id}: no day type`);
  const lesson=lessonFromV1(v1,{docs,dayType:dayType.id,slots:slotsOf(v1,dayType),routineFor:()=>null});
  // Source page labels already present in v1 take precedence over inferred offsets.
  lesson.source.printed=v1.source.page??null;
  lesson.provenance.sources=[lesson.source];
  const steps=Object.fromEntries(lesson.periods.flatMap(p=>p.steps).map(s=>[s.id,s]));
  for(const phase of v1.phases){
    const s=steps[phase.id];
    if(phase.instructions&&JSON.stringify(phase.instructions)!==JSON.stringify(phase.actions))s.instructions=copy(phase.instructions);
    if(s.source&&phase.image===v1.source.image)s.source.printed=v1.source.page??null;
    if(s.workbook) s.workbook=s.workbook.map((link,i)=>({...link,source:{doc:docs.workbook,pdf:v1.worksheets[i].pdfPage,printed:v1.worksheets[i].page??null}}));
  }
  // Every workbook page the day cites belongs to the lesson, not only to a flagged step.
  if(v1.worksheets?.length)Object.assign(lesson,withWorkbook(lesson,v1.worksheets.map(w=>({to:`workbook:${docs.workbook}/p${w.pdfPage}`,assertion:'stated',review:'unreviewed',source:{doc:docs.workbook,pdf:w.pdfPage,printed:w.page??null}}))));
  const compatibility={keys:Object.keys(v1),fields:omit(v1,ROOT),source:{keys:Object.keys(v1.source),fields:omit(v1.source,['image','pdfPage','page'])},steps:{}};
  for(const p of v1.phases)compatibility.steps[p.id]={keys:Object.keys(p),fields:omit(p,STEP)};
  return {lesson,compatibility};
}
export function exportLesson(lesson, legacy, assets) {
  const imageOf=source=>{
    const image=assets.find(a=>a.source.doc===source?.doc&&a.source.pdf===source.pdf)?.image;
    if(!image)throw Error(`${lesson.id}: no image for source reference`);
    return image;
  };
  const steps=new Map(lesson.periods.flatMap(p=>p.steps).map(s=>[s.id,s]));
  if(steps.size!==lesson.periods.reduce((n,p)=>n+p.steps.length,0))throw Error(`${lesson.id}: duplicate step id`);
  if(steps.size!==lesson.v1.phaseIds.length)throw Error(`${lesson.id}: compatibility phase coverage changed`);
  const phases=lesson.v1.phaseIds.map(id=>{
    const s=steps.get(id),c=legacy.steps[id];if(!s||!c)throw Error(`${lesson.id}: missing legacy step ${id}`);
    return ordered(c.keys,{...copy(c.fields),id:s.id,title:s.title,actions:s.actions,instructions:s.instructions??s.actions,minutes:s.minutes,questions:s.questions??[],image:s.source?imageOf(s.source):undefined,sourceRect:s.source?.rect});
  });
  const source=ordered(legacy.source.keys,{...copy(legacy.source.fields),image:imageOf(lesson.source),pdfPage:lesson.source.pdf,page:lesson.source.printed});
  return ordered(legacy.keys,{...copy(legacy.fields),id:lesson.id,grade:lesson.grade,week:lesson.week,day:lesson.day,title:lesson.title,phases,source});
}
export function exportCatalog(lessons,compatibility,assets){
  const byId=new Map(lessons.map(l=>[l.id,l]));
  if(byId.size!==lessons.length||byId.size!==compatibility.order.length)throw Error('Compatibility lesson coverage changed');
  return compatibility.format.prefix+JSON.stringify(compatibility.order.map(id=>{
    if(!byId.has(id))throw Error(`Missing model lesson ${id}`);
    return exportLesson(byId.get(id),compatibility.lessons[id],assets);
  }))+compatibility.format.suffix;
}
