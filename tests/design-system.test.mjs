// Design system guard (docs/DESIGN_SYSTEM.md). Every presentation value comes from the tokens in
// dist/styles.css :root. A failure means a rule or a view hard-coded a value: add or reuse a token instead.
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const read=f=>fs.readFileSync(new URL(`../dist/${f}`,import.meta.url),'utf8');
const sheets={'styles.css':read('styles.css'),'guide-cards.css':read('guide-cards.css')};
const rules=css=>css.replace(/:root \{[\s\S]*?\n\}/,'').replace(/@font-face \{[\s\S]*?\}/g,'').replace(/\/\*[\s\S]*?\*\//g,'');
const tokens=Object.fromEntries([...sheets['styles.css'].match(/:root \{([\s\S]*?)\n\}/)[1].matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)].map(m=>[m[1],m[2].trim()]));
test('stylesheets are readable source, not minified',()=>{for(const [f,css] of Object.entries(sheets)){const long=css.split('\n').filter(l=>l.length>240);assert.deepEqual(long,[],`${f} has minified lines`);}});
test('rules use colour, type-size and radius tokens only',()=>{for(const [f,css] of Object.entries(sheets)){const body=rules(css);
 assert.deepEqual(body.match(/#[0-9a-fA-F]{3,8}\b/g)||[],[],`${f}: raw hex colour outside :root`);
 assert.deepEqual(body.match(/\brgba?\(|\bhsla?\(/g)||[],[],`${f}: raw rgb/hsl colour outside :root`);
 assert.deepEqual(body.match(/font-size:[^;]*\d+px/g)||[],[],`${f}: px font size outside :root`);
 assert.deepEqual(body.match(/border-radius:[^;]*\b\d+px/g)||[],[],`${f}: px radius outside :root`);}});
test('every var() used by a stylesheet is defined',()=>{const used=new Set();for(const css of Object.values(sheets))for(const m of css.matchAll(/var\((--[a-z0-9-]+)/g))used.add(m[1]);const runtime=new Set(['--app-header-height','--context-height','--section-nav-height','--reading-scale','--guide-tint','--guide-accent']);const missing=[...used].filter(v=>!(v in tokens)&&!runtime.has(v)&&!/--guide-/.test(v));assert.deepEqual(missing,[]);});
test('type scale keeps a 13px floor and touch targets stay at 48px',()=>{for(const k of ['--fs-1','--fs-2','--fs-3','--fs-4','--fs-5','--fs-6'])assert.ok(parseFloat(tokens[k])>=13,k);assert.equal(tokens['--touch-min'],'48px');});
test('views do not inline presentation styles',()=>{for(const f of ['app.mjs','views/today.mjs','views/smart-card.mjs','views/program-guide.mjs','views/current-context.mjs']){const src=read(f);assert.deepEqual(src.match(/style="[^"]*(?:#[0-9a-f]{3,6}|\d+px)/gi)||[],[],f);}});
test('self-hosted fonts exist and are precached for offline use',()=>{const sw=read('sw.js');for(const f of ['fonts/noto-sans-devanagari.woff2','fonts/noto-sans-latin.woff2']){assert.ok(fs.existsSync(new URL(`../dist/${f}`,import.meta.url)),f);assert.ok(sw.includes(f),`sw.js precaches ${f}`);}});
