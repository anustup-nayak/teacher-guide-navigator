// End-to-end journey sweep for Sandarshika (docs/DEVELOPMENT.md#e2e).
// Usage: python3 -m http.server 8765 --directory dist &  then  npm run test:e2e   (BASE=… to target another origin)
// Each journey follows one teacher archetype from docs/PRD.md §Personas (A–F). The matrix checks every top-level
// route at 320/360/390/1024px in Hindi and English for overflow, console errors, tiny text and small targets.
// This is an automated walkthrough: it proves the interface works, not that teachers understand it.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path');
const BASE=process.env.BASE||'http://localhost:8765/';
const ROOT=path.join(__dirname,'..','..');
const fails=[];let checks=0;
const ok=(cond,msg)=>{checks++;if(!cond){fails.push(msg);console.log('  ✗',msg);}};
const settle=p=>p.waitForTimeout(700);
async function fresh(b,opts={}){const ctx=await b.newContext({viewport:{width:360,height:740},serviceWorkers:'block',...opts});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/favicon/.test(m.text()))errs.push(m.text());});return {ctx,p,errs};}
const go=async(p,h,lang='hi')=>{const u=new URL(BASE);u.searchParams.set('ui',lang);u.hash=h;await p.goto(u.href);await p.waitForSelector('#startup-loading',{state:'hidden'}).catch(()=>{});await settle(p);};
const hash=p=>p.evaluate(()=>location.hash);

async function matrix(b){
  console.log('Matrix: routes × widths × languages');
  const routes=['#/today','#/guide','#/guide/week','#/guide/periods','#/guide/pages','#/guide/goals','#/find','#/saved','#/help','#/','#/unknown','#/lesson/g1-math-w09-d01','#/lesson/g2-math-w14-d01','#/lesson/g3-math-w21-d02','#/lesson/g1-hindi-w14-d01','#/lesson/g2-hindi-w17-d04','#/lesson/g3-hindi-w23-d06','#/lesson/g2-math-w14-d04','#/lesson/g1-math-w09-d01/teach/2'];
  for(const w of [320,360,390,1024])for(const lang of ['hi','en']){
    const {ctx,p,errs}=await fresh(b,{viewport:{width:w,height:800}});
    await go(p,'#/today',lang);
    for(const r of routes){await go(p,r,lang);
      const s=await p.evaluate(()=>{const vis=e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&getComputedStyle(e).visibility!=='hidden';};
        return {over:document.documentElement.scrollWidth-innerWidth,text:document.querySelector('main').innerText.trim().length,
          tiny:[...document.querySelectorAll('body *')].filter(e=>vis(e)&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&parseFloat(getComputedStyle(e).fontSize)<13&&!e.closest('.source-crop,svg,#print-root')).map(e=>e.textContent.trim().slice(0,20)).slice(0,3),
          small:[...document.querySelectorAll('.header-inner nav a,.button,.card-line,.card-band,.list-row,.link-chip,.section-chip,#grade,#subject,.today-day')].filter(e=>vis(e)&&e.getBoundingClientRect().height<40).map(e=>e.className||e.id).slice(0,3)};});
      ok(s.over<=1,`${w}/${lang} ${r}: horizontal overflow ${s.over}px`);
      ok(s.text>30,`${w}/${lang} ${r}: empty main`);
      ok(!s.tiny.length,`${w}/${lang} ${r}: text under 13px: ${s.tiny}`);
      ok(!s.small.length,`${w}/${lang} ${r}: touch target under 40px: ${s.small}`);}
    ok(!errs.length,`${w}/${lang}: console errors ${[...new Set(errs)].slice(0,2)}`);await ctx.close();}
}

async function journeys(b){
  console.log('A · Compliance checker: today → lesson → workbook → mark taught → undo');
  {const {ctx,p,errs}=await fresh(b);await go(p,'#/today');
   const open=await p.$('.today-next a[href^="#/lesson/"]');ok(!!open,'A: today shows the next lesson');await open.click();await settle(p);
   ok(/#\/lesson\//.test(await hash(p)),'A: opening the next lesson lands on the lesson');ok(!!await p.$('.smart-card'),'A: lesson opens on its smart card');
   const done=await p.$('[data-complete]');ok(!!done,'A: mark-taught action exists');await done.scrollIntoViewIfNeeded();await done.click();await settle(p);
   const undo=await p.$('[data-undo]');ok(!!undo,'A: undo appears after marking taught');if(undo){await undo.click();await settle(p);ok(!!await p.$('[data-complete]'),'A: undo restores the mark-taught action');}
   ok(!errs.length,'A: no console errors');await ctx.close();}

  console.log('B · Textbook loyalist: all lessons → search → lesson → workbook page → close with Escape');
  {const {ctx,p,errs}=await fresh(b);await go(p,'#/find');
   ok(await p.isVisible('#query'),'B: search field is visible without opening anything');await p.fill('#query','जोड़');await settle(p);
   const hit=await p.$('main a[href^="#/lesson/"]');ok(!!hit,'B: search returns lessons');await hit.click();await settle(p);
   const sheet=await p.$('[data-sheet]');ok(!!sheet,'B: lesson offers its page or picture');await sheet.click();await settle(p);
   ok(await p.evaluate(()=>document.querySelector('#reader').open),'B: reader opens');await p.waitForFunction(()=>{const i=document.querySelector('#reader img');return i?.complete&&i.naturalWidth>0;});ok(await p.$eval('#reader img',i=>i.naturalWidth>0),'B: workbook image actually loaded');await p.keyboard.press('Escape');await settle(p);
   ok(!await p.evaluate(()=>document.querySelector('#reader').open),'B: Escape closes the reader');ok(/#\/lesson\//.test(await hash(p)),'B: still on the lesson after closing');
   ok(!errs.length,'B: no console errors');await ctx.close();}

  console.log('C · Willing novice: card line → that step → start → back to the card; next lesson in order');
  {const {ctx,p,errs}=await fresh(b);await go(p,'#/lesson/g2-math-w14-d01');
   await p.click('.smart-card .card-line >> nth=1');await settle(p);ok(/teach\/[1-9]/.test(await hash(p)),'C: a card line opens its step');
   await go(p,'#/lesson/g2-math-w14-d01');await p.click('.card-start');await settle(p);ok(/teach\/0/.test(await hash(p)),'C: start opens step 1');
   const next=await p.$('.card-chain .card-next');ok(!!next,'C: card names the next lesson');await next.click();await settle(p);
   ok((await hash(p)).includes('g2-math-w14-d02'),'C: next lesson is the next in the guide’s order');
   await p.goBack();await settle(p);ok((await hash(p)).includes('g2-math-w14-d01'),'C: browser Back returns to the previous lesson');
   ok(!errs.length,'C: no console errors');await ctx.close();}

  console.log('D · Practised adapter: whole year → goal → lesson; week view → day → lesson');
  {const {ctx,p,errs}=await fresh(b);await go(p,'#/guide/goals');
   const goal=await p.$('main a[href^="#/guide/goal/"]');ok(!!goal,'D: goals list links to a goal');await goal.click();await settle(p);
   const les=await p.$('main a[href^="#/lesson/"]');ok(!!les,'D: goal lists its lessons');await les.click();await settle(p);ok(/#\/lesson\//.test(await hash(p)),'D: goal → lesson');
   await go(p,'#/guide/week');const day=await p.$('main a[href^="#/lesson/"]');ok(!!day,'D: week view links days to lessons');await day.click();await settle(p);ok(/#\/lesson\//.test(await hash(p)),'D: week day actually opens lesson');
   ok(!errs.length,'D: no console errors');await ctx.close();}

  console.log('E · Multigrade juggler: switch grade and subject, then come back');
  {const {ctx,p,errs}=await fresh(b);await go(p,'#/today');
   ok(await p.isVisible('.site-header #grade')&&await p.isVisible('.site-header #subject'),'E: grade/subject selects visible in header without an opening action');
   ok(!await p.$('#ui-language'),'E: no public language dropdown');
   await p.selectOption('#grade','3');await settle(p);ok(await p.inputValue('#grade')==='3','E: selected grade is 3');
   await p.selectOption('#subject','hindi');await settle(p);
   ok(await p.inputValue('#subject')==='hindi'&&new URL(p.url()).searchParams.get('curriculum')==='up-hindi-2026','E: selected subject and curriculum are Hindi');
   await go(p,'#/today');ok(!!await p.$('.today-next a[href*="g3-"]'),'E: today follows the chosen grade');
   ok(!errs.length,'E: no console errors');await ctx.close();}

  console.log('F · Mentor: deep links, legacy links, missing lesson recovery');
  {const {ctx,p,errs}=await fresh(b);
   for(const [h,want] of [['#/lesson/g1-math-w09-d01/teach/2','g1-math-w09-d01'],['#/','#/'],['#/unknown','unknown']]){await go(p,h);ok((await p.$('main h1'))!==null,`F: ${h} renders a page`);}
   await go(p,'#/lesson/does-not-exist');ok(!!await p.$('main a[href^="#/find"],main a[href^="#/"]'),'F: missing lesson offers a way back');
   ok(!errs.length,'F: no console errors');await ctx.close();}

  console.log('Keyboard and titles');
  {const {ctx,p}=await fresh(b);await go(p,'#/today');await p.keyboard.press('Tab');
   ok(await p.evaluate(()=>document.activeElement.classList.contains('skip-link')),'first Tab reaches the skip link');
   ok(/आज/.test(await p.title()),'today’s document title names the screen');await p.focus('.brand');await p.keyboard.press('Tab');ok(await p.evaluate(()=>document.activeElement.id==='grade'),'keyboard order: brand → grade');await p.keyboard.press('Tab');ok(await p.evaluate(()=>document.activeElement.id==='subject'),'keyboard order: grade → subject');
   await go(p,'#/lesson/g2-math-w14-d01');await p.focus('.card-start');await p.keyboard.press('Enter');await settle(p);ok(/teach\/0/.test(await hash(p)),'Enter on start opens step 1');
   await ctx.close();}
}

async function reading(b){
  console.log('Reading size: essential Math and Hindi summaries enlarge and persist');
  for(const id of ['g2-math-w14-d01','g1-hindi-w09-d01']){
    const {ctx,p}=await fresh(b,{viewport:{width:320,height:800}});await go(p,'#/lesson/'+id);await p.click('.lesson-options summary');
    const size=()=>p.$eval('.smart-card .card-text',e=>parseFloat(getComputedStyle(e).fontSize));const before=await size();await p.selectOption('#reading-size','2');
    ok(Math.abs((await size())-2*before)<.1,`${id}: summary doubles at 200%`);
    ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${id}: 200% text fits 320px`);
    await p.reload();await p.waitForSelector('.smart-card');ok(Math.abs((await size())-2*before)<.1,`${id}: reading preference survives reload`);await ctx.close();
  }
}

async function cards(b){
  const {displayText}=await import('../../dist/ux.mjs');
  console.log('Every approved smart card renders with its lines');
  const list=[];for(const pk of ['up-math-2026','up-hindi-2026'])for(const g of [1,2,3]){const f=path.join(ROOT,'curricula',pk,'model','cards',`g${g}.json`);if(fs.existsSync(f))for(const c of JSON.parse(fs.readFileSync(f)).cards)list.push([c.lesson,displayText(c.title),c.lines.map(l=>displayText(l.text)),!!c.image]);}
  const {ctx,p,errs}=await fresh(b,{viewport:{width:390,height:800}});await go(p,'#/today');let n=0;
  for(const [id,title,texts,image] of list){await p.evaluate(h=>location.hash=h,'#/lesson/'+id);
    try{await p.waitForFunction(([id,title,texts,image])=>{const c=document.querySelector('.smart-card');const norm=x=>x.normalize('NFC').replace(/\s+/g,' ').trim();return c?.dataset.lessonId===id&&(!image||c.querySelectorAll('img').length>0)&&norm(c.querySelector('h1')?.textContent||'')===norm(title)&&JSON.stringify([...c.querySelectorAll('.card-text')].map(e=>norm(e.textContent)))===JSON.stringify(texts.map(norm));},[id,title,texts,image],{timeout:6000});
      await p.waitForFunction(()=>[...document.querySelectorAll('.smart-card img')].every(i=>i.complete&&i.naturalWidth>0),null,{timeout:10000});n++;
    }catch{ok(false,`card ${id} wrong rendered identity/title/text or missing image`);}}
  ok(n===list.length,`all ${list.length} cards render their own identity, title, text and image`);console.log(`  ${n}/${list.length} cards`);ok(!errs.length,'cards: no console errors');await ctx.close();
}

async function offline(b){
  console.log('Offline: shell, fonts and a visited lesson survive going offline');
  const ctx=await b.newContext({viewport:{width:390,height:800}});const p=await ctx.newPage();
  await p.goto(BASE+'#/lesson/g3-hindi-w19-d04');await p.waitForSelector('.smart-card');await p.evaluate(()=>navigator.serviceWorker.ready);await p.waitForTimeout(3000);await p.reload();await p.waitForTimeout(1500);
  await ctx.setOffline(true);await p.goto(BASE+'#/lesson/g3-hindi-w19-d04');await p.waitForTimeout(2500);
  ok(!!await p.$('.smart-card'),'offline: lesson card available');
  ok(await p.evaluate(()=>document.fonts.check('17px "Noto Sans Devanagari"','आज')),'offline: Devanagari font loaded');
  await ctx.close();
}

(async()=>{const b=await chromium.launch();
  try{await matrix(b);await journeys(b);await reading(b);await cards(b);await offline(b);}finally{await b.close();}
  console.log(`\n${checks} checks, ${fails.length} failures`);process.exit(fails.length?1:0);})();
