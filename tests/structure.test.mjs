import test from 'node:test';
import assert from 'node:assert/strict';
import {CURRICULA} from '../dist/curricula.mjs';
import {validate} from '../scripts/content/schema.mjs';
import {loadStructure, checkStructure, classify, dayTypeFor} from '../scripts/content/structure.mjs';

for (const c of CURRICULA) {
  const structure = loadStructure(c.id);

  test(`${c.id}: structure validates and is internally consistent`, () => {
    assert.deepEqual(validate('structure', structure), []);
    assert.deepEqual(checkStructure(structure), []);
  });

  test(`${c.id}: every lesson fits its day type, or is a recorded exception`, () => {
    const r = classify(c.id, c.lessons, structure);
    assert.deepEqual(r.unexpected, [], 'lessons that fit no day type');
    assert.deepEqual(r.unusedExceptions, [], 'exceptions that no longer apply');
    assert.equal(Object.values(r.byType).reduce((a, b) => a + b, 0), c.lessons.length);
    assert.equal(r.byType.none, undefined, 'no lesson falls in a week without day plans');
  });

  test(`${c.id}: weeks without lessons are exactly the weeks without day plans`, () => {
    for (const grade of [1, 2, 3]) for (let week = 1; week <= 25; week++) {
      const {block} = dayTypeFor(structure, grade, week, 1);
      const has = c.lessons.some(l => l.grade === grade && l.week === week);
      assert.equal(has, Boolean(block.inApp && block.cycle), `g${grade} w${week} (${block.kind})`);
      if (block.kind === 'periodic-revision') assert.equal(block.plan.pdf, c.reviewPages[grade][week], `g${grade} w${week} plan page`);
    }
  });
}

test('assessment days are where each guide puts them', () => {
  const [math, hindi] = CURRICULA.map(c => loadStructure(c.id));
  const type = (s, g, w, d) => dayTypeFor(s, g, w, d).dayType?.id;
  assert.equal(type(hindi, 1, 12, 6), 'hi-weekly-revision', 'Hindi G1: weekly assessment starts in week 14');
  assert.equal(type(hindi, 1, 14, 6), 'hi-weekly-assessment');
  assert.equal(type(hindi, 2, 1, 6), 'hi-weekly-assessment');
  assert.equal(type(math, 1, 9, 5), 'math-consolidation-assessment', 'Math assesses on day 5');
  assert.equal(type(math, 3, 9, 5), 'math-consolidation-assessment-g3');
  for (const s of [math, hindi]) for (const t of s.dayTypes)
    assert.equal(t.assessment === 'weekly', ['weekly-assessment', 'consolidation-assessment'].includes(t.purpose), t.id);
});
