import type { Rule } from '@twind/core';
import type { TailwindTheme } from '@twind/preset-tailwind';

export const translateRules: Rule<TailwindTheme>[] = [
  [
    '-?translate-x-(\\s*\\d+|\\[(.*)])',
    (match) => {
      const isNegative = match.input.startsWith('-');
      const hasArbitrary = match[2] !== undefined;
      return {
        transform: `translate(${isNegative ? '-' : ''}${
          hasArbitrary ? match[2] : `${match[1]}rem`
        })`,
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
