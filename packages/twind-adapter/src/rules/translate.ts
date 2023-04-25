import { TwindRules } from '../types';

export const translateRules: TwindRules = [
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
