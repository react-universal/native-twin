import type { Rule } from '../../types/config.types';
import { textAlignsRules, verticalAlignsRules } from './align';
import { backgroundRules } from './background';
import { appearanceRules, outlineRules } from './behaviors';
import { borderRules } from './border';
import { flexRules } from './flex';
import { positionRules } from './position';
import { spacingRules } from './spacing';

export const themeRules: Rule[] = [
  backgroundRules,
  flexRules,
  spacingRules,
  positionRules,
  textAlignsRules,
  borderRules,
  outlineRules,
  verticalAlignsRules,
  appearanceRules,
].flat(1);
