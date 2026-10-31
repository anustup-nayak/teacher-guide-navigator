export function selectCurriculum(packs,id){
  // Legacy URLs without a curriculum always resolve to the original UP pack.
  return packs.find(p=>p.id===id)||packs[0];
}
export function gradesFor(pack){return [...new Set(pack.lessons.map(l=>l.grade))].sort((a,b)=>a-b);}
export function reviewWeeksFor(pack,grade){return Object.keys(pack.reviewPages?.[grade]||{}).map(Number).sort((a,b)=>a-b);}
export function validateCurricula(packs){
  const errors=[],ids=new Set(),keys=new Set(),coverage=new Map();
  if(!packs.length)errors.push('No curriculum packs');
  for(const p of packs){
    for(const field of ['id','state','subject','academicYear','storageKey','resources','worksheets'])if(!p[field])errors.push(`${p.id}: missing ${field}`);
    if(ids.has(p.id))errors.push(`${p.id}: duplicate curriculum id`);
    if(keys.has(p.storageKey))errors.push(`${p.id}: duplicate storage namespace`);
    ids.add(p.id);keys.add(p.storageKey);
    for(const field of ['label','subjectLabel','coverage'])for(const lang of ['hi','en'])if(!p[field]?.[lang])errors.push(`${p.id}: missing ${field}.${lang}`);
    if(!p.lessons?.length)errors.push(`${p.id}: empty lessons`);
    for(const grade of gradesFor({...p,lessons:p.lessons||[]})){const key=JSON.stringify([p.state,p.academicYear,p.subject,grade]);if(coverage.has(key))errors.push(`${p.id}: ambiguous grade/subject coverage with ${coverage.get(key)}`);coverage.set(key,p.id);}
    for(const l of p.lessons||[])if(l.subject!==p.subject)errors.push(`${p.id}: lesson ${l.id} has a different subject`);
    for(const [grade,weeks] of Object.entries(p.reviewPages||{}))for(const [week,page] of Object.entries(weeks)){
      if(!gradesFor(p).includes(Number(grade))||!Number.isInteger(Number(week))||Number(week)<1||!Number.isInteger(page)||page<1)errors.push(`${p.id}: invalid review mapping`);
      if(p.lessons.some(l=>l.grade===Number(grade)&&l.week===Number(week)))errors.push(`${p.id}: review week overlaps daily lessons`);
    }
  }
  return errors;
}
