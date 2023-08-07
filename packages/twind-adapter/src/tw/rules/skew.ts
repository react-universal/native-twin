import type { TailwindTheme, Rule, BaseTheme } from '@universal-labs/tailwind';

export const skewRules: Rule<BaseTheme & TailwindTheme>[] = [
  [
    '-?skew-x-(\\s*\\d+|\\[(.*)])',
    (match, context) => {
      const themeValue = context.theme('skew', match[1]!, match[2] ?? match[1]);
      const isNegative = match.input.startsWith('-');
      return {
        transform: `skewX(${isNegative ? '-' : ''}${themeValue})`,
      };
    },
  ],
  [
    '-?skew-y-(\\s*\\d+|\\[(.*)])',
    (match) => {
      const isNegative = match.input.startsWith('-');
      const hasArbitrary = match[2] !== undefined;
      return {
        transform: `skewY(${isNegative ? '-' : ''}${
          hasArbitrary ? match[2] : `${match[1]}deg`
        })`,
      };
    },
  ],
];
