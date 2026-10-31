// Shared section identities for chips, scroll tracking and legacy phase URLs.
export function lessonSections(lesson){
 return [
  {id:'lesson-preparation',kind:'preparation'},
  ...lesson.phases.map((phase,index)=>({id:`lesson-phase-${index}`,kind:'phase',index,phase})),
  {id:'lesson-notes',kind:'notes'},
  {id:'lesson-references',kind:'references'}
 ];
}
export function sectionAtOffset(sections,offset){
 // positions are document ordered; the last heading above the reading edge wins.
 let active=sections[0];
 for(const section of sections){if(section.top>offset)break;active=section;}
 return active?.id;
}

// A pending hash navigation must win over scroll tracking from the old screen.
export function canTrackLesson(rendered,current){return rendered.screen==='lesson'&&current.screen==='lesson'&&rendered.id===current.id&&rendered.view===current.view&&rendered.step===current.step;}
