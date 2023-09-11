import type { ThemeConfig, __Theme__ } from '../types/theme.types';

export function createThemeFunction<Theme extends __Theme__ = __Theme__>({
  extend = {},
  ...baseConfig
}: ThemeConfig<Theme>) {
  const resolveContext: ThemeSectionResolverContext<Theme> = {
    get colors() {
      return theme('colors');
    },

    theme,

    breakpoints(screens) {
      const breakpoints = {} as Record<string, string>;

      for (const key in screens) {
        if (typeof screens[key] == 'string') {
          breakpoints['screen-' + key] = screens[key] as string;
        }
      }

      return breakpoints;
    },
  };

  return theme as ThemeFunction<Theme>;

  function theme(themeSection: string, key?: string, defaultValue?: string) {
    if (!key) {
      let config = baseConfig[themeSection];
      if (typeof config == 'function') config = config(resolveContext);

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
      if (typeof initialValue == 'function') initialValue = initialValue(resolveContext);
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
