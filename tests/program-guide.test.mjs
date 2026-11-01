import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CURRICULA} from '../dist/curricula.mjs';
import {parseRoute, escapeHTML} from '../dist/core.mjs';
import {PROGRAM_GUIDE} from '../dist/program-guide-data.mjs';
import {createProgramGuide, GUIDE_SECTIONS} from '../dist/views/program-guide.mjs';
import {programGuideModule} from '../scripts/content/publish_site.mjs';

const dist = p => fs.readFileSync(new URL(`../dist/${p}`, import.meta.url), 'utf8');
const guide = (pack, lang = 'hi') => createProgramGuide({data: PROGRAM_GUIDE, pack, e: escapeHTML, t: (hi, en) => lang === 'en' ? en : hi, lang,
  gradeLabel: g => `कक्षा ${g}`, subjectLabel: pack.subjectLabel[lang]});

test('guide routes parse; unknown sections fall back to the guide home', () => {
  assert.deepEqual(parseRoute('#/guide'), {screen: 'guide', section: 'home'});
  for (const s of ['week', 'periods', 'pages']) assert.deepEqual(parseRoute(`#/guide/${s}`), {screen: 'guide', section: s});
  assert.deepEqual(parseRoute('#/guide/unknown'), {screen: 'guide', section: 'home'});
  assert.equal(parseRoute('#/lesson/g1-math-w09-d01').screen, 'lesson', 'existing routes unchanged');
});

test('guide data is generated from the pinned content releases', () => {
  assert.equal(dist('program-guide-data.mjs'), programGuideModule());
});

test('every guide screen renders for every pack and grade, cites guide pages and links only real lessons', () => {
  for (const pack of CURRICULA) {
    const ids = new Set(pack.lessons.map(l => l.id));
    for (const lang of ['hi', 'en']) for (const grade of [...new Set(pack.lessons.map(l => l.grade))]) {
      for (const section of GUIDE_SECTIONS) {
        const weeks = [...new Set(pack.lessons.filter(l => l.grade === grade).map(l => l.week))];
        for (const week of [weeks[0], 13, weeks.at(-1)]) {
          const html = guide(pack, lang).render(section, {grade, week, lessonIds: ids});
          assert.ok(html.length > 200, `${pack.id} g${grade} ${section}`);
          assert.doesNotMatch(html, /undefined|NaN|\[object/, `${pack.id} g${grade} ${section} ${lang}`);
          for (const [, id] of html.matchAll(/href="#\/lesson\/([^"]+)"/g)) assert.ok(ids.has(id), `${id} exists`);
          if (section !== 'home') assert.match(html, /data-resource="guide" data-grade="\d" data-page="\d+"/, `${section} offers original pages`);
        }
      }
      const week = guide(pack, lang).render('week', {grade, week: 99, lessonIds: ids});
      assert.equal((week.match(/class="guide-day /g) || []).length, 6, 'six days shown');
    }
  }
});

test('Hindi G1 shows weeks 9–12 day 6 as revision and the combined assessment periods from week 14', () => {
  const hindi = CURRICULA.find(c => c.id === 'up-hindi-2026'), ids = new Set(hindi.lessons.map(l => l.id));
  const w10 = guide(hindi).render('week', {grade: 1, week: 10, lessonIds: ids});
  assert.match(w10, /दिन 5, 6|दिन 5–6/);
  const w14 = guide(hindi).render('week', {grade: 1, week: 14, lessonIds: ids});
  assert.match(w14, /कालांश 2 एवं 3 · 80 मिनट/);
});

test('entry points are present and the guide loads lazily and offline', () => {
  const app = dist('app.mjs'), sw = dist('sw.js'), v = app.match(/import\('\.\/views\/program-guide\.mjs\?v=(r\d+)'\)/)?.[1];
  assert.ok(v, 'program-guide view is imported on demand');
  assert.match(dist('index.html'), /<a href="#\/guide" id="year-link">(?:<svg[^]*?<\/svg>)?<span>पूरा साल<\/span><\/a>/, 'header tab पूरा साल (owner-approved 1 Nov 2026)');
  assert.ok(app.includes('${bannerGoals(l)}') && app.includes('${chainLine(l)}'), 'goal and lesson order in the lesson banner');
  assert.ok(app.includes('${guideLink(l)}'), 'lesson link');
  assert.ok(sw.includes(`"views/program-guide.mjs?v=${v}"`) && sw.includes(`"program-guide-data.mjs?v=${v}"`), 'worker caches the guide');
});

test('Math goals: stated links follow the printed codes, rule links only on days 4–6, every goal reachable from its lessons', async () => {
  const {LESSON_GOALS} = await import('../dist/lesson-goals.mjs');
  const math = CURRICULA.find(c => c.id === 'up-math-2026');
  const goals = Object.values(PROGRAM_GUIDE['up-math-2026'].grades).flatMap(g => g.goals);
  assert.deepEqual([1, 2, 3].map(g => goals.filter(x => x.grade === g).length), [6, 8, 9], 'goals per grade (owner-approved)');
  const byId = new Map(math.lessons.map(l => [l.id, l]));
  for (const goal of goals) {
    assert.ok(goal.lessons.length && goal.outcomes.length, goal.id);
    for (const l of goal.lessons) {
      const v1 = byId.get(l.id);
      assert.equal(v1.grade, goal.grade);
      if (l.stated) assert.ok(v1.structure !== 'weekly-template', `${l.id} stated link is a teaching day`);
      else assert.equal(v1.structure, 'weekly-template', `${l.id} rule link is a template day`);
      assert.ok(LESSON_GOALS['up-math-2026'].lessons[l.id].includes(goal.id), `${l.id} shows its goal chip`);
    }
  }
  // Every printed code in v1 lands on a goal's teaching lessons.
  for (const l of math.lessons.filter(l => l.loCode)) assert.ok(goals.some(g => g.lessons.some(x => x.id === l.id && x.stated)), l.id);
  assert.ok(!goals.some(g => g.lessons.some(x => x.id === 'g1-math-w23-d03' && x.stated)), 'page prints no code there');
  assert.ok(goals.find(g => g.id === 'g1-m101').lessons.some(x => x.id === 'g1-math-w09-d02' && x.stated), 'printed code v1 missed');
  assert.equal(LESSON_GOALS['up-hindi-2026'], undefined, 'no Hindi goals until the goal-to-week map is approved');
});

test('goal screens render: list, detail with next lesson and progress, missing goal', () => {
  const math = CURRICULA.find(c => c.id === 'up-math-2026'), ids = new Set(math.lessons.map(l => l.id));
  const view = guide(math), titleOf = id => math.lessons.find(l => l.id === id)?.title || '';
  const list = view.render('goals', {grade: 2, week: 14, lessonIds: ids, completed: {}, titleOf});
  assert.equal((list.match(/class="goal-card"/g) || []).length, 8);
  const detail = view.render('goal', {grade: 2, week: 14, lessonIds: ids, goal: 'g2-m202', completed: {'g2-math-w14-d01': true}, titleOf});
  assert.match(detail, /href="#\/lesson\/g2-math-w14-d02"[^>]*>अगला पाठ/);
  assert.match(detail, /goal-day[^"]*done" href="#\/lesson\/g2-math-w14-d01"/);
  assert.match(view.render('goal', {grade: 2, goal: 'nope', completed: {}, titleOf}), /लक्ष्य नहीं मिला/);
  const hindi = CURRICULA.find(c => c.id === 'up-hindi-2026');
  assert.match(guide(hindi).render('goals', {grade: 1, completed: {}, titleOf}), /अभी जोड़े जा रहे हैं/);
});
