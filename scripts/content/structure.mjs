// Program structure (curricula/<pack>/model/structure.json): which day type each day of each
// week is, and what shape that day type has. The structure is written first, from the guide's
// own usage, annual-objectives, weekly-cycle and period-outline pages; lessons are then checked
// against it, so a lesson that does not fit is either a recorded exception or an error.
//
// Usage: node scripts/content/structure.mjs [pack ...]   (prints the day-type report)
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {periodOf} from './v1_lesson.mjs';

const ROOT = new URL('../../', import.meta.url);
const V1_FORM = {'source-periods': 'daily-plan', 'source-grr': 'daily-plan', 'weekly-template': 'weekly-template'};

export function loadStructure(pack) {
  return JSON.parse(fs.readFileSync(new URL(`curricula/${pack}/model/structure.json`, ROOT)));
}

// The calendar block and day type for one day. A block without a cycle (school readiness,
// periodic revision) has no day plans, so dayType is null there.
export function dayTypeFor(structure, grade, week, day) {
  const blocks = structure.calendar.filter(b => b.grade === grade && b.from <= week && week <= b.to);
  if (blocks.length !== 1) throw new Error(`g${grade} w${week}: ${blocks.length} calendar blocks`);
  const [block] = blocks;
  const rule = block.cycle?.find(r => r.days.includes(day));
  return {block, dayType: rule ? structure.dayTypes.find(t => t.id === rule.dayType) : null};
}

// Internal consistency: unique ids, every cycle names a day type valid for its grade, every
// grade's calendar runs from week 1 without gaps or overlaps, and every cycle covers days 1–6 once.
export function checkStructure(structure) {
  const errors = [], ids = new Set();
  for (const t of structure.dayTypes) {
    if (ids.has(t.id)) errors.push(`duplicate day type ${t.id}`);
    ids.add(t.id);
    if (!t.periods.length && !t.sequence?.length) errors.push(`${t.id}: no periods or sequence`);
    const nums = t.periods.flatMap(p => p.number);
    if (new Set(nums).size !== nums.length) errors.push(`${t.id}: a period number is used twice`);
  }
  for (const grade of new Set(structure.calendar.map(b => b.grade))) {
    const blocks = structure.calendar.filter(b => b.grade === grade).sort((a, b) => a.from - b.from);
    let next = 1;
    for (const b of blocks) {
      if (b.from !== next) errors.push(`g${grade}: calendar jumps from week ${next} to ${b.from}`);
      next = b.to + 1;
      if (!b.cycle) continue;
      const days = b.cycle.flatMap(r => r.days).sort();
      if (days.join() !== '1,2,3,4,5,6') errors.push(`g${grade} w${b.from}-${b.to}: cycle covers days ${days}`);
      for (const r of b.cycle) {
        const t = structure.dayTypes.find(t => t.id === r.dayType);
        if (!t) errors.push(`g${grade} w${b.from}: unknown day type ${r.dayType}`);
        else if (!t.grades.includes(grade)) errors.push(`g${grade} w${b.from}: ${t.id} is not for grade ${grade}`);
      }
    }
  }
  return errors;
}

// Where each step of a day plan sits in its day type: period (by number) and slots (by title).
// One step can fill two slots (Math period 3 prints game and remedial work as one step).
export function slotsOf(lesson, dayType) {
  return lesson.phases.map(phase => {
    const {number} = periodOf(phase);
    const period = dayType.periods.find(p => p.number.join() === number.join());
    const slots = (period?.slots || []).filter(s => s.match && new RegExp(s.match, 'u').test(phase.title));
    return {step: phase.id, period: period ? number : null, slots: slots.map(s => s.id)};
  });
}

// Problems with one published v1 lesson against the structure (empty = it fits).
export function checkV1Lesson(lesson, structure) {
  const {block, dayType} = dayTypeFor(structure, lesson.grade, lesson.week, lesson.day);
  if (!block.inApp || !dayType) return [`${block.kind} week has no day plans`];
  const problems = [];
  if (V1_FORM[lesson.structure] !== dayType.planForm)
    problems.push(`v1 ${lesson.structure} but ${dayType.id} is ${dayType.planForm}`);
  if (dayType.planForm !== 'daily-plan') return problems;
  const want = dayType.periods.filter(p => p.role !== 'open').map(p => p.number.join('+'));
  const have = [...new Set(lesson.phases.map(p => periodOf(p).number.join('+')))];
  if (want.join() !== have.join()) problems.push(`periods ${have} (day type ${want})`);
  const slots = slotsOf(lesson, dayType);
  for (const period of dayType.periods)
    for (const slot of period.slots || [])
      if (slot.match && !slots.some(s => s.slots.includes(slot.id))) problems.push(`no step for slot ${slot.id}`);
  return problems;
}

// Every v1 lesson of a pack: its day type, and problems that are not recorded exceptions.
export function classify(pack, lessons, structure = loadStructure(pack)) {
  const expected = new Map(structure.exceptions.map(e => [e.lesson, e]));
  const byType = {}, unexpected = [], excused = [];
  for (const lesson of lessons) {
    const {dayType} = dayTypeFor(structure, lesson.grade, lesson.week, lesson.day);
    byType[dayType?.id ?? 'none'] = (byType[dayType?.id ?? 'none'] || 0) + 1;
    const problems = checkV1Lesson(lesson, structure);
    if (problems.length) (expected.has(lesson.id) ? excused : unexpected).push({id: lesson.id, problems});
  }
  const unused = [...expected.keys()].filter(id => !excused.some(e => e.id === id));
  return {byType, unexpected, excused, unusedExceptions: unused};
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const {CURRICULA} = await import('../../dist/curricula.mjs');
  const packs = process.argv.slice(2);
  let failed = false;
  for (const c of CURRICULA.filter(c => !packs.length || packs.includes(c.id))) {
    const structure = loadStructure(c.id);
    const errors = checkStructure(structure), r = classify(c.id, c.lessons, structure);
    console.log(`\n${c.id}: ${c.lessons.length} lessons`);
    for (const [t, n] of Object.entries(r.byType)) console.log(`  ${String(n).padStart(4)}  ${t}`);
    for (const e of errors) console.log(`  ✗ ${e}`);
    for (const u of r.unexpected) console.log(`  ✗ ${u.id}: ${u.problems.join('; ')}`);
    for (const x of r.excused) console.log(`  ~ ${x.id} (recorded exception): ${x.problems.join('; ')}`);
    for (const id of r.unusedExceptions) console.log(`  ✗ exception ${id} no longer needed`);
    failed ||= errors.length + r.unexpected.length + r.unusedExceptions.length > 0;
  }
  process.exit(failed ? 1 : 0);
}
