import type { ParsedRule } from '../types/parser.types';
import type { Context, RuleResult, TailwindConfig } from '../types/config.types';
import type { BaseTheme, ThemeConfig, ThemeFunction } from '../types/theme.types';
import type { PlatformOSType } from 'react-native';
import { createRuleResolver } from './Rule';
import { flattenColorPalette } from '../common/fn.helpers';

export function createThemeContext<Theme extends BaseTheme = BaseTheme>({
  theme: themeConfig,
  rules,
}: TailwindConfig<Theme>): Context<Theme> {
  const ruleHandlers = new Map<string, (rule: ParsedRule) => RuleResult>();
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
          cache.set(cacheKey, nextToken);
          return nextToken;
        }
      }
      return null;
    },
  };
  return ctx;

  function createThemeFunction<Theme extends BaseTheme = BaseTheme>({
    extend = {},
    ...baseConfig
  }: ThemeConfig<Theme>) {
    return theme as ThemeFunction<Theme>;
    function theme(
      themeSection: keyof typeof baseConfig & keyof typeof extend,
      key?: string,
      defaultValue?: string,
    ) {
      if (!key) {
        let config = baseConfig[themeSection];
        if (typeof config == 'function') config = config(ctx);

        return {
          ...config,
          ...extend[themeSection],
        };
      }

      if (key[0] == '[' && key.slice(-1) == ']') {
        return key.slice(1, -1);
      }
      // The utility has an arbitrary value
      if (key.startsWith('[') && key.endsWith(']')) {
        return key.slice(1, -1);
      }
      if (themeSection in baseConfig) {
        let initialValue = baseConfig[themeSection];
        if (typeof initialValue == 'function') initialValue = initialValue(ctx);
        if (themeSection in extend) {
          initialValue = {
            ...initialValue,
            ...extend[themeSection],
          };
        }
        return key.split('-').reduce((prev, current) => {
          if (!prev) return null;
          if (typeof prev == 'object') {
            return prev[current];
          }
          return prev;
        }, initialValue);
      }
      return defaultValue ?? null;
    }
  }
}
