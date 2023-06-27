import type { Rule } from '@twind/core';
import type { TailwindTheme } from '@twind/preset-tailwind';

export const translateRules: Rule<TailwindTheme>[] = [
  [
    '-?translate-x-(\\s*\\d+|\\[(.*)])',
    (match, context) => {
      const themeValue = context.theme('translate', match[1]!, match[2] ?? match[1]);
      const isNegative = match.input.startsWith('-');
      return {
        transform: `translate(${isNegative ? '-' : ''}${themeValue})`,
      };
    },
  ],
  [
    '-?translate-y-(\\s*\\d+|\\[(.*)])',
    (match) => {
      const isNegative = match.input.startsWith('-');
      const hasArbitrary = match[2] !== undefined;
      return {
        transform: `translate(0, ${isNegative ? '-' : ''}${
          hasArbitrary ? match[2] : `${match[1]}rem`
        })`,
      };
    },
  ],
  [
    '-?translate-(\\s*\\d+|\\[(.*)])',
    (match, context) => {
      console.log('MATCH: ', match);
      console.log('CONTEXT: ', context);
      const isNegative = match.input.startsWith('-');
      const hasArbitrary = match[2] !== undefined;
      return {
        transform: `translate(${isNegative ? '-' : ''}${
          hasArbitrary ? match[2] : `${match[1]}rem`
        }, ${isNegative ? '-' : ''}${hasArbitrary ? match[2] : `${match[1]}rem`})`,
      };
    },
  ],
];
