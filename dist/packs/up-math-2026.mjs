import {LESSONS} from '../data.mjs?v=r68';

export const UP_MATH_2026={
  id:'up-math-2026',
  state:'UP',stateLabel:'UP',subject:'math',academicYear:'2026–27',
  label:{hi:'उत्तर प्रदेश · गणित · 2026–27',en:'Uttar Pradesh · Mathematics · 2026–27'},
  subjectLabel:{hi:'गणित',en:'Mathematics'},
  storageKey:'up-sandarshika-2026-v1',
  lessons:LESSONS,
  resources:'resources.json',worksheets:'worksheets.json',
  outcomeLabel:{hi:'निपुण कोड',en:'NIPUN code'},
  sourceLanguage:{hi:'हिन्दी',en:'Hindi'},
  // Allocations visually verified on these source pages only; never inherit by grade.
  phaseTimingNotes:{
    'g1-math-w09-d01':{practice:{hi:'30 + 10 मिनट',en:'30 + 10 min'},support:{hi:'20 + 20 मिनट',en:'20 + 20 min'}},
    'g3-math-w01-d01':{support:{hi:'40 मिनट · रिमीडियल 20 मिनट',en:'40 min · remedial work 20 min'}}
  },
  useUPStageLabels:true,
  visualStyle:{
    layouts:{1:'up-12',2:'up-12',3:'up-3'},
    palette:{blue:'#367da8',teaching:'#efb05f',practice:'#e28f98',support:'#bba2c6',question:'#ffd32c'},
    gradePalettes:{3:{teaching:'#ffcd00',practice:'#367da8',support:'#124e70'}},
    weeklyPalette:{4:'#42403e',5:'#cd8b69',6:'#91a64d'},
    gradeWeeklyPalettes:{3:{4:'#cbbfa3',5:'#c8715a',6:'#89a20b'}},
    overrides:{
      'g1-math-w09-d01':{
        'i-do':{rect:[.09,.342,.321,.457],alt:{hi:'मेज पर किताब, मेज के नीचे बोतल, पास में कुर्सी और दूर रखा बैग; चित्र में ऊपर, नीचे, पास और दूर के कथन हैं।',en:'A book on the table, a bottle underneath, a chair nearby and a bag farther away, with positional speech labels.'}},
        'we-do':{rect:[.085,.484,.335,.573],alt:{hi:'मेज के ऊपर पेंसिल और निर्देश देती बोली: पेंसिल मेज के ऊपर रखो।',en:'A pencil on a table with the instruction to place the pencil on top.'}},
        'you-do':{rect:[.08,.607,.33,.709],alt:{hi:'शिक्षक के साथ पेड़ और पशु-पक्षियों का पोस्टर; बच्चे पास, दूर, ऊपर और नीचे की स्थिति पहचानते हैं।',en:'A teacher beside a poster of a tree, animals and birds used to identify spatial positions.'}}
      },
      'g2-math-w01-d01':{
        'i-do':{rect:[.09,.342,.321,.457]},
        'we-do':{rect:[.085,.484,.335,.573]},
        'you-do':{rect:[.08,.607,.33,.709]}
      }
    }
  },
  reviewPages:{1:{13:35,20:62},2:{13:68,20:94},3:{13:67,20:93}},
  coverage:{hi:"गणित · कक्षा 1: सप्ताह 9–25; कक्षा 2 और 3: सप्ताह 1–25। सप्ताह 13 और 20 के पुनरावृत्ति पृष्ठ अलग उपलब्ध हैं। विषय समूह ऐप में शिक्षण उद्देश्यों के आधार पर बनाए गए हैं।",en:"Mathematics \u00b7 Grade 1: Weeks 9\u201325; Grades 2\u20133: Weeks 1\u201325. Weeks 13 and 20 have separate review guidance. Topics are grouped in this app from the teaching objectives."}
};
