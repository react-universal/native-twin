import { matchThemeValue } from '@native-twin/core';
import type { Rule } from '@native-twin/core';
import { DEFAULT_META } from '../constants';
import { TailwindPresetTheme } from '../types/theme.types';

export const transitionRules: Rule<TailwindPresetTheme>[] = [
  matchThemeValue('transition-', 'transition', 'transition', {
    ...DEFAULT_META,
    support: ['web'],
  }),
];

export const durationRules: Rule<TailwindPresetTheme>[] = [
  matchThemeValue('duration-', 'duration', 'transitionDuration', {
    ...DEFAULT_META,
  }),
];
