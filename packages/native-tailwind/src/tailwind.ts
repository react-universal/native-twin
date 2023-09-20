/**********************************************
 * Readapted from Twind                       *
 * Credits: @sastan https://github.com/sastan *
 * Repo: https://github.com/tw-in-js/twind    *
 * ********************************************
 */
import type { AnyStyle, FinalSheet } from '@universal-labs/css';
import { parseTWTokens, type ParsedRule } from '@universal-labs/css/tailwind';
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
  const cache = new Map<StringLike, FinalSheet>();
  const breakpoints = Object.keys(context.breakpoints);
  return Object.defineProperties(
    function tw(tokens: StringLike) {
      if (cache.has(tokens)) {
        return cache.get(tokens);
      }
      const styles = new StyleGroup();
      for (const rule of parseTWTokens(tokens)) {
        if (!isApplicativeRule(rule)) continue;
        const className = parsedRuleToString(rule, breakpoints);

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
      cache.set(tokens, styles.finalSheet);
      return cache.get(tokens);
    } as RuntimeTW<__Theme__ & Theme>,
    Object.getOwnPropertyDescriptors({
      get target(): AnyStyle[] {
        return Array.from(sheet.target.values());
      },
      theme: config.theme,
      config,
    }),
  );

  function isApplicativeRule(rule: ParsedRule) {
    if (rule.v.length == 0) return true;
    return context.v(rule.v);
  }
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
//     },
//   },
// });

// tailwind('border-x-1 2xl:bg-blue'); //?
