// Smart-card workbench (docs/SMART_CARDS.md). One tool for every agent, so drafting is split safely by file:
//   node scripts/content/cards.mjs scaffold <pack> <grade> [count]   add empty cards for the next N lessons without one
//   node scripts/content/cards.mjs source   <pack> <grade> [lessonId…] print each lesson's own steps (draft from this only)
//   node scripts/content/cards.mjs check    [<pack> [<grade>]]         rule checks; exits 1 on any error
//   node scripts/content/cards.mjs sheet    <pack> <grade>             write docs/review/cards/<pack>-g<grade>.md for the owner
//   node scripts/content/cards.mjs approve  <pack> <grade> <lessonId…|--checked> --by "<who, where, date>"
// Drafts live in curricula/<pack>/drafts/cards/g<grade>.json (not a compiler input, so CI stays green while agents draft).
// `approve` moves owner-approved cards into curricula/<pack>/model/cards/g<grade>.json; only the integrating agent then
// builds a new content release and publishes. Never edits lessons, releases or dist/.
import fs from 'node:fs';
import {CURRICULA} from '../../dist/curricula.mjs';
const ROOT = new URL('../../', import.meta.url);
const file = (pack, grade, area = 'drafts') => new URL(`curricula/${pack}/${area}/cards/g${grade}.json`, ROOT);
const load = (pack, grade, area = 'drafts') => fs.existsSync(file(pack, grade, area)) ? JSON.parse(fs.readFileSync(file(pack, grade, area), 'utf8')) : {pack, cards: []};
const save = (pack, grade, data, area = 'drafts') => { data.cards.sort((a, b) => a.lesson.localeCompare(b.lesson)); fs.mkdirSync(new URL(`curricula/${pack}/${area}/cards/`, ROOT), {recursive: true}); fs.writeFileSync(file(pack, grade, area), JSON.stringify(data, null, 1) + '\n'); };
const both = (pack, grade) => [...load(pack, grade, 'model').cards, ...load(pack, grade).cards];
const packOf = id => { const p = CURRICULA.find(c => c.id === id); if (!p) throw Error(`unknown pack ${id}; use ${CURRICULA.map(c => c.id).join(' or ')}`); return p; };
const teaching = (pack, grade) => packOf(pack).lessons.filter(l => l.grade === Number(grade) && l.structure !== 'weekly-template').sort((a, b) => a.week - b.week || a.day - b.day);
const lessonOf = (pack, id) => packOf(pack).lessons.find(l => l.id === id);
const TODO = 'TODO';
// Owner decisions: Math = "steps" (lines grouped I do / We do+You do / practice / support), Hindi = "periods".
const MATH_LABEL = {conversation: 'बातचीत', 'i-do': 'मैं करूँ', 'we-do': 'हम करें, फिर बच्चे करें', practice: 'कार्यपत्रक', support: 'खेल और सहायता'};
function skeleton(pack, l) {
  const prov = {assertion: 'editorial', review: 'unreviewed', note: 'Draft from the lesson’s own steps; awaiting owner approval.'};
  if (pack === 'up-math-2026') {
    const ids = l.phases.map(p => p.id), groups = [];
    for (const id of ids) { if (id === 'you-do' && groups.length && groups.at(-1)[0] === 'we-do') groups.at(-1).push(id); else groups.push([id]); }
    const mins = g => { const ps = g.map(id => l.phases.find(p => p.id === id)); return ps[0].id === 'practice' ? 'कालांश 2' : ps[0].id === 'support' ? 'कालांश 3' : `${ps.reduce((n, p) => n + (p.minutes || 0), 0)} मि`; };
    const label = g => g[0] === 'practice' && !(l.worksheets || []).length ? 'कॉपी में अभ्यास' : MATH_LABEL[g[0]] || l.phases.find(p => p.id === g[0]).title;
    return {lesson: l.id, layout: 'steps', title: l.shortTitle || l.title, image: {phase: ids.includes('i-do') ? 'i-do' : ids[0]}, lines: groups.map(g => ({phases: g, label: label(g), minutes: mins(g), text: TODO})), provenance: prov};
  }
  const periods = [1, 2, 3].map(n => l.phases.filter(p => String(p.id).startsWith(`p${n}-`))).filter(x => x.length);
  return {lesson: l.id, layout: 'periods', title: l.shortTitle || l.title, ...((l.worksheets || []).length ? {image: {worksheet: 0, rect: [0, 0, 1, 0.5]}} : {}),
    lines: periods.map((ps, i) => ({phases: ps.map(p => p.id), period: i + 1, label: `कालांश ${i + 1} · ${TODO}`, steps: ps.map(p => `${shortName(p.title)} ${p.minutes ?? ''}`.trim()).join(' · '), text: TODO})), provenance: prov};
}
const BROKEN = /(^|\s)[ािीुूृेैोौंँः़्]|[ािीुूृेैोौ][ंँ]?[ािीुूृेैोौ]|Z|ä|ऋ |\$\s*[a-z]/;
const fix = x => String(x).replace(/(\d)\s*\$\s*(\d)/g, '$1 + $2').replace(/\s+/g, ' ').trim();
const sentences = p => (p.actions || []).map(fix).filter(a => a && !/\?$/.test(a) && !/70\s*%/.test(a) && !/चिह्नित करें|पहचान करें|सक्रिय सहयोग/.test(a) && !BROKEN.test(a)).map(a => a.replace(/^कालांश गणित खेल एवं रिमीडियल कार्य\s*/, ''));
const key = p => { const xs = sentences(p); if (!xs.length) { const q = [...(p.questions || []), ...(p.actions || [])].map(fix).filter(a => /\?$/.test(a) && !BROKEN.test(a)); return q.length ? q.slice(0, 2).join(' ') : cleanTitle(p.title); } const first = xs[0]; return first.split(/\s+/).length < 7 && xs[1] ? `${first.replace(/[।.]$/, '')}; ${xs[1]}` : first; };
// prefer a whole short instruction (ends in an imperative/verb) over a clipped long one
const VERB_END = /(ें|एँ|ाएँ|ाएं|ओ|ाओ|िए|ेंगे|ेगा|ेगी|ता है|ती है|ते हैं|है|हैं|गा|गी|गे)[।.!]?$/;
const brief = (p, max) => {
  const parts = sentences(p).flatMap(a => a.split(/(?<=[।!])\s+|(?<=\.)\s+(?=\D)/)).map(a => a.trim().replace(/[।.]$/, '')).filter(Boolean);
  const ok = parts.find(a => { const n = a.split(/\s+/).length; return n >= Math.max(4, Math.floor(max * 0.55)) && n <= max && VERB_END.test(a) && ((a.match(/[‘“]/g) || []).length === (a.match(/[’”]/g) || []).length); });
  return ok || clip(key(p), max);
};
const DANGLING = new Set(['के','का','की','को','में','से','पर','और','एवं','या','तथा','जैसे-','जैसे','उनके','उनकी','उन्हें','हर','कुछ','एक','इस','उस','दिए','गए','गई','द्वारा','लिए','साथ','बच्चों','—','-','कि','जैसे,','जो','तो','यदि']);
const trimEnd = w => { while (w.length > 3 && (DANGLING.has(w[w.length - 1].replace(/[,;:।]$/, '')) || /[‘“(]$/.test(w[w.length - 1]))) w.pop(); return w; };
const clip = (x, max) => {
  let w = String(x).replace(/[।]\s*$/, '').split(/\s+/).filter(Boolean);
  if (w.length <= max) return w.join(' ');
  // cut at the last clause break inside the limit when it keeps at least half the words
  const cut = w.slice(0, max); let k = -1; cut.forEach((t, i) => { if (/[,;।]$/.test(t) && i >= max / 2 - 1) k = i; });
  let out = trimEnd(k >= 0 ? cut.slice(0, k + 1) : cut.slice()).join(' ').replace(/[,;:।]$/, '');
  if (out.split(/\s+/).length < 5) out = trimEnd(cut.slice()).join(' ').replace(/[,;:।]$/, '');
  const open = (out.match(/[‘“]/g) || []).length, close = (out.match(/[’”]/g) || []).length;
  if (open > close) { const q = Math.max(out.lastIndexOf('‘'), out.lastIndexOf('“')); const before = trimEnd(out.slice(0, q).trim().split(/\s+/)).join(' ').replace(/[,;:]$/, ''); out = before || out.replace(/[‘“’”]/g, ''); }
  return out;
};
const cleanTitle = t => String(t).replace(/\s*\(.*?\)\s*/g, ' ').replace(/^\s*(I do|We do|You do)\s*/, '').trim();
const shortTitle = l => clip(cleanTitle(l.shortTitle || l.title).replace(/को समझना$|को पहचानना$|करना$/, '').trim(), 8, '');
const shortName = s => String(s).split(/[ (]/).slice(0, 2).join(' ');
const sourceText = l => l.phases.map(p => [p.title, ...(p.actions || []), ...(p.questions || [])].join(' ')).join(' ') + ' ' + (l.worksheets || []).map(w => `पृष्ठ ${w.page}`).join(' ') + ' ' + [l.title, l.shortTitle, ...(l.materials || [])].join(' ');
const DEV = '०१२३४५६७८९';
const digits = s => String(s).replace(/[०-९]/g, d => DEV.indexOf(d));
const numbers = s => (digits(s).match(/\d+/g) || []);
const quoted = s => [...String(s).matchAll(/[“"‘']([^”"’']{2,40})[”"’']/g)].map(m => m[1].trim());
const words = s => String(s).trim().split(/\s+/).filter(w => w && !/^[→;·,–—-]$/.test(w)).length;
function checkCard(pack, c) {
  const errors = [], l = lessonOf(pack, c.lesson);
  if (!l) return [`${c.lesson}: no such lesson`];
  const src = digits(sourceText(l)), steps = new Set(l.phases.map(p => p.id)), used = new Set();
  if (c.layout !== (pack === 'up-math-2026' ? 'steps' : 'periods')) errors.push(`${c.lesson}: layout must be ${pack === 'up-math-2026' ? 'steps' : 'periods'} (owner decision)`);
  if (c.title.includes(TODO)) errors.push(`${c.lesson}: title TODO`);
  for (const [i, line] of c.lines.entries()) {
    const at = `${c.lesson} line ${i + 1}`;
    for (const ph of line.phases) { if (!steps.has(ph)) errors.push(`${at}: unknown step ${ph}`); if (used.has(ph)) errors.push(`${at}: step ${ph} twice`); used.add(ph); }
    if ([line.text, line.label].some(x => String(x).includes(TODO))) { errors.push(`${at}: still TODO`); continue; }
    const n = words(line.text); if (n < 6 || n > (c.layout === 'periods' ? 24 : 20)) errors.push(`${at}: ${n} words (aim 10–18; ${c.layout === 'periods' ? 24 : 20} max)`);
    for (const x of numbers(line.text)) if (!src.includes(x)) errors.push(`${at}: number ${x} is not in the lesson's own text`);
    for (const q of quoted(line.text)) { const core = q.replace(/[…\.]+$/, '').split(/\s+/).slice(0, 2).join(' '); if (!src.includes(digits(core))) errors.push(`${at}: quoted “${q}” not found in the lesson's own text`); }
  }
  const missing = [...steps].filter(s => !used.has(s));
  if (missing.length) errors.push(`${c.lesson}: steps not on any line: ${missing.join(', ')}`);
  if (c.image?.phase && !steps.has(c.image.phase)) errors.push(`${c.lesson}: image step ${c.image.phase} missing`);
  if (c.image?.worksheet != null && !(l.worksheets || [])[c.image.worksheet]) errors.push(`${c.lesson}: no worksheet ${c.image.worksheet}`);
  return errors;
}
const [cmd, pack, grade, ...rest] = process.argv.slice(2);
if (cmd === 'scaffold') {
  const data = load(pack, grade), have = new Set(both(pack, grade).map(c => c.lesson)), n = Number(rest[0] || 5);
  const add = teaching(pack, grade).filter(l => !have.has(l.id)).slice(0, n).map(l => skeleton(pack, l));
  data.cards.push(...add); save(pack, grade, data);
  console.log(`added ${add.length} skeleton cards to ${file(pack, grade).pathname.split('/teacher-guide-navigator/')[1] || file(pack, grade).pathname}: ${add.map(c => c.lesson).join(', ')}`);
} else if (cmd === 'draft') {
  // Extractive first draft: fills TODO lines only with the step's own sentences, trimmed. Adds no words of its own
  // beyond fixed connectors and the guide's 70% rule. Every draft still needs the owner's approval (§6, §8).
  const data = load(pack, grade); let n = 0;
  for (const c of data.cards) {
    if (!JSON.stringify(c).includes(TODO)) continue;
    const l = lessonOf(pack, c.lesson);
    if (c.title.includes(TODO) || c.title.split(/\s+/).length > 9) c.title = shortTitle(l);
    for (const line of c.lines) {
      const ps = line.phases.map(id => l.phases.find(p => p.id === id));
      if (pack === 'up-math-2026') {
        const id = ps[0].id;
        if (id === 'practice') line.text = (l.worksheets || []).length ? `पृष्ठ ${l.worksheets[0].page}; हर प्रश्न का एक उदाहरण पहले बोर्ड पर, फिर बच्चे स्वयं` : '‘बच्चे स्वयं करें’ के प्रश्न कॉपी में फिर; हर प्रश्न का एक उदाहरण पहले दिखाएँ';
        else if (id === 'support') { const all = (ps[0].actions || []).join(' '); line.text = brief(ps[0], 11) + (/70\s*%\s*से\s*कम/.test(all) ? '; 70% से कम हों तो ‘हम करें’ दोबारा' : /चिह्नित/.test(all) ? '; फिर चिह्नित बच्चों के साथ रिमीडियल' : ''); }
        else if (ps.length > 1) line.text = brief(ps[0], 10) + '; फिर ' + brief(ps[1], 8);
        else line.text = brief(ps[0], 18);
      } else {
        if (line.label.includes(TODO)) line.label = `कालांश ${line.period}`;
        line.steps = ps.map(p => `${clip(cleanTitle(p.title), 4)} ${p.minutes ?? ''}`.trim()).join(' · ');
        const per = ps.length > 2 ? 8 : 11;
        line.text = ps.map(p => brief(p, per)).join(' → ');
      }
      n++;
    }
  }
  save(pack, grade, data); console.log(`drafted ${n} lines in ${pack} grade ${grade}`);
} else if (cmd === 'source') {
  const ids = rest.length ? rest : load(pack, grade).cards.filter(c => JSON.stringify(c).includes(TODO)).map(c => c.lesson);
  for (const id of ids) { const l = lessonOf(pack, id); console.log(`\n##### ${l.id} · ${l.title}${l.priorKnowledge ? ` · पहले से: ${l.priorKnowledge}` : ''}`); for (const p of l.phases) console.log(`- ${p.id} [${p.minutes ?? ''}] ${p.title}: ${(p.actions || []).join(' | ')}`); if ((l.worksheets || []).length) console.log(`- worksheets: ${l.worksheets.map(w => 'पृष्ठ ' + w.page).join(', ')}`); }
} else if (cmd === 'check') {
  let total = 0, bad = 0;
  for (const p of pack ? [pack] : CURRICULA.map(c => c.id)) for (const g of grade ? [grade] : [1, 2, 3]) {
    for (const c of both(p, g)) { total++; const errs = checkCard(p, c); if (errs.length) { bad++; errs.forEach(x => console.log(`✗ ${p} ${x}`)); } }
  }
  console.log(`${total} cards checked, ${bad} with problems`); process.exit(bad ? 1 : 0);
} else if (cmd === 'sheet') {
  const data = {cards: both(pack, grade)}, out = [`# Smart cards for approval · ${pack} · Grade ${grade}`, '', `Generated by \`node scripts/content/cards.mjs sheet ${pack} ${grade}\`. Each card shows its lines and, under them, the lesson's own steps. Approve with \`approve\` (see docs/SMART_CARDS.md).`, '', '| Status | Count |', '|---|---|', `| owner-approved | ${data.cards.filter(c => c.provenance.review === 'owner-approved').length} |`, `| awaiting approval | ${data.cards.filter(c => c.provenance.review !== 'owner-approved' && !checkCard(pack, c).length).length} |`, `| draft with problems or TODO | ${data.cards.filter(c => checkCard(pack, c).length).length} |`, ''];
  for (const c of data.cards) {
    const l = lessonOf(pack, c.lesson), errs = checkCard(pack, c);
    out.push(`## ${c.lesson} · ${c.title}`, '', `सप्ताह ${l.week} · दिन ${l.day} · ${c.provenance.review}${errs.length ? ` · ⚠ ${errs.length} problem(s)` : ''}`, '');
    c.lines.forEach((x, i) => out.push(`${i + 1}. **${x.label}**${x.minutes ? ` (${x.minutes})` : ''}${x.steps ? ` · _${x.steps}_` : ''} — ${x.text}`));
    out.push('', '<details><summary>Lesson’s own steps</summary>', '');
    for (const p of l.phases) out.push(`- **${p.title}** ${p.minutes ?? ''}: ${(p.actions || []).join(' · ')}`);
    out.push('', '</details>', '');
    errs.forEach(x => out.push(`> ⚠ ${x}`));
  }
  fs.mkdirSync(new URL('docs/review/cards/', ROOT), {recursive: true});
  fs.writeFileSync(new URL(`docs/review/cards/${pack}-g${grade}.md`, ROOT), out.join('\n') + '\n');
  console.log(`wrote docs/review/cards/${pack}-g${grade}.md (${data.cards.length} cards)`);
} else if (cmd === 'approve') {
  const by = rest[rest.indexOf('--by') + 1]; if (!rest.includes('--by') || !by) throw Error('approve needs --by "<owner, where, date>"');
  const drafts = load(pack, grade), model = load(pack, grade, 'model'), ids = rest.includes('--checked') ? null : new Set(rest.filter((x, i) => x !== '--by' && rest[i - 1] !== '--by'));
  const moving = drafts.cards.filter(c => (ids ? ids.has(c.lesson) : true) && !checkCard(pack, c).length);
  for (const c of moving) { c.provenance = {assertion: 'editorial', review: 'owner-approved', note: `Approved: ${by}`}; model.cards = model.cards.filter(m => m.lesson !== c.lesson).concat(c); }
  drafts.cards = drafts.cards.filter(c => !moving.includes(c));
  save(pack, grade, drafts); save(pack, grade, model, 'model');
  console.log(`approved ${moving.length} cards in ${pack} grade ${grade}; moved to model/. Integrator: build the next content release, then site:publish.`);
} else {
  console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(0, 7).join('\n'));
}
