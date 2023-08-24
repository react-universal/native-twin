import { createContext } from './theme/context';
import * as colors from './theme/colors';
import { baseTailwindTheme } from './theme/baseTheme';
import { TailwindTheme } from './theme/theme.types';
import { matchColor, matchTheme } from './theme/rules';

function createTailwind(_config: any) {
  const context = createContext<TailwindTheme>({
    ignorelist: [],
    rules: [
      matchColor('bg-', { section: 'backgroundColor', opacityVariable: false }),
      matchColor('text-', { property: 'color' }),
      matchTheme('decoration-', 'textDecorationThickness'),
      ['w-', 'width'],
      ['-?p-', 'padding'],
      [
        '-?translate-(x|y)-',
        (match, context) => {
          const themeValue = context.theme('translate', match[2]!);
          const isNegative = match.input.startsWith('-');
          const hasX = match[1] == 'x' ? `${isNegative ? '-' : ''}${themeValue}` : '0'; //?
          const hasY = match[1] == 'y' ? `${isNegative ? '-' : ''}${themeValue}` : '0'; //?
          return {
            transform: `translate(${hasX}, ${hasY})`,
          };
        },
      ],
      [
        '-?(translate)-',
        (match, context) => {
          const isNegative = match.input.startsWith('-');
          const themeValue = context.theme(
            'translate',
            match.$$!,
            match.$$.replace(/[\[\]]/g, '')!,
          ); //?
          const hasArbitrary = match[2] !== undefined;
          return {
            transform: `translate(${isNegative ? '-' : ''}${
              hasArbitrary ? match[2] : themeValue
            }, ${isNegative ? '-' : ''}${hasArbitrary ? match[2] : themeValue})`,
          };
        },
      ],
    ],
    theme: {
      colors,
      ...baseTailwindTheme,
    },
  });
  // context.r('-p-2'); //?
  // context.theme('backgroundColor.blue.200'); // ?
  // context.theme('textDecorationThickness.0'); // ?
  return context.r('-translate-2'); // ?
}

createTailwind({}); // ?
