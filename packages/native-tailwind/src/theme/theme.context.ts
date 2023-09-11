import type { PlatformOSType } from 'react-native';
import type { RuleResult, TailwindConfig, ThemeContext } from '../types/config.types';
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
        if (typeof current == 'function') {
          const result = current.test(token.n);

          if (result) {
            const nextToken = current(
              token.n.slice(current.pattern.length),
              themeConfig,
              token,
            );
            if (nextToken) {
              cache.set(token.n, nextToken);
              return nextToken;
            }
          }
        }
        // let resolver = ruleHandlers.get(current[0].toString())!;
        // if (!resolver) {
        //   ruleHandlers.set(current[0].toString(), createRuleResolver(current, ctx));
        //   resolver = ruleHandlers.get(current[0].toString())!;
        // }
        // const nextToken = resolver(token);
      }
      return null;
    },
  };
  return ctx;
}
