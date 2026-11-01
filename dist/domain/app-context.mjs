import {selectCurriculum,gradesFor} from './curriculum.mjs?v=r70';
import {createStore} from '../core.mjs?v=r70';

export function browserStorage(){try{return globalThis.localStorage;}catch{return undefined;}}

// Independent pack context; no module-level mutable singleton or storage migration.
export function createAppContext({packs,search='',storage}){
 const params=new URLSearchParams(search),curriculum=selectCurriculum(packs,params.get('curriculum'));
 if(!curriculum)throw Error('No curriculum configured');
 const grades=gradesFor(curriculum),store=createStore(storage),KEY=curriculum.storageKey;
 const stored=store.get(KEY,{}),initial=stored&&typeof stored==='object'&&!Array.isArray(stored)?stored:{};
 const requestedGrade=params.has('grade')&&params.get('grade')!==''?Number(params.get('grade')):NaN;
 const selectedGrade=grades.includes(requestedGrade)?requestedGrade:grades.includes(initial.grade)?initial.grade:grades[0];
 const selectedLang=['hi','en'].includes(params.get('ui'))?params.get('ui'):initial.lang==='en'?'en':'hi';
 const defaultWeek=Math.min(...curriculum.lessons.filter(l=>l.grade===selectedGrade).map(l=>l.week));
 const prefs={readingScale:[1,1.25,1.5,2].includes(initial.readingScale)?initial.readingScale:1,lang:selectedLang,grade:selectedGrade,mode:initial.mode==='week'?'week':'topic',week:Number(initial.week)||defaultWeek,openTopic:initial.openTopic||'',query:'',searchOpen:false,locations:initial.locations&&typeof initial.locations==='object'&&!Array.isArray(initial.locations)?initial.locations:{},returnTo:['saved','today'].includes(initial.returnTo)?initial.returnTo:'find'};
 const readObj=k=>{const x=store.get(KEY+k,{});return x&&typeof x==='object'&&!Array.isArray(x)?x:{}};
 const persist=()=>{const current=store.get(KEY,{});const latest=current?.locations&&typeof current.locations==='object'&&!Array.isArray(current.locations)?current.locations:{};prefs.locations={...latest,[prefs.grade]:{week:prefs.week}};return store.set(KEY,prefs);};
 return {curriculum,grades,store,prefs,readObj,persist};
}
