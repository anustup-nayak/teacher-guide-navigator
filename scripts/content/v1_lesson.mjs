// Convert a published v1 lesson record into a content-model lesson (schemas/content-model/
// lesson.schema.json). Text, minutes and page rectangles are copied, never rewritten; the
// v1 phase ids become step ids so teacher data keyed on them keeps working.
//
// Links the v1 record cannot supply (routine, unit, outcomes, guide sections) come from the
// caller, each with its own provenance. The day type and each step's slots come from the
// program structure (scripts/content/structure.mjs: dayTypeFor and slotsOf).
// Phase 2 uses this for the worked examples; Phase 3 grows it into the compiler's importer.

const PAGE = /(source|workbook)\/g(\d)-p(\d{3})\.webp$/;
const REVIEW = {'source-compared': 'source-compared'};

export function pageRef(image, docs, rect) {
  const m = image?.match(PAGE);
  if (!m) return null;
  const ref = {doc: docs[m[1] === 'source' ? 'guide' : 'workbook'], pdf: +m[3], printed: +m[3] - 2};
  if (rect) ref.rect = rect;
  return ref;
}

// Hindi phases carry `period: "2 एवं 3 · label"`; Math phases carry `subtitle: "… · कालांश 2"`.
export function periodOf(phase) {
  if (phase.period) {
    const [nums, label] = phase.period.split(' · ');
    return {number: nums.split(' एवं ').map(Number), label};
  }
  const n = phase.subtitle?.match(/कालांश\s*(\d)/);
  return {number: [n ? +n[1] : 1], label: null};
}

export function lessonFromV1(lesson, {docs, routineFor, unit, outcomes = [], objectives = [], dayType, slots = [], guideLinks = []}) {
  const periods = [];
  lesson.phases.forEach((phase, i) => {
    const {number, label} = periodOf(phase);
    let period = periods.find(p => p.number.join() === number.join());
    if (!period) {
      period = {number, ...(label ? {label} : {}), ...(phase.role ? {role: phase.role} : {}), steps: []};
      periods.push(period);
    }
    const review = REVIEW[phase.extraction] || 'unreviewed';
    const step = {id: phase.id, title: phase.title, minutes: phase.minutes ?? null};
    if (slots[i]?.slots.length) step.slots = slots[i].slots;
    const routine = routineFor(phase, lesson);
    if (routine) step.routine = routine;
    step.actions = phase.actions;
    if (phase.questions?.length) step.questions = phase.questions;
    const sheets = phase.worksheetPreview || phase.id === 'practice' ? lesson.worksheets : [];
    if (sheets.length) step.workbook = sheets.map(w => ({to: `workbook:${docs.workbook}/p${w.pdfPage}`, assertion: 'stated', review,
      source: pageRef(phase.image, docs)}));
    const source = pageRef(phase.image, docs, phase.sourceRect);
    if (source) step.source = source;
    step.provenance = {assertion: 'stated', review};
    period.steps.push(step);
  });
  const source = pageRef(lesson.source.image, docs);
  return {
    id: lesson.id, grade: lesson.grade, week: lesson.week, day: lesson.day,
    ...(unit ? {unit} : {}), dayType, title: lesson.title, outcomes, objectives, periods,
    assessment: [], guideLinks, source,
    v1: {structure: lesson.structure, phaseIds: lesson.phases.map(p => p.id)},
    provenance: {assertion: 'stated', review: lesson.contentStatus === 'source-compared' ? 'source-compared' : 'unreviewed', sources: [source]}
  };
}
