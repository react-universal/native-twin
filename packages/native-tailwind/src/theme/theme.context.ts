import { Context, TailwindConfig } from '../config.types';
import { BaseTheme, ThemeConfig, ThemeFunction } from '../theme.types';

export function createThemeContext<Theme extends BaseTheme = BaseTheme>({
  theme: themeConfig,
}: TailwindConfig<Theme>): Context<Theme> {
  const ctx: Context<Theme> = {
    theme: createThemeFunction(themeConfig),
    r(_value, _isDark) {
      return '';
    },
  };

  return ctx;
}

/** Resolved theme values on the theme config */
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
      if (themeSection in extend) {
        initialValue = {
          ...initialValue,
          ...extend[themeSection],
        };
      }
      return segments.reduce((prev, current) => {
        if (!current || !prev) return null;
        if (typeof prev == 'object') {
          if (current in prev) {
            return prev[current];
          }
        }
        return prev;
      }, initialValue);
    }
    return null;
  }
}
