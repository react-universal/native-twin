import { Context, TailwindConfig } from '../types/config.types';
import { BaseTheme, ThemeConfig, ThemeFunction } from '../types/theme.types';
import { RuleHandler } from './entities/Rule';

export function createThemeContext<Theme extends BaseTheme = BaseTheme>({
  theme: themeConfig,
  rules,
}: TailwindConfig<Theme>): Context<Theme> {
  const ruleHandlers = rules.map((x) => new RuleHandler(x));
  const ctx: Context<Theme> = {
    theme: createThemeFunction(themeConfig),
    r(token) {
      for (const current of ruleHandlers) {
        const nextToken = current.testToken(token, ctx);
        if (nextToken) {
          return nextToken;
        }
        // if (Object.keys(current.themeValues).length == 0) {
        //   console.log('HAS_N', current);
        //   current.extractThemeValues(ctx);
        // }
        // const result = current.parser().run(token);
        // if (!result.isError) {
        //   return result;
        // }
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

/** Resolved theme values on the theme config */
