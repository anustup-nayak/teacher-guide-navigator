// Write the Phase 2 worked examples in docs/content-model/examples/: one Hindi day
// (g1-hindi-w09-d02) and one Math day (g1-math-w09-d01), each with the program, outcome,
// routine and guide records it links to. Lesson text comes from the published v1 catalog;
// guide passages come from the decoded front matter (run scripts/content/extract_matter.py).
// The small hand-entered records below cite the page they were read from. Day types and step
// slots come from each pack's program structure (curricula/<pack>/model/structure.json).
import fs from 'node:fs';
import {CURRICULA} from '../../dist/curricula.mjs';
import {lessonFromV1} from './v1_lesson.mjs';
import {loadStructure, dayTypeFor, slotsOf} from './structure.mjs';

const OUT = new URL('../../docs/content-model/examples/', import.meta.url);
const ROOT = new URL('../../', import.meta.url);
const [math, hindi] = CURRICULA;
const HG = 'guide-g1-00970fd3c1e8', HW = 'workbook-g1-04678c7d6792';
const MG = 'guide-g1-167f09e3bf58', MW = 'workbook-g1-87d1e0f42ce2';
const at = (doc, pdf) => ({doc, pdf, printed: pdf - 2});
const stated = (doc, pdf, review = 'unreviewed') => ({assertion: 'stated', review, sources: [at(doc, pdf)]});
const link = (to, assertion, extra = {}) => ({to, assertion, review: 'unreviewed', ...extra});

function passages(doc, pdf) {
  const file = new URL(`curricula/up-hindi-2026/extracted/matter/${doc}.json`, ROOT);
  const page = JSON.parse(fs.readFileSync(file)).pages.find(p => p.pdfPage === pdf);
  return page.lines.map(l => l.text).filter(t => !/^कक्षा \d ।/.test(t));
}

// A coded NIPUN line, verbatim from the decoded page (code prefix removed).
function nipun(doc, pdf, code) {
  const line = passages(doc, pdf).find(t => t.startsWith(code + ' '));
  if (!line) throw new Error(`${code} not found on ${doc} p${pdf}`);
  return line.slice(code.length + 1);
}

// ---- Hindi -------------------------------------------------------------------------------
const hindiProgram = {
  pack: 'up-hindi-2026', state: 'UP', subject: 'hindi', academicYear: '2026–27', grades: [1, 2, 3],
  documents: [{id: HG, kind: 'guide', grade: 1, title: {hi: 'आधारशिला क्रियान्वयन शिक्षक संदर्शिका कक्षा 1 (भाषा)'}, edition: '2026-27'},
    {id: HW, kind: 'workbook', grade: 1, title: {hi: 'कार्यपुस्तिका सारंगी 1'}, edition: '2023-24 print'}],
  provenance: {assertion: 'stated', review: 'unreviewed', sources: [at(HG, 3)]}
};
const hindiOutcomes = {pack: 'up-hindi-2026', outcomes: [
  // Owner decision (31 Oct 2026): the guide's own list is primary for linking; the workbook's
  // coded list is kept alongside and joined only by reviewed crosswalk (`equivalent`) links.
  {id: 'g1-oral-language-1', grade: 1, list: 'guide', strand: 'oral-language', code: null, nipun: true, statement: 'अपनी आवश्यकताओं, परिचित व्यक्तियों एवं परिवेश के बारे में मित्रों, कक्षा शिक्षकों के साथ बातचीत करना और प्रश्न करना।',
    equivalent: [link('lo:H101', 'editorial')], provenance: {...stated(HG, 2), note: 'guide list (uncoded), primary; crosswalk to H101 is a project proposal awaiting review'}},
  {id: 'H101', grade: 1, list: 'workbook', strand: 'oral-language', code: 'H101', nipun: true, statement: nipun(HW, 2, 'H101'), provenance: stated(HW, 2)},
  {id: 'H104.2', grade: 1, list: 'workbook', strand: 'oral-language', code: 'H104.2', parent: 'H104', nipun: true, statement: nipun(HW, 2, 'H104.2'), provenance: stated(HW, 2)}]};
const hindiRoutines = {pack: 'up-hindi-2026', routines: [
  {id: 'hi-picture-chart', type: 'oral-language', name: 'चित्र चार्ट', aliases: ['चित्र चार्ट पर शिक्षक द्वारा चर्चा', 'चित्र चार्ट पर समृद्ध चर्चा', 'लेखन कार्य'], grades: [1], period: 1, section: 'g1/routines-period-1', provenance: stated(HG, 111)},
  {id: 'hi-big-book', type: 'reading', name: 'बिग बुक पर कार्य', aliases: ['आदर्श वाचन और लोगोग्राफिक पठन', 'साझा पठन और लोगोग्राफिक पठन'], grades: [1], period: 3, section: 'g1/routines-period-3', provenance: stated(HG, 131)},
  // Owner decision (31 Oct 2026): generic workbook steps share one practice routine.
  {id: 'hi-workbook-practice', type: 'practice', name: 'कार्यपुस्तिका (भाग-1) पर कार्य', aliases: ['कार्यपुस्तिका पर कार्य', 'गतिविधियों की संकल्पना पर कार्य'], grades: [1, 2, 3], period: 2, section: 'g1/period-outline', provenance: stated(HG, 18)},
  {id: 'hi-remedial-group-a', type: 'remediation', name: 'समूह-A के साथ रिमीडियल कार्य', grades: [1, 2, 3], period: 3, minutes: '20', section: 'g1/remedial-strategy', provenance: stated(HG, 135)}]};
const ROUTINE_BY_TITLE = {};
for (const r of hindiRoutines.routines) for (const t of [r.name, ...(r.aliases || [])]) ROUTINE_BY_TITLE[t] = r.id;

const structureOf = (pack, l) => {
  const {dayType} = dayTypeFor(loadStructure(pack), l.grade, l.week, l.day);
  return {dayType: dayType.id, slots: slotsOf(l, dayType)};
};
const hl = hindi.lessons.find(l => l.id === 'g1-hindi-w09-d02');
const hindiLesson = lessonFromV1(hl, {
  docs: {guide: HG, workbook: HW},
  routineFor: p => ROUTINE_BY_TITLE[p.title] ? link(`routine:${ROUTINE_BY_TITLE[p.title]}`, 'derived', {rule: 'step-title-matches-routine'})
    : /^गतिविधि[-\s]?\d/.test(p.title) && p.period?.startsWith('2') ? link('routine:hi-workbook-practice', 'derived', {rule: 'workbook-activity-title'}) : undefined,
  unit: link('unit:g1-u-w09-12', 'stated', {source: at(HG, 15)}),
  ...structureOf('up-hindi-2026', hl),
  guideLinks: [link('section:g1/weekly-cycle', 'derived', {rule: 'every-lesson-weekly-cycle'}),
    link('section:g1/article-checking-understanding', 'stated', {source: at(HG, 20)})]
});
const weeklyCycleText = passages(HG, 16);
const hindiGuide = {pack: 'up-hindi-2026', grade: 1, sections: [{
  id: 'g1/weekly-cycle', kind: 'program', area: 'at-a-glance', title: 'सप्ताह दिवस साप्ताहिक शिक्षण चक्र', pdf: [16, 16],
  passages: [{id: 'g1/weekly-cycle/1', order: 1, heading: 'सप्ताह के 6 दिवसों की कार्य योजना', sourceText: weeklyCycleText.slice(1, 12),
    summary: ['दिवस 1 से 4: नई दक्षताओं का शिक्षण।', 'दिवस 5: सीखी गई दक्षताओं की पुनरावृत्ति।', 'दिवस 6: साप्ताहिक आकलन।',
      'आकलन के आधार पर अगले सप्ताह के तीसरे कालांश का रिमीडियल कार्य तय करें।'],
    classroomActions: ['तीसरे कालांश के अंतिम 20 मिनट समूह-A के साथ रिमीडियल कार्य करें।'],
    source: at(HG, 16), provenance: {assertion: 'stated', review: 'unreviewed', note: 'summary and classroomActions are editorial and unreviewed; sourceText is the decoded page'}}],
  links: [link('lesson:g1-hindi-w09-d02', 'derived', {rule: 'every-lesson-weekly-cycle'})],
  provenance: stated(HG, 16)}]};

// ---- Math --------------------------------------------------------------------------------
const mathOutcomes = {pack: 'up-math-2026',
  // Owner decision (31 Oct 2026): Math outcomes group by printed code family, not strand names.
  outcomes: [{id: 'M101.1', grade: 1, family: 'M101', code: 'M101.1', parent: 'M101', nipun: true, statement: math.lessons.find(l => l.loCode === 'M101.1').loStatement, provenance: {...stated(MG, 2, 'source-compared'), note: 'statement as published in v1 (source-compared)'}}],
  objectives: [{id: 'g1-w09-o1', grade: 1, week: 9, statement: 'दूर-पास और ऊपर-नीचे की अवधारणा को समझना', outcomes: [link('lo:M101.1', 'stated', {source: at(MG, 8)})], provenance: stated(MG, 8)}]};
const mathRoutines = {pack: 'up-math-2026', routines: [
  {id: 'math-conversation', type: 'instruction', name: 'गणितीय बातचीत', grades: [1, 2, 3], period: 1, section: 'g1/teaching-process', provenance: stated(MG, 18)},
  {id: 'math-grr', type: 'instruction', name: 'मैं करूँ · हम करें · आप करो (GRR)', aliases: ['I do', 'We do', 'You do'], grades: [1, 2, 3], period: 1, section: 'g1/teaching-process', provenance: {...stated(MG, 87), note: 'GRR page has a text layer only in parts; check the image'}},
  {id: 'math-practice', type: 'practice', name: 'अभ्यास (कार्यपत्रक) + प्रक्रियात्मक प्रवाह', grades: [1, 2, 3], period: 2, provenance: stated(MG, 13)},
  {id: 'math-game-support', type: 'game', name: 'गणित खेल और रिमीडियल', grades: [1, 2, 3], period: 3, provenance: stated(MG, 13)}]};
const MATH_ROUTINE = {conversation: 'math-conversation', 'i-do': 'math-grr', 'we-do': 'math-grr', 'you-do': 'math-grr', practice: 'math-practice', support: 'math-game-support'};
const ml = math.lessons.find(l => l.id === 'g1-math-w09-d01');
const mathLesson = lessonFromV1(ml, {
  docs: {guide: MG, workbook: MW},
  routineFor: p => MATH_ROUTINE[p.id] && link(`routine:${MATH_ROUTINE[p.id]}`, 'derived', {rule: 'v1-phase-id-to-routine'}),
  unit: link('unit:g1-u-w09-11', 'stated', {source: at(MG, 17)}),
  outcomes: [link('lo:M101.1', 'stated', {source: at(MG, 18)})],
  objectives: [link('objective:g1-w09-o1', 'derived', {rule: 'objective-matches-lesson-title'})],
  ...structureOf('up-math-2026', ml),
  guideLinks: [link('section:g1/weekly-overview', 'derived', {rule: 'every-lesson-weekly-cycle'})]
});

const files = {
  'hindi/program.json': hindiProgram, 'hindi/outcomes.json': hindiOutcomes, 'hindi/routines.json': hindiRoutines,
  'hindi/guide-g1.json': hindiGuide, 'hindi/lesson-g1-hindi-w09-d02.json': hindiLesson,
  'math/outcomes.json': mathOutcomes, 'math/routines.json': mathRoutines, 'math/lesson-g1-math-w09-d01.json': mathLesson
};
for (const [name, data] of Object.entries(files)) {
  const target = new URL(name, OUT);
  fs.mkdirSync(new URL('.', target), {recursive: true});
  fs.writeFileSync(target, JSON.stringify(data, null, 1) + '\n');
}
console.log(`wrote ${Object.keys(files).length} examples`);
