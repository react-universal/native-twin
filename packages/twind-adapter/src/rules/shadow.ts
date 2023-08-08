import type { Rule, BaseTheme } from '@universal-labs/twind-native';
import { TailwindTheme } from '../tailwind-theme';

export const shadowRules: Rule<BaseTheme & TailwindTheme>[] = [
  [
    'shadow-(.*)',
    (match, context) => {
      const themeValue = context.theme('boxShadow', match[1]!, match[2] ?? match[1]);
      return {
        boxShadow: themeValue,
      };
    },
  ],
  [
    'ring-(.*)',
    (match, context) => {
      const themeValue = context.theme('ringWidth', match[1]!, match[2] ?? match[1]);
      return {
        border: themeValue,
        margin: `-${themeValue}`,
      };
    },
  ],
];
