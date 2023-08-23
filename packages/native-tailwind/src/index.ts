import { createContext } from './theme/context';
import * as colors from './theme/colors';
import { baseTailwindTheme } from './theme/baseTheme';

function createTailwind(_config: any) {
  const context = createContext({
    ignorelist: [],
    rules: [
      ['bg-', 'background-color'],
      ['w-', 'width'],
      ['-?p-', 'padding'],
      ['-?(translate-[xy])-', 'translate'],
    ],
    theme: {
      colors,
      ...baseTailwindTheme,
    },
  });
  context.theme('padding.1'); // ?
  return context.r('p-2');
}

createTailwind({}); //?
