import { matchThemeColor, matchThemeValue } from '@native-twin/native-twin';
import type { Rule } from '@native-twin/native-twin';
import { TailwindPresetTheme } from '../types/theme.types';

export const fontThemeRules: Rule<TailwindPresetTheme>[] = [
  matchThemeValue('text-', 'fontSize', 'fontSize'),
  matchThemeColor('text-', 'color'),
  matchThemeValue('font-', 'fontWeight', 'fontWeight'),
  matchThemeValue('font-', 'fontFamily', 'fontFamily'),
  matchThemeValue('leading-', 'lineHeight', 'lineHeight'),
  matchThemeColor('decoration-', 'textDecorationColor'),
  matchThemeValue('decoration-', 'textDecorationStyle', 'textDecorationStyle'),
  matchThemeValue('capitalize|uppercase|lowercase', 'textTransform', 'textTransform'),
  matchThemeValue('italic|normal', 'fontStyle', 'fontStyle'),
];
