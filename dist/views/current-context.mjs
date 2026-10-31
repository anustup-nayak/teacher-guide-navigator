import {gradeLabel} from '../domain/selection.mjs?v=r61';
export function describeCurrentContext({pack,grade,lang,prefs,screen,lesson,section}){
 const t=(hi,en)=>lang==='en'?en:hi;
 const identity=gradeLabel(pack,lesson?.grade??grade,lang)+' · '+pack.subjectLabel[lang];
 const place=screen==='lesson'&&lesson
  ? `${t('सप्ताह','Week')} ${lesson.week} · ${t('दिन','Day')} ${lesson.day} · ${section||t('तैयारी','Prepare')}`
  : screen==='lesson'?t('पाठ नहीं मिला','Lesson not found'):screen==='saved'?t('मेरी सूची','My list'):screen==='help'?t('मदद','Help')
  : prefs.query?.trim()?t('खोज के परिणाम','Search results')
  : prefs.mode==='week'?`${t('पाठ चुनें','Lessons')} · ${t('सप्ताह','Week')} ${prefs.week}`
  : `${t('पाठ चुनें','Lessons')} · ${prefs.openTopic||t('पाठ के विषय','Topics')}`;
 return {identity,location:place};
}
