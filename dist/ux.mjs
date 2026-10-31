import {gradeLabel} from './domain/selection.mjs?v=r56';
export function resumeForGrade(lessons,last,byGrade,grade){
 const candidate=byGrade?.[grade]||last;
 const lesson=candidate&&lessons.find(l=>l.id===candidate.id&&l.grade===Number(grade));
 return lesson?{lesson,step:Math.min(Math.max(0,Number(candidate.step)||0),lesson.phases.length-1)}:null;
}
export const normalizeSearch=value=>String(value??'').normalize('NFC').toLocaleLowerCase('hi').replace(/[०-९]/g,c=>String('०१२३४५६७८९'.indexOf(c))).replace(/[‐‑–—−]/g,'-').replace(/\s+/g,' ').trim();
export function searchLessons(lessons,query){const q=normalizeSearch(query);if(!q)return lessons;const words=q.split(' ');return lessons.map((lesson,index)=>{const title=normalizeSearch(lesson.title+' '+lesson.topic),all=normalizeSearch([lesson.title,lesson.topic,lesson.loCode,lesson.loStatement,lesson.outcome,lesson.summary,...(lesson.materials||[]),...(lesson.phases||[]).flatMap(p=>p.actions||[])].join(' '));return {lesson,index,match:words.every(w=>all.includes(w)),rank:title.includes(q)?2:normalizeSearch(lesson.summary).includes(q)?1:0};}).filter(x=>x.match).sort((a,b)=>b.rank-a.rank||a.index-b.index).map(x=>x.lesson);}
export function teachingInstructions(lesson,phase){
 const lines=(phase.instructions?.length?phase.instructions:phase.questions?.length?[]:phase.actions).map(text=>phase.id==='practice'&&!lesson.worksheets?.length?text.replace('इस सप्ताह का अलग कार्यपत्रक उपलब्ध स्रोत में नहीं है। ','').replace('नीचे “बच्चे स्वयं करें”','“बच्चे स्वयं करें” भाग'):text);
 // Restore the source sentence split and reversed by two-column extraction.
 // Compared with g3-p019; exact fragments only, no new teaching instructions.
 const first=lines.indexOf('के साथ रिमीडियल कार्य करें।');
 if(first>=0&&lines[first+1]==='गणित खेल के पश्चात् चिह्नित बच्चों')lines.splice(first,2,'गणित खेल के पश्चात् चिह्नित बच्चों के साथ रिमीडियल कार्य करें।');
 return lines;
}
const textRepairs=new Map([
 ['1 से 9 तक कì स´याओं को िलखना और इनके सीधे व उलटे øम को समझना','1 से 9 तक की संख्याओं को लिखना और इनके सीधे व उलटे क्रम को समझना'],
 ['रेखाओं के माध्यम से आकतियों को बनाकर समझना ृ','रेखाओं के माध्यम से आकृतियों को बनाकर समझना']
]);
// Display repairs source-compared against g1-p031/g1-p047/g2-p046/g2-p066.
// Raw catalogue wording and original page images remain unchanged.
export function displayText(value){const text=String(value??'');return(textRepairs.get(text)||text).replaceAll('चिfÊत','चिह्नित').replaceAll('चिÊ','चिह्न').replaceAll('संख्याआंे','संख्याओं');}
export const lessonTitle=lesson=>displayText(lesson.title);
export function lessonSummary(lesson,lang='hi'){
 if(lesson.structure==='weekly-template')return displayText(lesson.summary);
 const materials=(lesson.materials||[]).map(displayText).join(' · ');
 const resources=lesson.worksheets?.length?(lang==='en'?'Worksheet page ':'कार्यपत्रक पृष्ठ ')+lesson.worksheets.map(w=>w.page).join(', '):(lang==='en'?'Notebook practice':'कॉपी में अभ्यास');
 return (materials?(lang==='en'?'Materials: ':'सामग्री: ')+materials+' · ':'')+resources;
}
export function resourcePageInfo(resources,kind,grade,image,index=0){const doc=resources?.[kind]?.[grade],printed=doc?.printedPages?.[image];const pdf=doc?.pages.indexOf(image);return {printed:printed??null,pdf:pdf>=0?pdf+1:index+1};}
export const resourceKindsFor=(resources,grade)=>['guide','workbook','textbook'].filter(kind=>resources?.[kind]?.[grade]?.pages?.length);
export function resourceOutput(reader,lesson){return reader?{image:reader.pages[reader.page],kind:reader.kind,grade:reader.grade}:{image:lesson.source.image,kind:'guide',grade:lesson.grade};}

export function readerHistoryAction(historyState,reader,isOpen){if(reader?.historyToken!=null&&historyState?.reader===reader.historyToken)return isOpen?'none':'open';return isOpen?'close':'none';}

export function notesExportText(pack,notes,lang='hi'){
 const hi=lang!=='en',entries=Object.entries(notes||{}).filter(([,value])=>typeof value==='string'&&value.trim());
 return [hi?'मेरे शिक्षण नोट':'My teaching notes',pack.label?.[lang]||pack.id,'',...entries.map(([id,note])=>{const l=pack.lessons.find(l=>l.id===id);return [l?`${gradeLabel(pack,l.grade,lang)} · ${hi?'सप्ताह':'Week'} ${l.week} · ${hi?'दिन':'Day'} ${l.day}`:id,l?lessonTitle(l):'',note,'--------------------'].filter(Boolean).join('\n');}),entries.length?'':hi?'अभी कोई नोट नहीं है।':'No notes yet.'].join('\n\n');
}
