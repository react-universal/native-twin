import { parseCssValue } from '../parsers/values.parser';
import type { ThemeFunction } from '../types/config.types';
import type { ThemeConfig, __Theme__ } from '../types/theme.types';

export function createThemeFunction<Theme extends __Theme__ = __Theme__>({
  extend = {},
  ...baseConfig
}: ThemeConfig<Theme>) {
  const root = baseConfig.root!;
  return theme as ThemeFunction<Theme>;

  function theme(themeSection: keyof Omit<ThemeConfig<Theme>, 'extend'>, segment: string) {
    if (segment.startsWith('[') && segment.endsWith(']')) {
      return segment.slice(1, -1);
    }
    let config = baseConfig[themeSection];
    if (themeSection in extend) {
      config = Object.assign(config ?? {}, { ...extend[themeSection] });
    }
    let value = segment.split('-').reduce((prev, current) => {
      if (!prev) return null;
      if (typeof prev == 'object') {
        return prev[current];
      }
      return prev;
    }, config as any);
    if (value) {
      if (Array.isArray(value)) {
        value = value.map((x) => parseCssValue(themeSection as string, x, root));
      } else {
        value = parseCssValue(themeSection as string, value, root);
      }
    }
    return value;
  }
}
