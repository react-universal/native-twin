import type { Rule } from '../../types/config.types';
import { textAlignsRules, verticalAlignsRules } from './align';
import { backgroundRules } from './background';
import { appearanceRules, outlineRules } from './behaviors';
import { borderRules } from './border';
import { flexRules } from './flex';
import { opacityRules } from './opacity';
import { positionRules } from './position';
import { spacingRules } from './spacing';
import { fontThemeRules } from './typography';

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
  opacityRules,
  fontThemeRules,
].flat(1);
