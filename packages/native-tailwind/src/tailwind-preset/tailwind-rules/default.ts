import type { Rule } from '../../types/config.types';
import { textAlignsRules, verticalAlignsRules } from './align';
import { backgroundRules } from './background';
import { appearanceRules, outlineRules } from './behaviors';
import { borderRules } from './border';

export const themeRules: Rule[] = [
  outlineRules,
  verticalAlignsRules,
  borderRules,
  textAlignsRules,
  appearanceRules,
  backgroundRules,
].flat(1);
