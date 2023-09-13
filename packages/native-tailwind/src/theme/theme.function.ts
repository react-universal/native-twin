import type { ThemeFunction } from '../types/config.types';
import type { ThemeConfig, __Theme__ } from '../types/theme.types';

export function createThemeFunction<Theme extends __Theme__ = __Theme__>({
  extend = {},
  ...baseConfig
}: ThemeConfig<Theme>) {
  return theme as ThemeFunction<Theme>;

  function theme(themeSection: keyof Omit<ThemeConfig<Theme>, 'extend'>, segment: string) {
    if (segment.startsWith('[') && segment.endsWith(']')) {
      return segment.slice(1, -1);
    }
    let config = baseConfig[themeSection];
    if (themeSection in extend) {
      config = Object.assign(config ?? {}, { ...extend[themeSection] });
    }
    return segment.split('-').reduce((prev, current) => {
      if (!prev) return null;
      if (typeof prev == 'object') {
        return prev[current];
      }
      return prev;
    }, config as any);
  }
}
