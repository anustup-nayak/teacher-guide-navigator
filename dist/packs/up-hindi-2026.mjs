import {LESSONS,VISUAL_OVERRIDES} from './up-hindi-2026/catalog.mjs?v=r56';

// UP Hindi (भाषा) 2026–27: a separate delivery in the same UP 2026–27 group as Math, with its own
// permanent storage namespace. Lessons, palette and grid crops come from the Hindi Teacher Guides.
export const UP_HINDI_2026={
  id:'up-hindi-2026',
  state:'UP',stateLabel:'UP',subject:'hindi',academicYear:'2026–27',
  label:{hi:'उत्तर प्रदेश · हिन्दी · 2026–27',en:'Uttar Pradesh · Hindi · 2026–27'},
  subjectLabel:{hi:'हिन्दी',en:'Hindi'},
  storageKey:'up-hindi-sandarshika-2026-v1',
  lessons:LESSONS,
  resources:'packs/up-hindi-2026/resources.json',worksheets:'packs/up-hindi-2026/worksheets.json',
  sourceLanguage:{hi:'हिन्दी',en:'Hindi'},
  useUPStageLabels:false,
  // Period bands as printed: कालांश 1 orange, 2 pink, 3 purple; blue identity.
  visualStyle:{palette:{blue:'#2d6f9b',teaching:'#faa74a',practice:'#f48a90',support:'#c7a0cb'},overrides:VISUAL_OVERRIDES},
  // Review weeks are one-page tables in each guide (badges checked on these PDF pages).
  reviewPages:{1:{13:43,20:80},2:{13:91,20:128},3:{13:91,20:128}},
  coverage:{hi:'हिन्दी · कक्षा 1: सप्ताह 9–25; कक्षा 2 और 3: सप्ताह 1–25। हर दिन तीन कालांश; दिवस 6 को साप्ताहिक आकलन। सप्ताह 13 और 20 के पुनरावृत्ति पृष्ठ अलग उपलब्ध हैं। विषय समूह संदर्शिका के “वार्षिक शिक्षण उद्देश्य” से लिए गए हैं।',en:'Hindi · Grade 1: Weeks 9–25; Grades 2–3: Weeks 1–25. Three periods a day; day 6 is the weekly assessment. Weeks 13 and 20 have separate review pages. Topics follow each guide’s annual teaching objectives.'}
};
