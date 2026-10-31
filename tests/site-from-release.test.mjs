import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CURRICULA} from '../dist/curricula.mjs';
import {publishSite, pinnedCatalogs} from '../scripts/content/publish_site.mjs';

const read = p => JSON.parse(fs.readFileSync(new URL(`../${p}`, import.meta.url)));
const pins = read('content/website.json').packs;

test('the website serves the pinned content releases byte for byte', () => {
  assert.deepEqual(Object.keys(pins).sort(), CURRICULA.map(c => c.id).sort(), 'every registered pack is pinned');
  assert.equal(pinnedCatalogs().length, CURRICULA.length);
  assert.doesNotThrow(() => publishSite({check: true}), 'dist/ catalogs equal release views/v1 (hash-verified)');
});

// The v2 website will read views/app instead of the v1 catalog. Every teaching field the current
// website shows must already be in those bundles, for every lesson, before v2 can rely on them.
test('per-grade app bundles carry everything the website shows, for every lesson', () => {
  let lessons = 0, steps = 0;
  for (const pack of CURRICULA) {
    const {version} = pins[pack.id];
    const bundles = new Map();
    for (const lesson of pack.lessons) {
      if (!bundles.has(lesson.grade)) {
        const view = read(`content/${pack.id}/${version}/views/app/grade-${lesson.grade}.json`);
        assert.equal(view.pack, pack.id); assert.equal(view.version, version); assert.equal(view.grade, lesson.grade);
        bundles.set(lesson.grade, new Map(view.lessons.map(l => [l.id, l])));
      }
      const app = bundles.get(lesson.grade).get(lesson.id);
      assert.ok(app, `${lesson.id} missing from grade-${lesson.grade}.json`);
      for (const key of ['grade', 'week', 'day', 'title']) assert.equal(app[key], lesson[key], `${lesson.id}.${key}`);
      assert.ok(app.dayType, `${lesson.id} has a day type`);
      const appSteps = app.periods.flatMap(p => p.steps);
      assert.deepEqual(appSteps.map(s => s.id), lesson.phases.map(p => p.id), `${lesson.id} step ids and order`);
      lesson.phases.forEach((phase, i) => {
        const s = appSteps[i], at = `${lesson.id}/${phase.id}`;
        assert.equal(s.title, phase.title, `${at} title`);
        assert.deepEqual(s.actions, phase.actions, `${at} actions`);
        assert.deepEqual(s.questions ?? [], phase.questions ?? [], `${at} questions`);
        assert.equal(s.minutes ?? null, phase.minutes ?? null, `${at} minutes`);
        const page = Number(phase.image?.match(/-p(\d{3})\.webp$/)?.[1]);
        if (page) assert.equal(s.source?.pdf, page, `${at} source page`);
        steps++;
      });
      // The lesson lists every cited workbook page, in order; steps may also link the page they use.
      const page = w => Number(w.to.match(/\/p(\d+)$/)[1]);
      assert.deepEqual((app.workbook ?? []).map(page), (lesson.worksheets ?? []).map(w => w.pdfPage), `${lesson.id} workbook pages`);
      const listed = new Set((app.workbook ?? []).map(page));
      for (const s of appSteps) for (const w of s.workbook ?? []) assert.ok(listed.has(page(w)), `${lesson.id}/${s.id} links an unlisted page`);
      lessons++;
    }
  }
  assert.equal(lessons, 732);
  assert.ok(steps > 4000, `${steps} steps compared`);
});

test('week cards use one rule for both subjects and name non-teaching days (owner-approved 31 Oct 2026)', async () => {
  const {lessonSummary, dayLabel} = await import('../dist/ux.mjs');
  const {DAY_TYPES} = await import('../dist/day-types.mjs');
  const [math, hindi] = CURRICULA, byId = (p, id) => p.lessons.find(l => l.id === id);
  const label = (p, id, lang = 'hi') => dayLabel(DAY_TYPES[p.id], byId(p, id), lang);
  assert.equal(label(hindi, 'g2-hindi-w19-d01'), '', 'teaching days carry no label');
  assert.equal(label(hindi, 'g2-hindi-w19-d05'), 'साप्ताहिक पुनरावृत्ति');
  assert.equal(label(hindi, 'g2-hindi-w19-d06'), 'साप्ताहिक आकलन');
  assert.equal(label(hindi, 'g1-hindi-w12-d06'), 'साप्ताहिक पुनरावृत्ति', 'G1 assessment starts in week 14');
  assert.equal(label(hindi, 'g1-hindi-w14-d06', 'en'), 'Weekly assessment');
  assert.equal(label(math, 'g2-math-w25-d01'), '');
  assert.equal(label(math, 'g2-math-w25-d05'), 'समेकन और आकलन', 'Math assesses on day 5');
  assert.equal(label(math, 'g3-math-w09-d06'), 'रिमीडियल और पुनरावृत्ति');
  for (const pack of CURRICULA) for (const l of pack.lessons) {
    const s = lessonSummary(l, 'hi');
    if (l.structure === 'weekly-template') continue;
    assert.match(s, /^(कार्यपत्रक पृष्ठ [\d, ]+|कॉपी में अभ्यास)( · |$)/, `${l.id} summary starts with its workbook page`);
    assert.ok(!s.includes(' — '), `${l.id} summary has no preparation note`);
  }
  assert.equal(lessonSummary(byId(hindi, 'g2-hindi-w19-d06')), 'कार्यपत्रक पृष्ठ 85 · चित्र कहानी पोस्टर-5');
  assert.equal(lessonSummary(byId(math, 'g2-math-w25-d01')), 'कार्यपत्रक पृष्ठ 127 · बोर्ड, चाॅक, ब्लाॅक्स।');
});
