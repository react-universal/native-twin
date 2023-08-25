import { createContext } from './theme/context';
import { BaseTheme } from './theme.types';
import { match, matchColor, matchTheme } from './theme/rules';
import { createTailwindConfig } from './config/define-config';

function createTailwind(_config: any) {
  const config = createTailwindConfig({
    ignorelist: [],
    rules: [
      matchColor('bg-', { section: 'backgroundColor', opacityVariable: false }),
      matchColor('text-', { property: 'color' }),
      matchTheme('w-', 'width'),
      matchTheme('-?p-', 'padding'),
      match('hidden', { display: 'none' }),
      match(
        [
          '(block|flex|table|grid|inline|contents|flow-root|list-item)',
          '(inline-(block|flex|table|grid))',
          '(table-(caption|cell|column|row|(column|row|footer|header)-group))',
        ],
        'display',
      ),
      matchTheme('-?translate-(x|y)-', 'translate', (match) => {
        const hasX = match[1] == 'x' ? match._ : '0';
        const hasY = match[1] == 'y' ? match._ : '0';
        return {
          transform: `translate(${hasX}, ${hasY})`,
        };
      }),
      matchTheme('-?(translate)-', 'translate', (match) => {
        return {
          transform: `translate(${match._}, ${match._})`,
        };
      }),
      matchTheme('decoration-', 'textDecorationThickness'),
    ],
  });
  const context = createContext<BaseTheme>(config);
  return context;
}
