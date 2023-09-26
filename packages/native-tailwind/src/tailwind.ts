/**********************************************
 * Readapted from Twind                       *
 * Credits: @sastan https://github.com/sastan *
 * Repo: https://github.com/tw-in-js/twind    *
 * ********************************************
 */
import { parseTWTokens } from '@universal-labs/css/tailwind';
import { defineConfig } from './config/define-config';
import { createVirtualSheet } from './css/sheets';
import { createComponentSheet, getStyleData } from './css/style.compositions';
import { setup } from './runtime';
import { createThemeContext } from './theme/theme.context';
import type { TailwindConfig, TailwindUserConfig } from './types/config.types';
import type { Sheet, SheetEntry } from './types/css.types';
import type { ComponentSheet, RuntimeTW, __Theme__ } from './types/theme.types';
import { interpolate, toClassName } from './utils/string-utils';

export function createTailwind<Theme = __Theme__>(
  userConfig: TailwindUserConfig<Theme>,
  sheet = createVirtualSheet(),
): RuntimeTW<__Theme__ & Theme> {
  const config = defineConfig(userConfig) as TailwindConfig<__Theme__>;
  const context = createThemeContext<__Theme__>(config);
  const cache = new Map<string, ComponentSheet>();

  const runtime = Object.defineProperties(
    function tw(tokens) {
      tokens = interpolate`${[tokens]}`;
      if (cache.has(tokens)) {
        return cache.get(tokens);
      }
      const styles: SheetEntry[] = [];
      let isGroupParent = false;
      for (const rule of parseTWTokens(tokens)) {
        if (rule.n == 'group') isGroupParent = true;
        if (!context.v(rule.v)) continue;
        const className = toClassName(rule);

        const style = sheet.getClassName(className);
        if (style) {
          styles.push(style);
        } else {
          const ruleData = context.r(rule);
          if (ruleData) {
            const ruleStyles = getStyleData(rule, ruleData); //?
            sheet.insert(ruleStyles);
            styles.push(ruleStyles);
          }
        }
      }
      const componentSheet = createComponentSheet(styles);
      cache.set(tokens, {
        ...componentSheet,
        metadata: {
          isGroupParent,
          hasGroupEvents: styles.some((x) => x[1] == 'group'),
          hasPointerEvents: styles.some((x) => x[1] == 'pointer'),
        },
      });

      return cache.get(tokens);
    } as RuntimeTW<__Theme__ & Theme>,
    Object.getOwnPropertyDescriptors({
      get sheet(): Sheet<SheetEntry> {
        return sheet;
      },
      theme: context.theme,
      config,
    }),
  );
  setup(runtime);
  return runtime;
}

// const tailwind = createTailwind({
//   ignorelist: [],
//   theme: {
//     extend: {
//       colors: {
//         primary: '#0558f9',
//       },
//       borderWidth: {
//         sm: '100px',
//       },
//       fontFamily: {
//         inter: 'Inter-Regular',
//         'inter-bold': 'Inter-Bold',
//       },
//     },
//   },
// });

// tailwind(`text-[16px] font-[#fff] hover:bg-blue/10`).getStyles({
//   isParentActive: false,
//   isPointerActive: false,
// }); //?
