// Smart lesson card (docs/SMART_CARDS.md; layouts chosen by the owner 1 Nov 2026: "steps" for Math,
// "periods" for Hindi). Pure HTML builder: app.mjs supplies the approved card, the lesson and helpers.
// The card summarises the lesson's own steps in order and links each line to its full step below.
const ROLE = {practice: 'practice', support: 'support'};
export function renderSmartCard({card, lesson, t, e, context, goals, chain, image, stepIndex, roleOf}) {
  const before = lesson.priorKnowledge
    ? `<span>${t('पहले से', 'Builds on')}: ${e(lesson.priorKnowledge)}</span>`
    : chain.previous ? `<a href="${chain.previous.href}" data-open="${e(chain.previous.id)}">← ${t('पिछला', 'Before')}: ${e(chain.previous.title)}</a>` : '<span></span>';
  const next = chain.next ? `<a class="card-next" href="${chain.next.href}" data-open="${e(chain.next.id)}">${t('आगे', 'Next')}: ${e(chain.next.title)} ›</a>` : '';
  const goalLine = goals.length ? goals.map(g => `<a class="card-goal" href="#/guide/goal/${encodeURIComponent(g.id)}">🎯 <span>${e(g.title)}</span>${g.position ? `<b>${t('पाठ', 'Lesson')} ${g.position} / ${g.total}</b>` : ''}</a>`).join('') : '';
  const target = line => `lesson-phase-${stepIndex(line.phases[0])}`;
  const role = line => ROLE[roleOf(line.phases[0])] || 'teaching';
  const body = card.layout === 'periods'
    ? `<div class="card-bands">${card.lines.map(line => `<a class="card-band role-${line.period === 2 ? 'practice' : line.period === 3 ? 'support' : 'teaching'}" href="#${target(line)}" data-section="${target(line)}"><span class="card-band-head"><b>${e(line.label)}</b>${line.steps ? `<small>${e(line.steps)}</small>` : ''}</span><span class="card-text">${e(line.text)}</span></a>`).join('')}</div>`
    : `<ol class="card-lines">${card.lines.map((line, i) => `<li><a class="card-line" href="#${target(line)}" data-section="${target(line)}"><span class="card-num role-${role(line)}" aria-hidden="true">${i + 1}</span><span><b>${e(line.label)}</b>${line.minutes ? ` <small>${e(line.minutes)}</small>` : ''}<span class="card-text">${e(line.text)}</span></span><span class="card-go" aria-hidden="true">›</span></a></li>`).join('')}</ol>`;
  const prep = [lesson.materials?.length ? `<b>${t('तैयार रखें', 'Have ready')}:</b> ${lesson.materials.map(e).join(' · ')}` : '', lesson.commonMistake ? `<b>${t('ध्यान दें', 'Watch for')}:</b> ${e(lesson.commonMistake)}` : ''].filter(Boolean).join('<br>');
  const periods = card.lines.length, WORD = {1: 'एक', 2: 'दो', 3: 'तीन', 4: 'चार'};
  // Lesson identity first; the previous/next pair follows the start button (audit X6, 1 Nov 2026).
  return `<section class="smart-card" data-lesson-id="${e(lesson.id)}" aria-labelledby="smart-card-title">
<header class="card-head"><p class="card-context">${e(context)}</p><h1 class="lesson-title" id="smart-card-title">${e(card.title)}</h1>${goalLine}</header>
${image || ''}
<p class="card-label">${card.layout === 'periods' ? t(`आज के ${WORD[periods] || periods} कालांश`, `Today’s ${periods} periods`) : t('पाठ एक नज़र में', 'The lesson at a glance')} <span class="card-tag">${t('सार · पूरे निर्देश नीचे हर चरण में', 'Summary · full steps below')}</span></p>
${body}
${prep ? `<p class="card-prep">${prep}</p>` : ''}
<a class="button primary card-start" href="#lesson-phase-0" data-section="lesson-phase-0">${t('पाठ शुरू करें · चरण 1', 'Start the lesson · step 1')} →</a>
<nav class="card-chain" aria-label="${t('पिछला और अगला पाठ', 'Previous and next lesson')}">${before}${next}</nav>
</section>`;
}
