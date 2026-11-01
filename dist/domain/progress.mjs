// Where a teacher is in the year, from this device's own "taught" marks (docs/UX_REVIEW_2026-11.md).
// Pure functions: no storage, no DOM. "Next" always means the next lesson in the guide's order
// (owner decision, 1 Nov 2026), never the next lesson the class is judged ready for.
export function gradeSequence(lessons,grade){
 return lessons.filter(l=>l.grade===Number(grade)).sort((a,b)=>a.week-b.week||a.day-b.day||(a.lessonOrder??0)-(b.lessonOrder??0));
}
// The lesson after the furthest lesson marked taught; the first lesson when nothing is marked.
export function teacherPosition(lessons,grade,completed={}){
 const seq=gradeSequence(lessons,grade);let last=-1;
 seq.forEach((l,i)=>{if(completed?.[l.id])last=i;});
 const next=seq[last+1]||null;
 return {next,previous:last>=0?seq[last]:null,taught:seq.filter(l=>completed?.[l.id]).length,total:seq.length,finished:seq.length>0&&!next,week:(next||seq[seq.length-1])?.week??null};
}
export function weekLessons(lessons,grade,week){return gradeSequence(lessons,grade).filter(l=>l.week===Number(week));}
// Lessons before and after this one in the guide's order, within its grade.
export function lessonChain(lessons,lesson){
 const seq=gradeSequence(lessons,lesson.grade),i=seq.findIndex(l=>l.id===lesson.id);
 return {previous:i>0?seq[i-1]:null,next:i>=0?seq[i+1]||null:null};
}
// Goal membership and position. goalMap = LESSON_GOALS[pack]: {titles, lessons: {lessonId: [goalId]}}.
// Position counts teaching lessons only (not weekly-template days), in the guide's order.
export function lessonGoals(goalMap,lessons,lesson,completed={}){
 const ids=goalMap?.lessons?.[lesson.id]||[];if(!ids.length)return [];
 const seq=gradeSequence(lessons,lesson.grade);
 return ids.map(id=>{
  const teaching=seq.filter(l=>l.structure!=='weekly-template'&&(goalMap.lessons[l.id]||[]).includes(id));
  const index=teaching.findIndex(l=>l.id===lesson.id);
  return {id,title:goalMap.titles?.[id]||{hi:id,en:id},position:index>=0?index+1:null,total:teaching.length,taught:teaching.filter(l=>completed?.[l.id]).length};
 });
}
// Ask "did you teach it?" about the lesson last opened in this grade, unless already marked,
// already asked today, or dismissed three times in a row (then the end-of-lesson button remains).
export const PROMPT_STOP_AFTER=3;
export function shouldAskTaught({lesson,completed={},record={},today}){
 if(!lesson||completed[lesson.id])return false;
 if((record.streak||0)>=PROMPT_STOP_AFTER)return false;
 return !(record.id===lesson.id&&record.day===today);
}
export function dismissTaught(record={},lessonId,today){return {id:lessonId,day:today,streak:(record.streak||0)+1};}
export function confirmTaught(){return {streak:0};}
