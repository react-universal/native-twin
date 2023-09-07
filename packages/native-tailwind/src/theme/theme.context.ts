import type { PlatformOSType } from 'react-native';
import type { ParsedRule } from '../types/parser.types';
import type { Context, RuleResult, TailwindConfig } from '../types/config.types';
import type { BaseTheme } from '../types/theme.types';
import { createThemeFunction } from './theme.function';
import { createRuleResolver } from './Rule';
import { flattenColorPalette } from '../common/fn.helpers';

export function createThemeContext<Theme extends BaseTheme = BaseTheme>({
  theme: themeConfig,
  rules,
}: TailwindConfig<Theme>): Context<Theme> {
  const ruleHandlers = new Map<string, (rule: ParsedRule) => RuleResult>();
  // const ruleParsers = new Map<string, ThemeObjectParser>();
  const cache = new Map<string, RuleResult>();
  const platform: PlatformOSType = 'native';
  // Platform.OS == 'android' || Platform.OS == 'ios' ? 'native' : 'web';
  const ctx: Context<Theme> = {
    get colors() {
      return flattenColorPalette(ctx.theme('colors'));
    },

    mode: platform,

    theme: createThemeFunction(themeConfig),

    isSupported(support) {
      return support.includes(platform);
    },

    r(token: ParsedRule) {
      let cacheKey = token.n;
      if (token.m) {
        cacheKey = cacheKey + `/${token.m.value}`;
      }
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
      }
      for (const current of rules) {
        let resolver = ruleHandlers.get(current[0].toString())!;
        if (!resolver) {
          ruleHandlers.set(current[0].toString(), createRuleResolver(current, ctx));
          resolver = ruleHandlers.get(current[0].toString())!;
        }
        const nextToken = resolver(token);
        if (nextToken) {
          cache.set(token.n, nextToken);
          return nextToken;
        }
      }
      return null;
    },
  };
  return ctx;
}
