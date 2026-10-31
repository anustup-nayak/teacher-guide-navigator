import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CURRICULA} from '../dist/curricula.mjs';
import {validate, loadSchema} from '../scripts/content/schema.mjs';

const read = p => JSON.parse(fs.readFileSync(new URL(`../${p}`, import.meta.url)));
const VOCAB = read('schemas/content-model/vocabularies.json');
const EX = 'docs/content-model/examples/';
const EXAMPLES = {
  'hindi/program.json': 'program', 'hindi/outcomes.json': 'outcomes', 'hindi/routines.json': 'routines', 'hindi/guide-g1.json': 'guide',
  'hindi/lesson-g1-hindi-w09-d02.json': 'lesson', 'math/outcomes.json': 'outcomes', 'math/routines.json': 'routines',
  'math/lesson-g1-math-w09-d01.json': 'lesson'
};

test('schema enums are exactly the shared vocabularies', () => {
  const keys = k => Object.keys(VOCAB[k]);
  const common = loadSchema('common').$defs;
  assert.deepEqual(common.assertion.enum, keys('assertion'));
  assert.deepEqual(common.review.enum, keys('review'));
  assert.deepEqual(loadSchema('routines').properties.routines.items.properties.type.enum, keys('routineType'));
  assert.deepEqual(loadSchema('outcomes').properties.outcomes.items.properties.list.enum, keys('outcomeList'));
  assert.deepEqual(loadSchema('materials').properties.materials.items.properties.type.enum, keys('materialType'));
  assert.deepEqual(loadSchema('assessments').properties.assessments.items.properties.type.enum, keys('assessmentType'));
  const structure = loadSchema('structure').properties, dayType = structure.dayTypes.items.properties;
  assert.deepEqual(structure.calendar.items.properties.kind.enum, keys('weekKind'));
  assert.deepEqual(structure.periodOutline.items.properties.role.enum, keys('periodRole'));
  assert.deepEqual(structure.exceptions.items.properties.kind.enum, keys('exceptionKind'));
  assert.deepEqual(dayType.purpose.enum, keys('dayPurpose'));
  assert.deepEqual(dayType.planForm.enum, keys('planForm'));
  assert.deepEqual(dayType.phase.enum, keys('weekPhase'));
  assert.deepEqual(dayType.periods.items.properties.role.enum, keys('periodRole'));
  assert.deepEqual(dayType.periods.items.properties.slots.items.properties.kind.enum, keys('routineType'));
  assert.deepEqual(loadSchema('lesson').properties.periods.items.properties.role.enum, keys('periodRole'));
  assert.deepEqual(loadSchema('guide').properties.sections.items.properties.kind.enum, keys('sectionKind'));
});

test('worked examples and section maps validate against the schemas', () => {
  for (const [file, schema] of Object.entries(EXAMPLES)) assert.deepEqual(validate(schema, read(EX + file)), [], file);
  for (const pack of ['up-hindi-2026', 'up-math-2026'])
    assert.deepEqual(validate('sections', read(`curricula/${pack}/model/sections.json`)), [], pack);
  const bad = structuredClone(read(EX + 'hindi/lesson-g1-hindi-w09-d02.json'));
  bad.dayType = 'Holiday!'; delete bad.periods[0].steps[0].provenance;
  assert.equal(validate('lesson', bad).length, 2, 'validator reports a bad day type id and missing provenance');
});

test('example lessons keep v1 ids, step ids and source text unchanged', () => {
  for (const file of ['hindi/lesson-g1-hindi-w09-d02.json', 'math/lesson-g1-math-w09-d01.json']) {
    const model = read(EX + file), v1 = CURRICULA.flatMap(c => c.lessons).find(l => l.id === model.id);
    const steps = model.periods.flatMap(p => p.steps);
    assert.deepEqual(steps.map(s => s.id), v1.phases.map(p => p.id));
    assert.deepEqual(model.v1.phaseIds, v1.phases.map(p => p.id));
    steps.forEach((s, i) => { assert.equal(s.title, v1.phases[i].title); assert.deepEqual(s.actions, v1.phases[i].actions); });
  }
});

test('example links resolve within each example pack', () => {
  for (const pack of ['hindi', 'math']) {
    const files = Object.keys(EXAMPLES).filter(f => f.startsWith(pack + '/')).map(f => read(EX + f));
    const ids = new Set();
    for (const f of files) {
      for (const r of f.routines || []) ids.add(`routine:${r.id}`);
      for (const o of f.outcomes || []) ids.add(`lo:${o.id}`);
      for (const o of f.objectives || []) ids.add(`objective:${o.id}`);
    }
    const links = [];
    JSON.stringify(files, (k, v) => { if (v && typeof v === 'object' && typeof v.to === 'string') links.push(v); return v; });
    for (const l of links.filter(l => /^(routine|lo|objective):/.test(l.to))) assert.ok(ids.has(l.to), `${pack}: ${l.to}`);
    for (const l of links) if (l.assertion === 'derived') assert.ok(l.rule, `${l.to} derived without rule`);
  }
});
