import { Platform, PlatformOSType } from 'react-native';
import { RuleHandler } from './Rule';
import { Context, RuleResult, TailwindConfig } from '../types/config.types';
import { BaseTheme, ThemeConfig, ThemeFunction } from '../types/theme.types';

export function createThemeContext<Theme extends BaseTheme = BaseTheme>({
  theme: themeConfig,
  rules,
}: TailwindConfig<Theme>): Context<Theme> {
  const ruleHandlers: RuleHandler<Theme>[] = [];
  const cache = new Map<string, RuleResult>();
  const platform: PlatformOSType =
    Platform.OS == 'android' || Platform.OS == 'ios' ? 'native' : 'web';
  const ctx: Context<Theme> = {
    theme: createThemeFunction(themeConfig),
    isSupported(support) {
      return support.includes(platform);
    },
    r(token) {
      if (cache.has(token)) {
        return cache.get(token);
      }
      if (ruleHandlers.length == 0) {
        for (const rule of rules) {
          const handler = new RuleHandler(rule);
          if (ctx.isSupported(handler.support)) {
            ruleHandlers.push(handler);
          }
        }
      }
      for (const current of ruleHandlers) {
        const nextToken = current.resolve(token, ctx);
        if (nextToken) {
          cache.set(token, nextToken);
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
        const config = baseConfig[themeSection];
        return {
          ...config,
          ...extend[themeSection],
        };
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
          if (!current || !prev) return null;
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
