import type { Rule } from '../../types/config.types';
import { textAlignsRules, verticalAlignsRules } from './align';
import { appearanceRules, outlineRules } from './behaviors';
import { borderRules } from './border';

export const themeRules: Rule[] = [
  outlineRules,
  verticalAlignsRules,
  borderRules,
  textAlignsRules,
  appearanceRules,
].flat(1);
