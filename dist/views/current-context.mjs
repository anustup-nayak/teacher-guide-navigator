import {gradeLabel} from '../domain/selection.mjs?v=r69';
export function describeCurrentContext({pack,grade,lang,prefs,screen,lesson,section}){
 const t=(hi,en)=>lang==='en'?en:hi;
 const identity=gradeLabel(pack,lesson?.grade??grade,lang)+' · '+pack.subjectLabel[lang];
 const place=screen==='lesson'&&lesson
  ? `${t('सप्ताह','Week')} ${lesson.week} · ${t('दिन','Day')} ${lesson.day} · ${section||t('तैयारी','Prepare')}`
  : screen==='lesson'?t('पाठ नहीं मिला','Lesson not found'):screen==='saved'||screen==='help'||screen==='guide'||screen==='today'?''
  : prefs.query?.trim()?t('खोज के परिणाम','Search results')
  : prefs.mode==='week'?`${t('सभी पाठ','All lessons')} · ${prefs.week?t('सप्ताह','Week')+' '+prefs.week:t('स्कूल रेडिनेस','School readiness')}`
  : `${t('सभी पाठ','All lessons')} · ${prefs.openTopic||t('पाठ के विषय','Topics')}`;
 return {identity,location:place};
}
