import {phaseVisual,cropGeometry} from '../lesson-visuals.mjs?v=r69';
import {lessonTitle} from '../ux.mjs?v=r69';

export function createLessonMedia({curriculum,prefs,t,e,stage,list}){
function cropMarkup(visual,alt,id=''){
 const geometry=cropGeometry(visual.rect,visual.width,visual.height);if(!geometry)return '';
 const style=`width:${geometry.width}%;height:${geometry.height}%;left:${geometry.left}%;top:${geometry.top}%`;
 return `<span class="source-crop ${visual.kind==='worksheet'?'full-page':''}" style="aspect-ratio:${geometry.aspect}"><img ${id?`id="${id}"`:''} src="${e(visual.image)}" alt="${e(alt)}" style="${style}" loading="${id?'eager':'lazy'}" decoding="async"><span class="visual-image-error" hidden>${t('चित्र नहीं खुला · मूल पृष्ठ खोलें','Image unavailable · open original page')}</span></span>`;
}
function visualCaption(visual){return visual.kind==='worksheet'?t('कार्यपत्रक','Worksheet'):visual.kind==='source-excerpt'?t('मूल पृष्ठ का अंश','Original page excerpt'):visual.shared?t('मूल साझा चित्र','Shared source illustration'):t('मूल चित्र','Source illustration');}
function visualAlt(l,p,visual){return visual.alt?.[prefs.lang]||`${visualCaption(visual)} · ${stage(p)} · ${lessonTitle(l)}. ${t('गतिविधि और प्रश्न चित्र के साथ पाठ में दिए हैं। मूल पृष्ठ भी खोल सकते हैं।','Activity instructions and questions follow this image. The original page is also available.')}`;}
function phaseArtwork(l,p,n){const visual=phaseVisual(l,p,curriculum.visualStyle);if(!visual)return '';
 return `<figure class="phase-artwork ${visual.kind==='worksheet'?'worksheet-artwork':''}" data-provenance="${visual.provenance}"><button class="artwork-button" data-visual="${n}" aria-label="${e(t('चित्र बड़ा करें: ','Enlarge illustration: ')+stage(p))}">${cropMarkup(visual,visualAlt(l,p,visual))}<span class="artwork-caption">${t('चित्र बड़ा करें','Enlarge image')} <span aria-hidden="true">⤢</span></span></button></figure>`;
}
function worksheetView(l){const ws=l.worksheets||[];return ws.length?`<div class="worksheet-list">${ws.map(w=>`<article class="worksheet"><div><h3>${t('कार्यपुस्तिका','Workbook')} · ${t('पृष्ठ','page')} ${w.page}</h3><span class="small">${t('सप्ताह','Week')} ${w.week} · ${w.kind==='practice'?t('अभ्यास','Practice')+' '+w.day:w.kind==='assessment'?t('मैंने सीख लिया','Assessment'):t('पुनरावृत्ति','Review')}</span></div>${w.instructions?.length?list(w.instructions.slice(0,4)):''}<button class="button" data-sheet="${e(w.image)}">${t('कार्यपत्रक खोलें','Open worksheet')} ↗</button></article>`).join('')}</div>`:'';}


return {cropMarkup,visualCaption,visualAlt,phaseArtwork,worksheetView};
}
