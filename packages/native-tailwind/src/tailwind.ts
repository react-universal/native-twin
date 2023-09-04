/**********************************************
 * Readapted from Twind                       *
 * Credits: @sastan https://github.com/sastan *
 * Repo: https://github.com/tw-in-js/twind    *
 * ********************************************
 */

import type { ExtractThemes, TailwindConfig, TailwindUserConfig } from './types/config.types';
import type { BaseTheme, ThemeFunction } from './types/theme.types';
import type { StringLike } from './types/util.types';
import type { CSSObject, Sheet } from './types/css.types';
import { defineConfig } from './config/define-config';
import { createThemeContext } from './theme/theme.context';
import { parseTWTokens } from './parsers/tailwind.parser';
import { translateRuleResults } from './css/translate';

interface RuntimeTW<Theme extends BaseTheme = BaseTheme> {
  (tokens: StringLike): CSSObject[];
  target: string[];
  readonly theme: ThemeFunction<Theme>;
  readonly config: TailwindConfig<Theme>;
}

export function createTailwind<Theme = BaseTheme, Target = unknown>(
  userConfig: TailwindUserConfig<Theme>,
  _sheet?: Sheet<Target>,
): RuntimeTW<BaseTheme & ExtractThemes<Theme>> {
  const config = defineConfig(userConfig) as TailwindConfig<BaseTheme>;
  const context = createThemeContext<BaseTheme>(config);
  return Object.defineProperties(
    function tw(tokens: StringLike) {
      const result: CSSObject[] = [];
      for (const rule of parseTWTokens(tokens)) {
        const ruleData = context.r(rule);
        if (ruleData) {
          result.push(...translateRuleResults(ruleData, context));
        }
      }
      return result;
    } as RuntimeTW<BaseTheme & ExtractThemes<Theme>>,
    Object.getOwnPropertyDescriptors({
      get target() {
        return [];
      },
      theme: context.theme,
      config,
    }),
  );
}

const tailwind = createTailwind({
  ignorelist: [],
});

tailwind('bg-blue-200/50'); //?
