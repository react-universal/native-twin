import type { ThemeFunction } from '../types/config.types';
import type { ThemeConfig, __Theme__ } from '../types/theme.types';

export function createThemeFunction<Theme extends __Theme__ = __Theme__>({
  extend = {},
  ...baseConfig
}: ThemeConfig<Theme>) {
  return theme as ThemeFunction<Theme>;

  function theme(themeSection: keyof typeof baseConfig) {
    let config: any = {};
    if (themeSection in baseConfig) {
      config = baseConfig[themeSection];
      return {
        ...config,
        ...extend[themeSection],
      };
    }
  }
}
