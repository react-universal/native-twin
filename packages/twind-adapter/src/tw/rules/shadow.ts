import type { Rule } from '@twind/core';
import type { TailwindTheme } from '@twind/preset-tailwind';

export const shadowRules: Rule<TailwindTheme>[] = [
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
