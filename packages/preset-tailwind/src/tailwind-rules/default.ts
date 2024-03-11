import type { Rule } from '@universal-labs/native-twin';
import { TailwindPresetTheme } from '../types/theme.types';
import { textAlignsRules, verticalAlignsRules } from './align';
import { backgroundRules } from './background';
import { appearanceRules, outlineRules } from './behaviors';
import { borderRules } from './border';
import { flexRules } from './flex';
import { layoutThemeRules } from './layout';
import { opacityRules } from './opacity';
import { positionRules } from './position';
import { boxShadowRules } from './shadows';
import { sizeRules } from './size';
import { spacingRules } from './spacing';
import { translateRules } from './transform';
import { fontThemeRules } from './typography';

export const themeRules: Rule<TailwindPresetTheme>[] = [
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
  boxShadowRules,
  translateRules,
].flat(1) as Rule[];
