import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CURRICULA} from '../dist/curricula.mjs';
import {pagemapFor} from '../scripts/content/build_pagemap.mjs';

// Phase 1 coverage gate: every Teacher Guide page belongs to exactly one section of its own
// contents page, lesson pages sit inside the daily plans, and pagemap.json is current.
for (const pack of CURRICULA) test(`${pack.id}: every guide page is mapped once and the page map is current`, () => {
  const {errors, pagemap} = pagemapFor(pack);
  assert.deepEqual(errors, []);
  const saved = fs.readFileSync(new URL(`../curricula/${pack.id}/model/pagemap.json`, import.meta.url), 'utf8');
  assert.equal(saved, JSON.stringify(pagemap, null, 1) + '\n', 'run node scripts/content/build_pagemap.mjs');
  for (const guide of Object.values(pagemap.guides)) {
    const lessonPages = guide.pages.filter(p => p.lessons).length;
    assert.ok(lessonPages >= 60, `${guide.document}: ${lessonPages} lesson pages`);
  }
});

test('plan pages without a lesson are only the review weeks (Hindi) and unit openers (Math)', () => {
  const [math, hindi] = CURRICULA.map(p => pagemapFor(p).pagemap);
  const reviews = Object.entries(hindi.guides).map(([g, guide]) => [g, guide.summary.planPagesWithoutLesson]);
  const expected = Object.entries(CURRICULA[1].reviewPages).map(([g, weeks]) => [g, Object.values(weeks)]);
  assert.deepEqual(reviews, expected);
  for (const guide of Object.values(math.guides)) assert.ok(guide.summary.planPagesWithoutLesson.length <= 8);
});
