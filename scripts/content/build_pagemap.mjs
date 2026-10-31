// Build curricula/<pack>/model/pagemap.json: every Teacher Guide page, the guide section it
// belongs to (from model/sections.json) and the published lessons that show it.
// Coverage gate (plan §3): every pdf page must sit in exactly one section, and every page a
// lesson shows must lie inside that guide's daily-plans section. `--check` fails on drift.
//
// Usage: node scripts/content/build_pagemap.mjs [--check] [pack-id ...]
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {CURRICULA} from '../../dist/curricula.mjs';

const root = new URL('../../', import.meta.url);
const args = process.argv.slice(2), check = args.includes('--check');
const wanted = args.filter(a => !a.startsWith('--'));
const SOURCE_PAGE = /(?:^|\/)source\/g(\d)-p(\d{3})\.webp$/;

function lessonPages(pack) {
  const pages = {};
  for (const lesson of pack.lessons) {
    const seen = new Set();
    JSON.stringify(lesson, (_, value) => {
      const m = typeof value === 'string' && value.match(SOURCE_PAGE);
      if (m) seen.add(`${m[1]}:${+m[2]}`);
      return value;
    });
    for (const key of seen) (pages[key] ||= []).push(lesson.id);
  }
  return pages;
}

export function buildPagemap(model, pack) {
  const errors = [], guides = {}, used = lessonPages(pack);
  for (const [grade, guide] of Object.entries(model.guides)) {
    const owner = new Array(guide.pages + 1).fill(null);
    for (const s of guide.sections) {
      const [a, b] = s.pdf;
      if (!(a >= 1 && b >= a && b <= guide.pages)) errors.push(`G${grade} ${s.id}: bad range ${a}-${b}`);
      for (let p = a; p <= b && p <= guide.pages; p++) {
        if (owner[p]) errors.push(`G${grade} pdf ${p}: in both ${owner[p].id} and ${s.id}`);
        owner[p] = s;
      }
    }
    const pages = [];
    for (let p = 1; p <= guide.pages; p++) {
      const s = owner[p], lessons = used[`${grade}:${p}`] || [];
      if (!s) errors.push(`G${grade} pdf ${p}: in no section`);
      if (lessons.length && s?.kind !== 'plans') errors.push(`G${grade} pdf ${p}: lesson page outside daily plans (${s?.id})`);
      const printed = p - model.printedOffset;
      pages.push({pdf: p, printed: printed >= 1 ? printed : null, section: s?.id ?? null, kind: s?.kind ?? null,
        ...(lessons.length ? {lessons} : {})});
    }
    const plans = pages.filter(p => p.kind === 'plans');
    guides[grade] = {document: guide.document, pages,
      summary: {pages: guide.pages, sections: guide.sections.length,
        planPagesWithoutLesson: plans.filter(p => !p.lessons).map(p => p.pdf),
        matterPages: pages.filter(p => p.kind !== 'plans').length}};
  }
  return {errors, pagemap: {pack: model.pack, generatedFrom: 'model/sections.json + published catalog',
    reviewStatus: 'unreviewed', guides}};
}

export function pagemapFor(pack) {
  const model = JSON.parse(fs.readFileSync(new URL(`curricula/${pack.id}/model/sections.json`, root)));
  return buildPagemap(model, pack);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  let failed = false;
  for (const pack of CURRICULA) {
    if (wanted.length && !wanted.includes(pack.id)) continue;
    const dir = new URL(`curricula/${pack.id}/model/`, root);
    const {errors, pagemap} = pagemapFor(pack);
    const text = JSON.stringify(pagemap, null, 1) + '\n', target = new URL('pagemap.json', dir);
    if (check && (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== text)) errors.push('pagemap.json is stale; rebuild it');
    if (!check && !errors.length) fs.writeFileSync(target, text);
    for (const [g, guide] of Object.entries(pagemap.guides))
      console.log(`${pack.id} G${g}: ${guide.summary.matterPages} matter pages, ${guide.summary.sections} sections, plan pages without a lesson: ${guide.summary.planPagesWithoutLesson.length}`);
    for (const e of errors) console.error(`  ✗ ${pack.id} ${e}`);
    failed ||= errors.length > 0;
  }
  process.exit(failed ? 1 : 0);
}
