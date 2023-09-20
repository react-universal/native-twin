/**********************************************
 * Readapted from Twind                       *
 * Credits: @sastan https://github.com/sastan *
 * Repo: https://github.com/tw-in-js/twind    *
 * ********************************************
 */
import type { AnyStyle, FinalSheet } from '@universal-labs/css';
import { parseTWTokens } from '@universal-labs/css/tailwind';
import { defineConfig } from './config/define-config';
import { createVirtualSheet } from './css/sheets';
import { StyleGroup } from './css/style.compositions';
import { createThemeContext } from './theme/theme.context';
import type { RuleResolver, TailwindConfig, TailwindUserConfig } from './types/config.types';
import type { __Theme__ } from './types/theme.types';
import type { StringLike } from './types/util.types';
import { parsedRuleToString } from './utils/css-utils';

interface RuntimeTW<Theme extends __Theme__ = __Theme__> {
  (tokens: StringLike): FinalSheet;
  target: AnyStyle[];
  readonly theme: RuleResolver<Theme>;
  readonly config: TailwindConfig<Theme>;
}

export function createTailwind<Theme = __Theme__>(
  userConfig: TailwindUserConfig<Theme>,
  sheet = createVirtualSheet(),
): RuntimeTW<__Theme__ & Theme> {
  const config = defineConfig(userConfig) as TailwindConfig<__Theme__>;
  const context = createThemeContext<__Theme__>(config);
  return Object.defineProperties(
    function tw(tokens: StringLike) {
      const styles = new StyleGroup();
      for (const rule of parseTWTokens(tokens)) {
        const className = parsedRuleToString(rule, context.breakpoints);
        const style = sheet.getClassName(className);
        if (style) {
          styles.addStyle(rule, style);
        } else {
          const ruleData = context.r(rule);
          if (ruleData) {
            sheet.insert(className, rule, ruleData);
            styles.addStyle(rule, ruleData);
          }
        }
      }
      return styles.finalSheet;
    } as RuntimeTW<__Theme__ & Theme>,
    Object.getOwnPropertyDescriptors({
      get target(): AnyStyle[] {
        return Array.from(sheet.target.values());
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
      borderWidth: {
        sm: '100px',
      },
    },
  },
});

tailwind('border-x-1'); //?
