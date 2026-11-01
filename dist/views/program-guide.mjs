// Program guide (docs/PROGRAM_GUIDE_DESIGN.md, slice A): guide home, how the week runs, the daily
// periods and the guide's own sections as original pages. Pure HTML builders: data comes from
// dist/program-guide-data.mjs (generated from the pinned content release); no fetching or storage.
const WEEK_KIND = {
  'school-readiness': ['स्कूल रेडिनेस', 'School readiness'],
  'teaching': ['शिक्षण', 'Teaching'],
  'class-review': ['पिछली कक्षा की पुनरावृत्ति', 'Previous-class review'],
  'periodic-revision': ['सावधिक पुनरावृत्ति', 'Periodic revision']
};
const SECTION_KIND = {
  program: ['कार्यक्रम', 'Programme'], article: ['शिक्षकों के लिए लेख', 'Articles for teachers'],
  assessment: ['आकलन और सहायता', 'Assessment and support'], routines: ['गतिविधियों का विवरण', 'Activity guide'],
  resources: ['संसाधन', 'Resources'], resource: ['संसाधन', 'Resources'], tracker: ['ट्रैकर', 'Trackers']
};
const ROLE_CLASS = {teaching: '', practice: 'practice', support: 'support', assessment: 'support', open: 'open'};
export const GUIDE_SECTIONS = ['home', 'week', 'periods', 'pages', 'goals'];

const pick = (pair, lang) => pair[lang === 'en' ? 1 : 0];
const ranges = days => {
  const out = [];
  for (const d of [...days].sort((a, b) => a - b)) {
    const last = out[out.length - 1];
    if (last && d === last[1] + 1) last[1] = d; else out.push([d, d]);
  }
  return out.map(([a, b]) => a === b ? `${a}` : `${a}–${b}`).join(', ');
};

export function createProgramGuide({data, pack, e, t, lang, gradeLabel, subjectLabel}) {
  const guideFor = grade => data?.[pack.id]?.grades?.[String(grade)];
  const printed = pdf => pdf - (data?.[pack.id]?.printedOffset ?? 2);
  const pageButton = (grade, pdf, label) =>
    `<button class="button" data-resource="guide" data-grade="${grade}" data-page="${pdf - 1}">${e(label ?? `${t('संदर्शिका पृष्ठ', 'Guide page')} ${printed(pdf) > 0 ? printed(pdf) : pdf}`)}</button>`;
  const sourceButtons = (grade, pdfs) => [...new Set(pdfs)].sort((a, b) => a - b).map(p => pageButton(grade, p)).join('');
  const typeName = type => e(type.name?.[lang] || type.name?.hi || '');
  const blockFor = (g, week) => g.calendar.find(b => b.from <= week && week <= b.to);
  const back = (href, label) => `<p class="guide-back"><a href="${href}">← ${label}</a></p>`;
  const heading = grade => `${e(gradeLabel(grade))} · ${e(subjectLabel)}`;

  // Goals (slice G): stated links and owner-approved rule links only, chosen by site:publish.
  const yearLength = g => Math.max(...g.calendar.map(b => b.to));
  function strip(g, weeks, now) {
    const on = new Set(weeks), kind = n => blockFor(g, n)?.kind;
    return `<div class="goal-strip" aria-hidden="true">${Array.from({length: yearLength(g)}, (_, i) => i + 1).map(n =>
      `<span class="${on.has(n) ? 'on' : kind(n) === 'periodic-revision' ? 'rv' : ''}${n === now ? ' now' : ''}"></span>`).join('')}</div>`;
  }
  const legend = () => `<p class="goal-legend"><span><i class="on"></i>${t('इस लक्ष्य के सप्ताह', 'Weeks for this goal')}</span><span><i class="rv"></i>${t('सावधिक पुनरावृत्ति', 'Periodic revision')}</span><span><i class="now"></i>${t('आप यहाँ हैं (आपका अगला पाठ)', 'You are here (your next lesson)')}</span></p>`;
  const weeksOf = goal => [...new Set(goal.lessons.map(l => l.week))];
  const weekText = ws => {
    const r = []; for (const w of ws) { const last = r[r.length - 1]; if (last && w === last[1] + 1) last[1] = w; else r.push([w, w]); }
    return r.map(([a, b]) => a === b ? `${a}` : `${a}–${b}`).join(', ');
  };
  const goalTitle = goal => e(goal.title[lang] || goal.title.hi);
  function goalCard(g, goal, ctx) {
    const taught = goal.lessons.filter(l => ctx.completed?.[l.id]).length, teaching = goal.lessons.filter(l => l.stated).length;
    return `<a class="goal-card" href="#/guide/goal/${encodeURIComponent(goal.id)}"><h3>${goalTitle(goal)}</h3><p>${teaching} ${t('शिक्षण पाठ', 'teaching lessons')} · ${t('सप्ताह', 'weeks')} ${weekText(weeksOf(goal))}</p>${strip(g, weeksOf(goal), ctx.week)}${taught ? `<p class="goal-mine">✓ ${t('आपने', 'You have taught')} ${taught} ${t('पाठ पढ़ाए', 'lessons')}</p>` : ''}<p class="goal-codes">${t('निपुण कोड', 'NIPUN codes')}: ${goal.outcomes.map(o => e(o.code)).join(', ')}</p></a>`;
  }
  function goals(grade, ctx) {
    const g = guideFor(grade);
    if (!g) return missing(grade);
    const nipun = g.sections.find(s => s.id === 'nipun-list');
    if (!g.goals?.length) return `${back('#/guide', t('पूरा साल', 'Whole year'))}<h1 class="guide-title">🎯 ${t('इस साल के लक्ष्य', 'This year’s goals')}</h1><p class="guide-lead">${t('इस कक्षा और विषय के लक्ष्य और उनके पाठ अभी जोड़े जा रहे हैं। तब तक संदर्शिका की निपुण सूची देखें।', 'Goals and their lessons are still being added for this grade and subject. Until then, see the guide’s NIPUN list.')}</p>${nipun ? pageButton(grade, nipun.pdf[0], t('निपुण सूची देखें', 'Open the NIPUN list')) : ''}`;
    return `${back('#/guide', t('पूरा साल', 'Whole year'))}
<h1 class="guide-title">🎯 ${t('इस साल के लक्ष्य', 'This year’s goals')} · ${heading(grade)}</h1>
<p class="guide-lead">${t('साल के अंत तक बच्चे ये कर पाएँ। हरे सप्ताहों में इन्हें पढ़ाया जाता है; बैंगनी सप्ताह सावधिक पुनरावृत्ति के हैं। लक्ष्य पर दबाएँ, उसके पाठ खुलेंगे।', 'By the end of the year children should be able to do these. Green weeks teach them; purple weeks are periodic revision. Tap a goal to see its lessons.')}</p>
${legend()}
${g.goals.map(goal => goalCard(g, goal, ctx)).join('')}
<div class="guide-sources"><p class="small">${t('लक्ष्यों के कथन और कोड: संदर्शिका की निपुण सूची। छोटे शीर्षक सार हैं। “आपने … पढ़ाए” इसी फ़ोन के ‘पढ़ा दिया है’ निशानों से।', 'Statements and codes: the guide’s NIPUN list. Short titles are summaries. “You have taught …” comes from this phone’s ‘taught’ marks.')}</p>${nipun ? pageButton(grade, nipun.pdf[0], t('निपुण सूची देखें', 'Open the NIPUN list')) : ''}</div>`;
  }
  function goal(grade, id, ctx) {
    const g = guideFor(grade), goal = g?.goals?.find(x => x.id === id);
    if (!goal) return `${back('#/guide/goals', t('इस साल के लक्ष्य', 'This year’s goals'))}<section class="panel"><h1>${t('लक्ष्य नहीं मिला', 'Goal not found')}</h1><a class="button primary" href="#/guide/goals">${t('सभी लक्ष्य', 'All goals')}</a></section>`;
    const next = goal.lessons.find(l => l.stated && !ctx.completed?.[l.id]) || goal.lessons.find(l => !ctx.completed?.[l.id]);
    const cycle = (blockFor(g, goal.lessons[0]?.week)?.cycle || []);
    const order = cycle.map(([days, tid]) => `${t('दिन', 'Day')} ${ranges(days)}: ${typeName(g.dayTypes[tid] || {})}`).join(' · ');
    const rows = weeksOf(goal).map(w => {
      const days = goal.lessons.filter(l => l.week === w), wc = blockFor(g, w)?.cycle || [];
      const purpose = d => g.dayTypes[wc.find(([ds]) => ds.includes(d))?.[1]]?.purpose;
      const chips = days.map(l => `<a class="goal-day p-${purpose(l.day)}${ctx.completed?.[l.id] ? ' done' : ''}" href="#/lesson/${l.id}">${t('दिन', 'Day')} ${l.day}${ctx.completed?.[l.id] ? ' ✓' : ''}</a>`).join('');
      const titles = days.filter(l => l.stated).map(l => e(ctx.titleOf(l.id))).filter(Boolean);
      return `<div class="goal-week"><h3>${t('सप्ताह', 'Week')} ${w}</h3><div class="goal-days">${chips}</div>${titles.length ? `<ul>${titles.map(x => `<li>${x}</li>`).join('')}</ul>` : ''}</div>`;
    }).join('');
    const nipun = g.sections.find(s => s.id === 'nipun-list');
    return `${back('#/guide/goals', t('इस साल के लक्ष्य', 'This year’s goals'))}
<h1 class="guide-title">${goalTitle(goal)}</h1>
<ul class="goal-statements">${goal.outcomes.map(o => `<li>${e(o.statement)} <small class="goal-code">${e(o.code)}</small></li>`).join('')}</ul>
${strip(g, weeksOf(goal), ctx.week)}
${legend()}
<p class="goal-how"><b>${t('संदर्शिका यहाँ कैसे ले जाती है', 'How the guide gets there')}:</b> ${t('सप्ताह', 'Weeks')} ${weekText(weeksOf(goal))}. ${order}.</p>
${next ? `<a class="button primary goal-next" href="#/lesson/${next.id}">${t('अगला पाठ', 'Next lesson')}: ${t('सप्ताह', 'Week')} ${next.week} · ${t('दिन', 'Day')} ${next.day} →</a>` : `<p class="goal-mine">✓ ${t('इस लक्ष्य के सभी पाठ पढ़ाए गए चिह्नित हैं।', 'All lessons for this goal are marked taught.')}</p>`}
${rows}
<div class="guide-sources"><p class="small">${t('दिन 1–3 पर लक्ष्य के कोड संदर्शिका में छपे हैं। दिन 4–6 इसी सप्ताह के लक्ष्य का अभ्यास, जाँच और दोहराव करते हैं।', 'Days 1–3 carry the goal codes printed in the guide. Days 4–6 practise, check and revise the same week’s goals.')}</p>${nipun ? pageButton(grade, nipun.pdf[0], t('निपुण सूची देखें', 'Open the NIPUN list')) : ''}</div>`;
  }

  function missing(grade) {
    return `${back('#/today', t('आज', 'Today'))}<section class="panel"><h1>${t('संदर्शिका की जानकारी उपलब्ध नहीं', 'Guide information not available')}</h1><p>${t('इस कक्षा और विषय के लिए संदर्शिका की जानकारी अभी नहीं जोड़ी गई है।', 'The guide information for this grade and subject has not been added yet.')}</p></section>`;
  }

  function home(grade, ctx = {}) {
    const g = guideFor(grade);
    if (!g) return missing(grade);
    const goals = g.sections.find(s => s.id === 'nipun-list');
    const types = [...new Map(g.calendar.filter(b => b.cycle).flatMap(b => b.cycle.map(([, id]) => [id, g.dayTypes[id]]))).values()].filter(Boolean);
    return `${back('#/today', t('आज', 'Today'))}
<h1 class="guide-title">${t('पूरा साल', 'Whole year')} · ${heading(grade)}</h1>
${g.goals?.length ? `<section class="guide-goals"><h2>🎯 ${t('इस साल के लक्ष्य', 'This year’s goals')}</h2><p>${t('हर लक्ष्य के सामने वे सप्ताह और पाठ हैं जो उसे पूरा करते हैं। लक्ष्य चुनें, पाठ खोलें।', 'Each goal shows the weeks and lessons that build it. Choose a goal, open its lessons.')}</p>${g.goals.slice(0, 3).map(x => goalCard(g, x, ctx)).join('')}<a class="button" href="#/guide/goals">${t('सभी', 'All')} ${g.goals.length} ${t('लक्ष्य देखें', 'goals')} →</a></section>` : `<section class="guide-goals"><h2>🎯 ${t('इस साल के लक्ष्य', 'This year’s goals')}</h2><p>${t('संदर्शिका की निपुण सूची में वे दक्षताएँ हैं जो बच्चे इस साल सीखेंगे।', 'The guide’s NIPUN list sets out what children will learn this year.')}</p>${goals ? pageButton(grade, goals.pdf[0], t('निपुण सूची देखें', 'Open the NIPUN list')) : ''}<p class="small">${t('हर लक्ष्य के सप्ताह और पाठ यहाँ अगले चरण में जुड़ेंगे।', 'Each goal’s weeks and lessons will be added here next.')}</p></section>`}
<h2 class="guide-subhead">${t('संदर्शिका कैसे काम करती है', 'How the guide works')}</h2>
<a class="guide-section" href="#/guide/week"><h3>${t('सप्ताह कैसे चलता है', 'How the week runs')}</h3><p>${types.map(typeName).join(' · ')}</p></a>
<a class="guide-section" href="#/guide/periods"><h3>${t('हर दिन के कालांश', 'The periods of each day')}</h3><p>${g.periods.map(p => `${t('कालांश', 'Period')} ${p.number}: ${e(p.focus.hi)}`).join(' · ') || t('कालांश संदर्शिका में देखें', 'See the guide')}</p></a>
<a class="guide-section" href="#/guide/pages"><h3>${t('संदर्शिका के सभी हिस्से', 'Every part of the guide')}</h3><p>${[...new Set(g.sections.map(s => s.kind))].map(k => pick(SECTION_KIND[k] || [k, k], lang)).join(' · ')}</p><small>${t('मूल पृष्ठ', 'Original pages')}</small></a>`;
  }

  function week(grade, currentWeek, lessonIds) {
    const g = guideFor(grade);
    if (!g) return missing(grade);
    const teaching = g.calendar.filter(b => b.cycle);
    const block = (blockFor(g, currentWeek)?.cycle ? blockFor(g, currentWeek) : null) || teaching[0];
    const w = block && blockFor(g, currentWeek)?.cycle ? currentWeek : block?.from;
    const dayType = d => block?.cycle.find(([days]) => days.includes(d))?.[1];
    const lessonId = d => `g${grade}-${pack.subject}-w${String(w).padStart(2, '0')}-d${String(d).padStart(2, '0')}`;
    const tile = d => {
      // Tiles are narrow: the short day-type name, or “new skills” for teaching days.
      const type = g.dayTypes[dayType(d)], label = type?.short ? e(type.short[lang] || type.short.hi) : t('नई दक्षताएँ', 'New skills');
      const body = `<b>${t('दिन', 'Day')} ${d}</b><span>${label}</span>`;
      return lessonIds.has(lessonId(d)) ? `<a class="guide-day p-${type?.purpose}" href="#/lesson/${lessonId(d)}">${body}</a>` : `<div class="guide-day p-${type?.purpose}">${body}</div>`;
    };
    const used = [];
    for (const [days, id] of block?.cycle || []) if (!used.some(u => u.id === id)) used.push({id, days: block.cycle.filter(([, x]) => x === id).flatMap(([ds]) => ds)});
    const typeRow = ({id, days}) => {
      const type = g.dayTypes[id];
      const periods = type.periods.filter(p => p.role !== 'open').map(p => {
        const slots = p.slots.map(s => `${e(s.name[lang] || s.name.hi)}${s.minutes ? ` (${e(s.minutes)} ${t('मिनट', 'min')})` : ''}`);
        return `<li>${t('कालांश', 'Period')} ${p.number.join(` ${t('एवं', 'and')} `)}${p.minutes ? ` · ${p.minutes} ${t('मिनट', 'min')}` : ''}${slots.length ? `: ${slots.join(' → ')}` : ''}</li>`;
      }).join('');
      const open = type.periods.filter(p => p.role === 'open').map(p => `<li>${t('कालांश', 'Period')} ${p.number.join('+')}: ${t('रिक्त कालांश, आवश्यकता अनुसार', 'open period, use as needed')}</li>`).join('');
      const sequence = type.sequence.length ? `<li>${type.sequence.map(s => e(s.name[lang] || s.name.hi)).join(' → ')}</li>` : '';
      return `<div class="guide-type p-${type.purpose}"><h3>${t('दिन', 'Day')} ${ranges(days)} · ${typeName(type)}</h3><ul>${periods}${open}${sequence}</ul></div>`;
    };
    const years = Array.from({length: Math.max(...g.calendar.map(b => b.to))}, (_, i) => i + 1);
    const kindOf = n => blockFor(g, n)?.kind;
    const kinds = [...new Set(g.calendar.map(b => b.kind))];
    const others = g.calendar.filter(b => !b.cycle || b.label);
    return `${back('#/guide', t('पूरा साल', 'Whole year'))}
<h1 class="guide-title">${t('सप्ताह कैसे चलता है', 'How the week runs')}</h1>
<p class="guide-lead">${heading(grade)} · ${t('सप्ताह', 'Week')} ${w}${block?.label ? ` · ${e(block.label[lang] || block.label.hi)}` : ''}. ${t('दिन पर दबाएँ, उस दिन का पाठ खुलेगा।', 'Tap a day to open its lesson.')}</p>
<div class="guide-days">${[1, 2, 3, 4, 5, 6].map(tile).join('')}</div>
${used.map(typeRow).join('')}
<h2 class="guide-subhead">${t('पूरा वर्ष', 'The whole year')}</h2>
<div class="guide-year" role="img" aria-label="${t('सप्ताह 1 से', 'Weeks 1 to')} ${years.length}">${years.map(n => `<span class="k-${kindOf(n) || 'none'}${n === w ? ' now' : ''}" title="${t('सप्ताह', 'Week')} ${n}"></span>`).join('')}</div>
<div class="guide-year-axis"><span>1</span><span>${years.length}</span></div>
<p class="guide-legend">${kinds.map(k => `<span><i class="k-${k}"></i>${pick(WEEK_KIND[k] || [k, k], lang)}</span>`).join('')}</p>
<ul class="guide-blocks">${others.map(b => `<li>${t('सप्ताह', 'Week')} ${b.from === b.to ? b.from : `${b.from}–${b.to}`}: ${e(b.label?.[lang] || b.label?.hi || pick(WEEK_KIND[b.kind] || [b.kind, b.kind], lang))}${b.plan ? ` ${pageButton(grade, b.plan, t('पुनरावृत्ति के निर्देश', 'Revision guidance'))}` : ''}</li>`).join('')}</ul>
<div class="guide-sources"><p class="small">${t('स्रोत: संदर्शिका के ये पृष्ठ', 'Source: these guide pages')}</p>${sourceButtons(grade, used.flatMap(({id}) => g.dayTypes[id].pages))}</div>`;
  }

  function periods(grade) {
    const g = guideFor(grade);
    if (!g) return missing(grade);
    const remedial = Object.values(g.dayTypes).flatMap(t2 => t2.periods.flatMap(p => p.slots.filter(s => s.kind === 'remediation').map(s => ({number: p.number[0], slot: s}))));
    const card = p => {
      const note = remedial.find(r => r.number === p.number);
      return `<div class="guide-period ${ROLE_CLASS[p.role] ?? ''}"><h3>${t('कालांश', 'Period')} ${p.number}<span>${p.minutes} ${t('मिनट', 'min')}</span></h3><p>${e(p.focus.hi)}</p>${note ? `<p class="small">${e(note.slot.name[lang] || note.slot.name.hi)}${note.slot.minutes ? ` · ${e(note.slot.minutes)} ${t('मिनट', 'min')}` : ''}</p>` : ''}</div>`;
    };
    return `${back('#/guide', t('पूरा साल', 'Whole year'))}
<h1 class="guide-title">${t('हर दिन के कालांश', 'The periods of each day')}</h1>
<p class="guide-lead">${heading(grade)}. ${t('रंग वही हैं जो हर पाठ में हैं।', 'The colours match those in every lesson.')}</p>
${g.periods.map(card).join('') || `<p>${t('कालांशों की रूपरेखा संदर्शिका के पृष्ठ पर देखें।', 'See the period outline on the guide page.')}</p>`}
<div class="guide-sources"><p class="small">${t('स्रोत: संदर्शिका के ये पृष्ठ', 'Source: these guide pages')}</p>${sourceButtons(grade, g.periods.flatMap(p => p.pages))}</div>`;
  }

  function pages(grade) {
    const g = guideFor(grade);
    if (!g) return missing(grade);
    const groups = [...new Set(g.sections.map(s => s.kind))];
    const range = s => {
      const [a, b] = s.pdf.map(printed);
      return a > 0 ? (a === b ? `${t('पृष्ठ', 'Page')} ${a}` : `${t('पृष्ठ', 'Pages')} ${a}–${b}`) : '';
    };
    return `${back('#/guide', t('पूरा साल', 'Whole year'))}
<h1 class="guide-title">${t('संदर्शिका के सभी हिस्से', 'Every part of the guide')}</h1>
<p class="guide-lead">${heading(grade)}. ${t('हर हिस्सा संदर्शिका के मूल पृष्ठ पर खुलता है।', 'Each part opens on the guide’s original page.')}</p>
${groups.map(k => `<h2 class="guide-subhead">${pick(SECTION_KIND[k] || [k, k], lang)}</h2><ul class="guide-pages">${g.sections.filter(s => s.kind === k).map(s => `<li><span>${e(s.title)}</span>${pageButton(grade, s.pdf[0], range(s) || t('मूल पृष्ठ', 'Original page'))}</li>`).join('')}</ul>`).join('')}`;
  }

  return {
    render(section, {grade, week: currentWeek, lessonIds, goal: goalId, completed = {}, titleOf = () => ''}) {
      const ctx = {week: currentWeek, completed, titleOf};
      if (section === 'goals') return goals(grade, ctx);
      if (section === 'goal') return goal(grade, goalId, ctx);
      if (section === 'week') return week(grade, currentWeek, lessonIds);
      if (section === 'periods') return periods(grade);
      if (section === 'pages') return pages(grade);
      return home(grade, ctx);
    },
    title(section) {
      return section === 'goals' || section === 'goal' ? t('इस साल के लक्ष्य', 'This year’s goals')
        : section === 'week' ? t('सप्ताह कैसे चलता है', 'How the week runs')
        : section === 'periods' ? t('हर दिन के कालांश', 'The periods of each day')
        : section === 'pages' ? t('संदर्शिका के सभी हिस्से', 'Every part of the guide')
        : t('पूरा साल', 'Whole year');
    }
  };
}
