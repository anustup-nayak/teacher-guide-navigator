// Coordinate authored runtime versions and derive the shell from actual imports.
// Does not alter reviewed catalogs, source pixels, storage identities or deploy.
import fs from 'node:fs';
import path from 'node:path';
const version=process.argv[2];if(!/^r\d+$/.test(version||''))throw Error('Usage: node scripts/release_assets.mjs rNN');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
for(const file of walk('dist').filter(f=>(f.endsWith('.mjs')&&!f.endsWith('/catalog.mjs'))||['dist/index.html','dist/sw.js'].includes(f))){
 let source=fs.readFileSync(file,'utf8').replace(/\bv=r\d+/g,'v='+version).replace(/-r\d+(?=['"])/g,'-'+version);
 if(file.endsWith('.mjs')&&!file.endsWith('/catalog.mjs'))source=source.replace(/((?:from\s*|import\s*\(?\s*)['"])(\.\.?\/[^'"?]+\.mjs)(?:\?[^'"]*)?(['"])/g,`$1$2?v=${version}$3`);
 fs.writeFileSync(file,source);
}
const root=new URL('../dist/',import.meta.url),assets=new Set(['./','index.html','asset-manifest.json']),visited=new Set();
function visit(asset){if(visited.has(asset))return;visited.add(asset);assets.add(asset);assets.add(asset.split('?')[0]);if(!asset.split('?')[0].endsWith('.mjs'))return;const source=fs.readFileSync(new URL(asset.split('?')[0],root),'utf8');for(const match of source.matchAll(/(?:from\s*|import\s*\(?\s*)['"](\.\.?\/[^'"]+)['"]/g)){const url=new URL(match[1],new URL(asset,root));visit(url.pathname.slice(root.pathname.length)+url.search);}}
const html=fs.readFileSync('dist/index.html','utf8');for(const match of html.matchAll(/(?:href|src)="([^"#]+\.(?:mjs|css)(?:\?[^\"]*)?)"/g))visit(match[1]);
// Stylesheet dependencies (self-hosted fonts, images) are part of the offline shell too.
for(const css of ['styles.css','guide-cards.css'])for(const match of fs.readFileSync(`dist/${css}`,'utf8').matchAll(/url\("?([^")#]+)"?\)/g))if(!match[1].startsWith('data:'))assets.add(match[1]);
const {CURRICULA}=await import(new URL('curricula.mjs',root));
const appVersion=fs.readFileSync('dist/app.mjs','utf8').match(/VERSION='([^']+)'/)[1];
for(const pack of CURRICULA){assets.add(pack.resources);assets.add(pack.resources+(pack.resources.includes('?')?'&':'?')+'v='+encodeURIComponent(appVersion));assets.add(pack.worksheets);}
const worker=fs.readFileSync('dist/sw.js','utf8').replace(/const SHELL=\[[^;]+;/,'const SHELL='+JSON.stringify([...assets])+';');fs.writeFileSync('dist/sw.js',worker);
console.log(`${version}: coordinated entry/module versions and ${assets.size} shell URLs; no deployment`);
