// Product-neutral, dependency-free queries. Caller loads release JSON; no I/O, DOM or globals.
const approved=new Set(['reviewed','owner-approved']);
const normal=s=>String(s??'').normalize('NFC').toLocaleLowerCase('hi').replace(/[०-९]/g,c=>String(c.charCodeAt(0)-0x966));
export function createContentQuery(release,{includeUnreviewedLinks=false}={}){
  const data=JSON.parse(JSON.stringify(release)),entities=data.entities||{},graph=data.graph||[],index=new Map();
  const visible=p=>p?.assertion==='stated'||approved.has(p?.review);
  const visibleLink=l=>includeUnreviewedLinks||visible(l);
  function project(v){
    if(!v||typeof v!=='object')return v;
    if(typeof v.from==='string'&&typeof v.to==='string'&&typeof v.relation==='string'&&!visibleLink(v))return undefined;
    if(Array.isArray(v))return v.map(project).filter(x=>x!==undefined);
    const out={};for(const [key,value]of Object.entries(v)){
      // Legacy guide drafts mixed stated sourceText with explicitly editorial summaries.
      if(['summary','classroomActions'].includes(key)&&!approved.has(v.provenance?.review))continue;
      const clean=project(value);if(clean!==undefined)out[key]=clean;
    }return out;
  }
  for(const [kind,list]of Object.entries(entities))for(const value of list){const key=`${kind}:${value.id}`;if(index.has(key))throw Error(`Duplicate entity ${key}`);index.set(key,value);}
  const get=key=>{const value=index.get(key);return value&&visible(value.provenance)?project(value):null;};
  const links=(from,relation)=>graph.filter(e=>e.from===from&&(!relation||e.relation===relation)&&visibleLink(e)).map(project);
  const lessons=()=>entities.lesson||[];
  const targetLessons=keys=>lessons().filter(l=>keys.has(`lesson:${l.id}`)).map(l=>get(`lesson:${l.id}`)).filter(Boolean);
  const nodesForWeek=(grade,week,only=null)=>new Set(lessons().filter(l=>l.grade===grade&&l.week===week&&(!only||only.has(l.id))).flatMap(l=>[`lesson:${l.id}`,...l.periods.flatMap(p=>p.steps.map(s=>`step:${l.id}/${s.id}`))]));
  const entity=(kind,id)=>get(`${kind}:${id}`);
  function lessonsForOutcome(code){
    const outcomes=new Set((entities.lo||[]).filter(o=>o.id===code||o.code===code).map(o=>`lo:${o.id}`));
    // Follow approved crosswalks only; a proposed guide/workbook match must not leak.
    let changed=true;while(changed){changed=false;for(const e of graph.filter(e=>e.relation==='equivalent'&&visibleLink(e))){if(outcomes.has(e.to)&&!outcomes.has(e.from)){outcomes.add(e.from);changed=true;}if(outcomes.has(e.from)&&!outcomes.has(e.to)){outcomes.add(e.to);changed=true;}}}
    const matched=new Set();for(const e of graph)if(outcomes.has(e.to)&&visibleLink(e)){
      if(e.from.startsWith('lesson:'))matched.add(e.from);
      if(e.from.startsWith('step:'))matched.add(`lesson:${e.from.slice(5).split('/')[0]}`);
    }return targetLessons(matched);
  }
  function assessmentFor(grade,week,only=null){
    const scope=nodesForWeek(grade,week,only),ids=new Set(graph.filter(e=>scope.has(e.from)&&e.to.startsWith('assessment:')&&visibleLink(e)).map(e=>e.to));
    return [...ids].map(get).filter(Boolean);
  }
  function stepsByRoutine(id){const ids=new Set(graph.filter(e=>e.to===`routine:${id}`&&e.from.startsWith('step:')&&visibleLink(e)).map(e=>e.from));return [...ids].map(get).filter(Boolean);}
  function remediationFor(grade,week,outcome){
    const allowed=outcome?new Set(lessonsForOutcome(outcome).map(l=>l.id)):null;
    const steps=(entities.step||[]).filter(s=>{const l=index.get(`lesson:${s.lesson}`);return l?.grade===grade&&l.week===week&&(!allowed||allowed.has(l.id))&&links(`step:${s.id}`,'routine').some(e=>index.get(e.to)?.type==='remediation');}).map(s=>get(`step:${s.id}`)).filter(Boolean);
    const assessments=assessmentFor(grade,week,allowed);return {assessments,groups:assessments.flatMap(a=>a.groups||[]),steps};
  }
  function search(text,{grade,kind,week,limit=50}={}){
    const q=normal(text).trim();if(!q)return [];
    const hits=[];for(const [key,value]of index){
      if(kind&&key.split(':')[0]!==kind||grade!=null&&value.grade!==grade&&!value.grades?.includes(grade)||week!=null&&value.week!==week)continue;
      const node=get(key);if(!node)continue;
      // Search content, never internal IDs, source filenames, provenance notes or legacy state.
      const body=[node.title,node.name,node.statement,...(node.sourceText||[]),...(node.actions||[]),...(node.instructions||[]),...(node.questions||[]),...(node.periods||[]).filter(p=>p&&Array.isArray(p.steps)).flatMap(p=>p.steps.flatMap(s=>[s.title,...(s.actions||[]),...(s.instructions||[]),...(s.questions||[])]))].flat().filter(x=>typeof x==='string').join(' ');
      if(normal(body).includes(q))hits.push({key,entity:node});
    }return hits.slice(0,Math.max(0,Math.min(1000,limit)));
  }
  function cite(key){
    const node=index.get(key.includes(':')?key:`lesson:${key}`);if(!node)return [];
    const refs=[...(node.source?[node.source]:[]),...(node.provenance?.sources||[])];
    return [...new Map(refs.map(s=>[JSON.stringify(s),s])).values()].map(s=>({doc:s.doc,pdf:s.pdf,printed:s.printed??null,...(s.rect?{rect:[...s.rect]}:{}),image:(entities.resource||[]).concat(entities.workbook||[]).find(a=>a.source.doc===s.doc&&a.source.pdf===s.pdf)?.image||null}));
  }
  return Object.freeze({pack:data.manifest?.pack,version:data.manifest?.version,programStructure:()=>({references:project(data.manifest?.programStructure||null),structure:project(data.structure||null),understanding:project(data.understanding||null)}),entity,links,lesson:id=>entity('lesson',id),day:(grade,week,day)=>{const l=lessons().find(l=>l.grade===grade&&l.week===week&&l.day===day);return l?entity('lesson',l.id):null;},dayType:value=>{const l=typeof value==='string'?index.get(`lesson:${value}`):value;return l?entity('daytype',l.dayType):null;},routine:id=>entity('routine',id),stepsByRoutine,lessonsForOutcome,assessmentFor,remediationFor,passages:id=>(entities.passage||[]).filter(p=>p.section===id).sort((a,b)=>a.order-b.order).map(p=>entity('passage',p.id)).filter(Boolean),search,cite});
}
