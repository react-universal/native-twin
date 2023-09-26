/**********************************************
 * Readapted from Twind                       *
 * Credits: @sastan https://github.com/sastan *
 * Repo: https://github.com/tw-in-js/twind    *
 * ********************************************
 */
import { parseTWTokens } from '@universal-labs/css/tailwind';
import { defineConfig } from './config/define-config';
import { createVirtualSheet } from './css/sheets';
import { setup } from './runtime';
import { createThemeContext } from './theme/theme.context';
import type { TailwindConfig, TailwindUserConfig } from './types/config.types';
import type { Sheet, SheetEntry } from './types/css.types';
import type { RuntimeTW, __Theme__ } from './types/theme.types';
import { interpolate, toClassName } from './utils/string-utils';

export function createTailwind<Theme = __Theme__>(
  userConfig: TailwindUserConfig<Theme>,
  sheet = createVirtualSheet(),
): RuntimeTW<__Theme__ & Theme> {
  const config = defineConfig(userConfig) as TailwindConfig<__Theme__>;
  const context = createThemeContext<__Theme__>(config);
  const cache = new Map<string, SheetEntry[]>();

  const runtime = Object.defineProperties(
    function tw(tokens) {
      tokens = interpolate`${[tokens]}`;
      if (cache.has(tokens)) {
        return cache.get(tokens);
      }
      const styles: SheetEntry[] = [];
      for (const rule of parseTWTokens(tokens)) {
        if (!context.v(rule.v)) continue;
        if (rule.n == 'group') {
          styles.push({
            className: 'group',
            declarations: [],
            group: 'base',
            rule,
          });
          continue;
        }
        const className = toClassName(rule);

        const style = sheet.getClassName(className);
        if (style) {
          styles.push(style);
        } else {
          const ruleData = context.r(rule);
          if (ruleData) {
            sheet.insert(ruleData);
            styles.push(ruleData);
          }
        }
      }
      cache.set(tokens, styles);

      return styles;
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

// const tw = createTailwind({});

// tw('shadow-sm'); //?
