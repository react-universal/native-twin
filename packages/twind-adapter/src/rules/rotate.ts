import type { Rule, BaseTheme } from '@universal-labs/twind-native';
import { TailwindTheme } from '../tailwind-theme';

export const rotateRules: Rule<BaseTheme & TailwindTheme>[] = [
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
