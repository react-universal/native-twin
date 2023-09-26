import { parseCssValue } from '@universal-labs/css/tailwind';
import type { ThemeFunction } from '../types/config.types';
import type { ThemeConfig, __Theme__ } from '../types/theme.types';
import { flattenThemeSection } from '../utils/theme-utils';

export function createThemeFunction<Theme extends __Theme__ = __Theme__>({
  extend = {},
  ...baseConfig
}: ThemeConfig<Theme>) {
  const resolved: Record<string, any> = {};
  const root = baseConfig.root!;
  return theme as ThemeFunction<Theme>;

  function theme(themeSection: keyof Omit<ThemeConfig<Theme>, 'extend'>, segment: string) {
    if (segment.startsWith('[') && segment.endsWith(']')) {
      // @ts-expect-error
      return parseCssValue(themeSection as string, segment.slice(1, -1), root);
    }
    let config = baseConfig[themeSection];
    if (themeSection in extend) {
      config = Object.assign(config ?? {}, { ...extend[themeSection] });
    }
    let value: any | undefined;
    if (themeSection in resolved) {
      value = resolved[themeSection as string][segment];
    }
    if (!value) {
      const flatten = flattenThemeSection(config);
      if (!flatten) return null;
      if (flatten) {
        resolved[themeSection as string] = flatten;
        value = resolved[themeSection as string][segment];
      }
    }
    if (value) {
      // @ts-expect-error
      value = parseCssValue(themeSection as string, value, root);
    }
    return value;
  }
}
