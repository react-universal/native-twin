/**********************************************
 * Readapted from Twind                       *
 * Credits: @sastan https://github.com/sastan *
 * Repo: https://github.com/tw-in-js/twind    *
 * ********************************************
 */
import { defineConfig } from './config/define-config';
import { translateRuleResults } from './css/translate';
import { parseTWTokens } from './parsers/tailwind.parser';
import { createThemeContext } from './theme/theme.context';
import type { RuleResolver, TailwindConfig, TailwindUserConfig } from './types/config.types';
import type { CSSProperties, Sheet } from './types/css.types';
import type { __Theme__ } from './types/theme.types';
import type { StringLike } from './types/util.types';

interface RuntimeTW<Theme extends __Theme__ = __Theme__> {
  (tokens: StringLike): CSSProperties[];
  target: string[];
  readonly theme: RuleResolver<Theme>;
  readonly config: TailwindConfig<Theme>;
}

export function createTailwind<Theme = __Theme__, Target = unknown>(
  userConfig: TailwindUserConfig<Theme>,
  _sheet?: Sheet<Target>,
): RuntimeTW<__Theme__ & Theme> {
  const config = defineConfig(userConfig) as TailwindConfig<__Theme__>;
  const context = createThemeContext<__Theme__>(config);
  return Object.defineProperties(
    function tw(tokens: StringLike) {
      const result: CSSProperties[] = [];
      for (const rule of parseTWTokens(tokens)) {
        const ruleData = context.r(rule);
        if (ruleData) {
          result.push(...translateRuleResults(ruleData, context));
        }
      }
      return result;
    } as RuntimeTW<__Theme__ & Theme>,
    Object.getOwnPropertyDescriptors({
      get target() {
        return [];
      },
      theme: config.theme,
      config,
    }),
  );
}

const tailwind = createTailwind({
  ignorelist: [],
  theme: {
    extend: {
      colors: {
        primary: '#0558f9',
      },
    },
  },
});

tailwind('grow-1'); // ?
