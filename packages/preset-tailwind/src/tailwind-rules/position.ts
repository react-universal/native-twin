import { matchThemeValue } from '@native-twin/core';
import type { Rule } from '@native-twin/core';
import { TailwindPresetTheme } from '../types/theme.types';

export const positionRules: Rule<TailwindPresetTheme>[] = [
  matchThemeValue('top-', 'spacing', 'top', {
    canBeNegative: true,
  }),
  matchThemeValue('left-', 'spacing', 'left', {
    canBeNegative: true,
  }),
  matchThemeValue('bottom-', 'spacing', 'bottom', {
    canBeNegative: true,
  }),
  matchThemeValue('right-', 'spacing', 'right', {
    canBeNegative: true,
  }),
  matchThemeValue('absolute', 'position', 'position'),
  matchThemeValue('relative', 'position', 'position'),
  matchThemeValue('z-', 'zIndex', 'zIndex', {
    canBeNegative: true,
  }),
];
