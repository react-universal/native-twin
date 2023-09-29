/**********************************************
 * Readapted from Twind                       *
 * Credits: @sastan https://github.com/sastan *
 * Repo: https://github.com/tw-in-js/twind    *
 * ********************************************
 */
import { parseTWTokens } from '@universal-labs/css';
import { defineConfig } from './config/define-config';
import { createVirtualSheet } from './css/sheets';
import { setup } from './runtime/tw';
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
  let cache = new Map<string, SheetEntry[]>();
  const insertedRules = new Set<string>();

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

        const ruleData = context.r(rule);
        if (ruleData) {
          if (!insertedRules.has(className)) {
            insertedRules.add(className);
            sheet.insert(ruleData);
          }
          styles.push(ruleData);
        }
      }
      cache.set(tokens, styles);

      return styles;
    } as RuntimeTW<__Theme__ & Theme>,
    Object.getOwnPropertyDescriptors({
      get sheet(): Sheet<SheetEntry[]> {
        return sheet;
      },

      get target(): SheetEntry[] {
        return sheet.target;
      },

      theme: context.theme,
      get config() {
        return config;
      },

      snapshot() {
        const restoreSheet = sheet.snapshot();
        const cache$ = new Map(cache);

        return () => {
          restoreSheet();

          cache = cache$;
        };
      },

      clear() {
        sheet.clear();

        cache = new Map();
      },

      destroy() {
        this.clear();
        sheet.destroy();
      },
    }),
  );
  setup(runtime);
  return runtime;
}

// const test = createTailwind({});
// test('min-w-full'); //?
