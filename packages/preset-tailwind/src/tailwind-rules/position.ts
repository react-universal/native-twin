import { matchThemeValue } from '@native-twin/core';
import type { Rule } from '@native-twin/core';
import { TailwindPresetTheme } from '../types/theme.types';
import { DEFAULT_META } from '../constants';

export const positionRules: Rule<TailwindPresetTheme>[] = [
  matchThemeValue('top-', 'spacing', 'top', {
    ...DEFAULT_META,
    canBeNegative: true,
  }),
  matchThemeValue('left-', 'spacing', 'left', {
    ...DEFAULT_META,
    canBeNegative: true,
  }),
  matchThemeValue('bottom-', 'spacing', 'bottom', {
    ...DEFAULT_META,
    canBeNegative: true,
  }),
  matchThemeValue('right-', 'spacing', 'right', {
    ...DEFAULT_META,
    canBeNegative: true,
  }),
  matchThemeValue('absolute', 'position', 'position'),
  matchThemeValue('relative', 'position', 'position'),
  matchThemeValue('z-', 'zIndex', 'zIndex', {
    ...DEFAULT_META,
    canBeNegative: true,
  }),
];
