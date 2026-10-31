// Original page artwork is displayed through a CSS viewport. No source pixels,
// numerals or speech bubbles are redrawn, and originals stay available in full.
export function validRect(rect){return Array.isArray(rect)&&rect.length===4&&rect.every(Number.isFinite)&&rect[0]>=0&&rect[1]>=0&&rect[2]<=1&&rect[3]<=1&&rect[0]<rect[2]&&rect[1]<rect[3];}
export function cropGeometry(rect,width,height){
 if(!validRect(rect)||!Number.isFinite(width)||!Number.isFinite(height)||!(width>0&&height>0))return null;
 const [x,y,right,bottom]=rect,dx=right-x,dy=bottom-y;
 return {aspect:width*dx/(height*dy),width:100/dx,height:100/dy,left:-100*x/dx,top:-100*y/dy};
}
export function phaseVisual(lesson,phase,style={}){
 const override=style.overrides?.[lesson.id]?.[phase.id];
 if(override===false)return null;
 let rect=override?.rect,image=override?.image||phase.image||lesson.source.image,kind=override?.kind||'illustration',shared=false;
 const profile=style.layouts?.[lesson.grade];
 if(!rect&&profile==='up-12'&&['i-do','we-do','you-do'].includes(phase.id)){
  const r=phase.sourceRect;if(validRect(r))rect=[.072,r[1]+.018,.342,r[3]-.01];
 }
 if(!rect&&profile==='up-3'&&['conversation','i-do','we-do','you-do'].includes(phase.id)){
  const reference=phase.id==='we-do'?lesson.phases.find(p=>p.id==='i-do'):phase;
  const r=reference?.sourceRect;
  if(validRect(r)){rect=[.072,r[1]+.025,.347,r[3]-.012];image=reference.image;shared=phase.id==='we-do';}
 }
 // A pack may mark the step that uses the workbook (phase.worksheetPreview) when its id is source-native.
 if(!rect&&(phase.id==='practice'||phase.worksheetPreview)&&lesson.worksheets?.length){
  return {image:lesson.worksheets[0].image,kind:'worksheet',page:lesson.worksheets[0].page,rect:[0,0,1,1],width:1,height:1.34,provenance:'assigned-workbook'};
 }
 if(!rect&&profile&&phase.id==='support'&&validRect(phase.sourceRect)){
  const r=phase.sourceRect;
  if(profile==='up-3'){rect=[.072,r[1]+.018,.347,Math.min(.935,r[3]-.012)];}
  else{rect=[.665,r[1]+.018,.945,Math.min(.935,r[3]-.012)];kind='source-excerpt';}
 }
 if(!rect&&lesson.structure==='weekly-template'&&validRect(phase.sourceRect)){
  rect=phase.sourceRect;kind='source-excerpt';
 }
 // Other curricula may provide explicit reviewed illustration geometry. Never
 // borrow the UP page layout for a new state/subject by grade number alone.
 const width=override?.width||lesson.source.width,height=override?.height||lesson.source.height;
 if(!rect||!validRect(rect)||!(width>0&&height>0))return null;
 return {image,rect,width,height,kind,shared,
  alt:override?.alt,provenance:override?'source-compared':'source-layout'};
}
export function lessonPalette(lesson,style={}){
 const colors={...(style.palette||{}),...(style.gradePalettes?.[lesson.grade]||{})};
 if(lesson.structure==='weekly-template'){const weekly={...style.weeklyPalette,...style.gradeWeeklyPalettes?.[lesson.grade]};if(weekly[lesson.day])colors.teaching=weekly[lesson.day];}
 return Object.fromEntries(Object.entries(colors).filter(([key,value])=>['blue','teaching','practice','support','question'].includes(key)&&/^#[\da-f]{6}$/i.test(value)));
}
export function lessonVisualAssets(lesson,style={}){
 return [...new Set([lesson.source.image,...lesson.phases.map(p=>phaseVisual(lesson,p,style)?.image),...(lesson.worksheets||[]).map(w=>w.image)].filter(Boolean))];
}
