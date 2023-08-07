import type { TailwindTheme, Rule, BaseTheme } from '@universal-labs/tailwind';

export const translateRules: Rule<BaseTheme & TailwindTheme>[] = [
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
    (match) => {
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
