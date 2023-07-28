import type { Rule } from '@twind/core';
import type { TailwindTheme } from '@twind/preset-tailwind';

export const rotateRules: Rule<TailwindTheme>[] = [
  [
    '-?rotate-x-(\\s*\\d+|\\[(.*)])',
    (match, context) => {
      const themeValue = context.theme('rotate', match[1]!, match[2] ?? match[1]);
      const isNegative = match.input.startsWith('-');
      return {
        transform: `rotate(${isNegative ? '-' : ''}${themeValue})`,
      };
    },
  ],
  [
    '-?rotate-y-(\\s*\\d+|\\[(.*)])',
    (match) => {
      const isNegative = match.input.startsWith('-');
      const hasArbitrary = match[2] !== undefined;
      return {
        transform: `rotate(0, ${isNegative ? '-' : ''}${
          hasArbitrary ? match[2] : `${match[1]}deg`
        })`,
      };
    },
  ],
  [
    '-?rotate-(\\s*\\d+|\\[(.*)])',
    (match, context) => {
      const themeValue = context.theme('rotate', match[1]!, match[2] ?? match[1]);
      const isNegative = match.input.startsWith('-');
      return {
        transform: `rotate(${isNegative ? '-' : ''}${themeValue})`,
      };
    },
  ],
];
