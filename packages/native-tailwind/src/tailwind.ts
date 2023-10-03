/**********************************************
 * Readapted from Twind                       *
 * Credits: @sastan https://github.com/sastan *
 * Repo: https://github.com/tw-in-js/twind    *
 * ********************************************
 */
import { defineConfig } from './config/define-config';
import { createVirtualSheet } from './css/sheets';
import { translateRuleSet } from './css/translate';
import { parseTWTokens } from './parsers/tailwind-classes.parser';
import { createThemeContext } from './theme/theme.context';
import type { TailwindConfig, TailwindUserConfig } from './types/config.types';
import type { Sheet, SheetEntry } from './types/css.types';
import type { RuntimeTW, __Theme__ } from './types/theme.types';
import { interpolate } from './utils/string-utils';

export function createTailwind<Theme = __Theme__, Target = unknown>(
  userConfig: TailwindUserConfig<Theme>,
  sheet: Sheet<Target> = createVirtualSheet() as Sheet<Target>,
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
      for (const rule of translateRuleSet(parseTWTokens(tokens), context)) {
        if (!insertedRules.has(rule.className)) {
          insertedRules.add(rule.className);
          sheet.insert(rule);
        }
        styles.push(rule);
      }
      cache.set(tokens, styles);

      return styles;
    } as RuntimeTW<__Theme__ & Theme>,
    Object.getOwnPropertyDescriptors({
      get sheet() {
        return sheet;
      },

      get target() {
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
  return runtime;
}

// const test = createTailwind({});
// test('min-w-full'); //?
