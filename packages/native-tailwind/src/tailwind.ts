/**********************************************
 * Readapted from Twind                       *
 * Credits: @sastan https://github.com/sastan *
 * Repo: https://github.com/tw-in-js/twind    *
 * ********************************************
 */
import type { AnyStyle, FinalSheet } from '@universal-labs/css';
import type { SheetInteractionState } from '@universal-labs/css/build/types/css.types';
import { parseTWTokens, type ParsedRule } from '@universal-labs/css/tailwind';
import { defineConfig } from './config/define-config';
import { FinalRule } from './css/rules';
import { createVirtualSheet } from './css/sheets';
import { StyleGroup } from './css/style.compositions';
import { createThemeContext } from './theme/theme.context';
import type { TailwindConfig, TailwindUserConfig } from './types/config.types';
import type { GetChildStyles, Sheet } from './types/css.types';
import type { ComponentSheet, RuntimeTW, __Theme__ } from './types/theme.types';
import type { StringLike } from './types/util.types';
import { parsedRuleToString } from './utils/css-utils';
import { interpolate } from './utils/string-utils';

export function createTailwind<Theme = __Theme__>(
  userConfig: TailwindUserConfig<Theme>,
  sheet = createVirtualSheet(),
): RuntimeTW<__Theme__ & Theme> {
  const config = defineConfig(userConfig) as TailwindConfig<__Theme__>;
  const context = createThemeContext<__Theme__>(config);
  const cache = new Map<StringLike, ComponentSheet>();
  const breakpoints = Object.keys(context.breakpoints);

  return Object.defineProperties(
    function tw(tokens: StringLike) {
      if (cache.has(tokens)) {
        return cache.get(tokens);
      }
      const styles = new StyleGroup();
      let isGroupParent = false;
      for (const rule of parseTWTokens(interpolate`${[tokens]}`)) {
        if (rule.n == 'group') isGroupParent = true;
        if (!isApplicativeRule(rule)) continue;
        const className = parsedRuleToString(rule, breakpoints);

        const style = sheet.getClassName(className);
        if (style) {
          styles.addStyle(style);
        } else {
          const ruleData = context.r(rule);
          if (ruleData) {
            const finalRule = new FinalRule(className, rule, ruleData);
            sheet.insert(className, finalRule);
            styles.addStyle(finalRule);
          }
        }
      }
      cache.set(tokens, {
        metadata: {
          hasGroupEvents: Object.keys(styles.finalSheet.group).length > 0,
          hasPointerEvents: Object.keys(styles.finalSheet.pointer).length > 0,
          isGroupParent,
        },
        getStyles(input) {
          return getStyles(styles.finalSheet, input);
        },
        getChildStyles: (data: GetChildStyles) => getChildStyles(styles.finalSheet, data),
        sheet: styles.finalSheet,
      });
      return cache.get(tokens);
    } as RuntimeTW<__Theme__ & Theme>,
    Object.getOwnPropertyDescriptors({
      get sheet(): Sheet<FinalRule> {
        return sheet;
      },
      theme: context.theme,
      config,
    }),
  );

  function isApplicativeRule(rule: ParsedRule) {
    if (rule.v.length == 0) return true;
    return context.v(rule.v);
  }
}

function getStyles(sheet: FinalSheet, input: SheetInteractionState) {
  const styles: AnyStyle = { ...sheet.base };
  if (input.isPointerActive) Object.assign(styles, { ...sheet.pointer });
  if (input.isParentActive) Object.assign(styles, { ...sheet.group });
  return styles;
}

function getChildStyles(sheet: FinalSheet, input: GetChildStyles) {
  const result: AnyStyle = {};
  if (input.isFirstChild) {
    Object.assign(result, sheet.first);
  }
  if (input.isLastChild) {
    Object.assign(result, sheet.last);
  }
  if (input.isEven) {
    Object.assign(result, sheet.even);
  }
  if (input.isOdd) {
    Object.assign(result, sheet.odd);
  }
  return Object.freeze(result);
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

// tailwind(`p-10 mx-2.5 text(center 2xl) bg-blue-200 justify-center`).getStyles({
//   isParentActive: false,
//   isPointerActive: false,
// }); //?
