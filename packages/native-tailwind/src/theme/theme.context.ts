import { RuleHandler } from '../css/Rule';
import { Context, TailwindConfig } from '../types/config.types';
import { BaseTheme, ThemeConfig, ThemeFunction } from '../types/theme.types';

export function createThemeContext<Theme extends BaseTheme = BaseTheme>({
  theme: themeConfig,
  rules,
}: TailwindConfig<Theme>): Context<Theme> {
  const ruleHandlers: RuleHandler<Theme>[] = [];
  const cache = new Map<string, any>();
  const ctx: Context<Theme> = {
    theme: createThemeFunction(themeConfig),
    r(token) {
      if (cache.has(token)) {
        return cache.get(token);
      }
      if (ruleHandlers.length == 0) {
        for (const rule of rules) {
          ruleHandlers.push(new RuleHandler(rule));
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
      segments: string[] = [],
    ) {
      if (themeSection in baseConfig) {
        let initialValue = baseConfig[themeSection];
        if (typeof initialValue == 'function') initialValue = initialValue(ctx);
        if (themeSection in extend) {
          initialValue = {
            ...initialValue,
            ...extend[themeSection],
          };
        }
        return segments.reduce((prev, current) => {
          if (!current || !prev) return null;
          if (typeof prev == 'object') {
            return prev[current];
          }
          return prev;
        }, initialValue);
      }
      return null;
    }
  }
}
