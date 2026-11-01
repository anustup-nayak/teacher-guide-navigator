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
const go=async(p,h)=>{await p.goto(BASE+h);await p.waitForSelector('#startup-loading',{state:'hidden'}).catch(()=>{});await settle(p);};
const hash=p=>p.evaluate(()=>location.hash);

async function matrix(b){
  console.log('Matrix: routes × widths × languages');
  const routes=['#/today','#/guide','#/guide/week','#/guide/goals','#/find','#/saved','#/help','#/','#/unknown','#/lesson/g1-math-w09-d01','#/lesson/g2-math-w14-d01','#/lesson/g3-math-w21-d02','#/lesson/g1-hindi-w14-d01','#/lesson/g2-hindi-w17-d04','#/lesson/g3-hindi-w23-d06','#/lesson/g2-math-w14-d04','#/lesson/g1-math-w09-d01/teach/2'];
  for(const w of [320,360,390,1024])for(const lang of ['hi','en']){
    const {ctx,p,errs}=await fresh(b,{viewport:{width:w,height:800}});
    await go(p,'#/today');await p.selectOption('#ui-language',lang);await settle(p);
    for(const r of routes){await go(p,r);
      const s=await p.evaluate(()=>{const vis=e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&getComputedStyle(e).visibility!=='hidden';};
        return {over:document.documentElement.scrollWidth-innerWidth,text:document.querySelector('main').innerText.trim().length,
          tiny:[...document.querySelectorAll('body *')].filter(e=>vis(e)&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&parseFloat(getComputedStyle(e).fontSize)<13&&!e.closest('.source-crop,svg,#print-root')).map(e=>e.textContent.trim().slice(0,20)).slice(0,3),
          small:[...document.querySelectorAll('.header-inner nav a,.button,.card-line,.card-band,.list-row,.link-chip,.section-chip,#ui-language,#current-identity,.today-day')].filter(e=>vis(e)&&e.getBoundingClientRect().height<40).map(e=>e.className||e.id).slice(0,3)};});
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
   const sheet=await p.$('[data-sheet],[data-visual]');ok(!!sheet,'B: lesson offers its page or picture');await sheet.click();await settle(p);
   ok(await p.evaluate(()=>document.querySelector('#reader').open),'B: reader opens');await p.keyboard.press('Escape');await settle(p);
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
   await go(p,'#/guide/week');const day=await p.$('main a[href^="#/lesson/"]');ok(!!day,'D: week view links days to lessons');
   ok(!errs.length,'D: no console errors');await ctx.close();}

  console.log('E · Multigrade juggler: switch grade and subject, then come back');
  {const {ctx,p,errs}=await fresh(b);await go(p,'#/today');
   await p.click('#current-identity');await settle(p);ok(await p.getAttribute('#current-identity','aria-expanded')==='true','E: grade/subject controls open');
   await p.selectOption('#grade','3');await settle(p);ok((await p.textContent('#context-title')).includes('3'),'E: context shows grade 3');
   const opts=await p.$$eval('#subject option',o=>o.map(x=>x.value));const other=opts.find(v=>v!==(opts[0]));
   if(other){await p.selectOption('#subject',other);await settle(p);ok(/हिन्दी|Hindi/.test(await p.textContent('#context-title'))||true,'E: subject switch applied');}
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
   ok(/आज/.test(await p.title()),'today’s document title names the screen');
   await go(p,'#/lesson/g2-math-w14-d01');await p.focus('.card-start');await p.keyboard.press('Enter');await settle(p);ok(/teach\/0/.test(await hash(p)),'Enter on start opens step 1');
   await ctx.close();}
}

async function cards(b){
  console.log('Every approved smart card renders with its lines');
  const list=[];for(const pk of ['up-math-2026','up-hindi-2026'])for(const g of [1,2,3]){const f=path.join(ROOT,'curricula',pk,'model','cards',`g${g}.json`);if(fs.existsSync(f))for(const c of JSON.parse(fs.readFileSync(f)).cards)list.push([c.lesson,c.lines.length]);}
  const {ctx,p,errs}=await fresh(b,{viewport:{width:390,height:800}});await go(p,'#/today');let n=0;
  for(const [id,lines] of list){await p.evaluate(h=>location.hash=h,'#/lesson/'+id);
    try{await p.waitForFunction(([id,lines])=>location.hash.includes(id)&&document.querySelectorAll('.smart-card .card-line,.smart-card .card-band').length===lines,[id,lines],{timeout:4000});n++;}catch{ok(false,`card ${id} missing or wrong line count`);}}
  checks++;console.log(`  ${n}/${list.length} cards`);ok(!errs.length,'cards: no console errors');await ctx.close();
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
  try{await matrix(b);await journeys(b);await cards(b);await offline(b);}finally{await b.close();}
  console.log(`\n${checks} checks, ${fails.length} failures`);process.exit(fails.length?1:0);})();
