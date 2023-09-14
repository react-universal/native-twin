import type { Rule } from '../../types/config.types';
import { textAlignsRules, verticalAlignsRules } from './align';
import { backgroundRules } from './background';
import { appearanceRules, outlineRules } from './behaviors';
import { borderRules } from './border';
import { flexRules } from './flex';
import { layoutThemeRules } from './layout';
import { opacityRules } from './opacity';
import { positionRules } from './position';
import { sizeRules } from './size';
import { spacingRules } from './spacing';
import { fontThemeRules } from './typography';

export const themeRules: Rule[] = [
  backgroundRules,
  flexRules,
  spacingRules,
  sizeRules,
  fontThemeRules,
  positionRules,
  textAlignsRules,
  borderRules,
  layoutThemeRules,
  opacityRules,
  outlineRules,
  verticalAlignsRules,
  appearanceRules,
].flat(1);
