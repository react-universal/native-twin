import type { PlatformOSType } from 'react-native';
import type { Rule, RuleResult, TailwindConfig, ThemeContext } from '../types/config.types';
import type { ParsedRule } from '../types/parser.types';
import type { __Theme__ } from '../types/theme.types';
import { flattenColorPalette } from '../utils/theme-utils';

export function createThemeContext<Theme extends __Theme__ = __Theme__>({
  theme: themeConfig,
  rules,
}: TailwindConfig<Theme>): ThemeContext {
  // const ruleHandlers = new Map<string, (rule: ParsedRule) => RuleResult>();
  // const ruleParsers = new Map<string, ThemeObjectParser>();
  const cache = new Map<string, RuleResult>();
  const platform: PlatformOSType = 'native';
  // Platform.OS == 'android' || Platform.OS == 'ios' ? 'native' : 'web';
  const ctx: ThemeContext = {
    get colors() {
      return flattenColorPalette(themeConfig['colors'] ?? {});
    },

    mode: platform,

    // theme: createThemeFunction(themeConfig),

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
        const value = resolveRule(current, token);
        if (value) {
          return value;
        }
      }
      return null;
    },
  };
  return ctx;

  function resolveRule(rule: Rule<Theme>, token: ParsedRule) {
    if (typeof rule == 'function') {
      const result = rule.test(token.n);

      if (result) {
        const pattern = token.n.slice(rule.pattern.length - 1);
        // console.log('PATTERN: ', pattern);
        // console.log('asd: ', token.n.slice(rule.pattern.length - 1));
        const nextToken = rule(pattern, themeConfig, token);
        if (nextToken) {
          cache.set(token.n, nextToken);
          return nextToken;
        }
      }
    }
  }
}
