import { Context } from '../config.types';
import { BaseTheme, ThemeConfig, ThemeFunction } from '../theme.types';

export function createThemeContext<Theme extends BaseTheme = BaseTheme>(
  themeConfig: ThemeConfig<Theme>,
): Context<Theme> {
  createThemeFunction(themeConfig);
  const ctx: Context<Theme> = {
    theme: createThemeFunction(themeConfig),
    r(_value, _isDark) {
      return '';
    },
  };

  return ctx;
}

export function createThemeFunction<Theme extends BaseTheme = BaseTheme>({
  extend = {},
  ...baseConfig
}: ThemeConfig<Theme>): ThemeFunction<Theme> {
  // const resolved: Record<string, any> = {};
  // const resolveContext: ThemeSectionResolverContext<Theme> = {
  //   get colors() {
  //     return theme('colors');
  //   },

  //   theme,

  //   breakpoints(screens) {
  //     const breakpoints = {} as Record<string, string>;

  //     for (const key in screens) {
  //       if (typeof screens[key] == 'string') {
  //         breakpoints['screen-' + key] = screens[key] as string;
  //       }
  //     }

  //     return breakpoints;
  //   },
  // };

  return theme;

  function theme(
    sectionKey?: string,
    _key?: string,
    _defaultValue?: any,
    _opacityValue?: string | undefined,
  ) {
    if (sectionKey) {
      // TODO: Fix overload cases where areas match a section key or arbitrary value
      return {} as any;
    }
    const result = {} as Record<string, any>;

    for (const section of [...Object.keys(baseConfig), ...Object.keys(extend)]) {
      result[section] = theme(section);
    }
    return result;
  }
  function _resolveThemeValue(segments: string[], themeSection: keyof BaseTheme) {
    return segments.reduce((prev, current) => {
      if (!current || !prev) return null;
      if (current in prev) {
        return prev[current];
      }
      return prev;
    }, baseConfig[themeSection]);
  }
}
