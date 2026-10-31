import {UP_MATH_2026} from './packs/up-math-2026.mjs?v=r56';
import {UP_HINDI_2026} from './packs/up-hindi-2026.mjs?v=r56';
export {selectCurriculum,gradesFor,reviewWeeksFor,validateCurricula} from './domain/curriculum.mjs?v=r56';

// Existing query-less links resolve to the first pack. No empty demo packs.
export const CURRICULA=[UP_MATH_2026,UP_HINDI_2026];
