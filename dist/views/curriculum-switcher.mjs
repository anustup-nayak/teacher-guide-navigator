import {curriculumGroups,groupKey,levelsInGroup,subjectsAtLevel,gradeLabel} from '../domain/selection.mjs?v=r63';
export function renderCurriculumSwitcher({packs,pack,grade,lang,e,options}){
 const t=(hi,en)=>lang==='en'?en:hi,group=groupKey(pack),groups=curriculumGroups(packs);
 return `<div class="curriculum-switcher-inner">${groups.length>1?`<label for="curriculum-group">${t('राज्य / सत्र','State / edition')}<select id="curriculum-group">${options(groups.map(g=>[g.id,g.stateLabel+' · '+g.academicYear]),group)}</select></label>`:`<span class="curriculum-group-name">${e(pack.stateLabel)} · ${e(pack.academicYear)}</span>`}<label for="grade">${t('कक्षा / स्तर','Grade / level')}<select id="grade">${options(levelsInGroup(packs,group).map(g=>[g,gradeLabel(pack,g,lang)]),grade)}</select></label><label for="subject">${t('विषय','Subject')}<select id="subject">${options(subjectsAtLevel(packs,group,grade).map(s=>[s.id,s.label[lang]]),pack.subject)}</select></label></div>`;
}
