import {gradesFor} from './curriculum.mjs?v=r66';
export const groupKey=pack=>JSON.stringify([pack.state,pack.academicYear]);
export function curriculumGroups(packs){return [...new Map(packs.filter(p=>p.lessons?.length).map(p=>[groupKey(p),{id:groupKey(p),state:p.state,stateLabel:p.stateLabel,academicYear:p.academicYear}])).values()];}
export const packsInGroup=(packs,group)=>packs.filter(p=>groupKey(p)===group&&p.lessons?.length);
export const levelsInGroup=(packs,group)=>[...new Set(packsInGroup(packs,group).flatMap(gradesFor))].sort((a,b)=>a-b);
export function subjectsAtLevel(packs,group,grade){return [...new Map(packsInGroup(packs,group).filter(p=>gradesFor(p).includes(Number(grade))).map(p=>[p.subject,{id:p.subject,label:p.subjectLabel}])).values()];}
export const packForSelection=(packs,{group,grade,subject})=>packsInGroup(packs,group).find(p=>p.subject===subject&&gradesFor(p).includes(Number(grade)));
// Grade changes retain subject where available; a missing pair never displays unrelated lessons.
export function selectionForGroup(packs,group,grade,subject){const levels=levelsInGroup(packs,group);if(!levels.length)return null;const level=levels.includes(Number(grade))?Number(grade):levels[0];const subjects=subjectsAtLevel(packs,group,level);const chosen=subjects.some(s=>s.id===subject)?subject:subjects[0]?.id;return {pack:packForSelection(packs,{group,grade:level,subject:chosen}),grade:level};}
export function selectionURL(currentURL,pack,grade,lang){const url=new URL(currentURL);url.searchParams.set('curriculum',pack.id);url.searchParams.set('grade',String(grade));url.searchParams.set('ui',lang);url.hash='/find';return url.href;}
// A lesson id names its grade and subject (g2-hindi-w19-d03), so a link without ?curriculum=
// can still find its pack. Same state/year group first; a pack holding the id wins.
export function packForLessonId(packs,id,group){const m=/^g(\d+)-([a-z]+)-w\d+-d\d+$/.exec(id||'');if(!m)return null;const grade=Number(m[1]),fits=packs.filter(p=>p.subject===m[2]&&gradesFor(p).includes(grade)).sort((a,b)=>(groupKey(b)===group)-(groupKey(a)===group));const pack=fits.find(p=>p.lessons?.some(l=>l.id===id))||fits[0];return pack?{pack,grade}:null;}
export function lessonURL(currentURL,pack,grade,lang){const url=new URL(selectionURL(currentURL,pack,grade,lang));url.hash=new URL(currentURL).hash;return url.href;}
export function gradeLabel(pack,grade,lang='hi'){return pack.gradeLabels?.[grade]?.[lang]||(Number(grade)===0?(lang==='en'?'Balvatika':'बालवाटिका'):(lang==='en'?'Grade ':'कक्षा ')+grade);}
