import type {
  BaseTheme,
  ColorValue,
  MaybeColorValue,
  ThemeConfig,
  ThemeFunction,
  ThemeSectionResolverContext,
} from '@twind/core';
import { toColorValue, Context, asArray } from '@twind/core';
// “Never memorize something that you can look up.” - Albert Einstein

export function resolveThemeFunction<Theme extends BaseTheme = BaseTheme>(
  value: string,
  theme: Context<Theme>['theme'],
): string {
  // support theme(...) function in values
  // calc(100vh - theme('spacing.12'))
  // theme('borderColor.DEFAULT', 'currentColor')

  // PERF: check for theme before running the regexp
  // if (value.includes('theme')) {
  return value.replace(
    /theme\((["'`])?(.+?)\1(?:\s*,\s*(["'`])?(.+?)\3)?\)/g,
    (_, __, key: string, ___, defaultValue = '') => {
      const value = theme(key, defaultValue);

      if (typeof value == 'function' && /color|fill|stroke/i.test(key)) {
        return toColorValue(value as ColorValue);
      }

      return '' + asArray(value as unknown).filter((v) => Object(v) !== v);
    },
  );
  // }

  // return value
}

export function makeThemeFunction<Theme extends BaseTheme = BaseTheme>({
  extend = {},
  ...base
}: ThemeConfig<Theme>): ThemeFunction<Theme> {
  const resolved: Record<string, any> = {};

  const resolveContext: ThemeSectionResolverContext<Theme> = {
    get colors() {
      return theme('colors');
    },

    theme,

    // Stub implementation as negated values are automatically inferred and do _not_ need to be in the theme
    negative() {
      return {};
    },

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

  function theme(
    sectionKey?: string,
    key?: string,
    defaultValue?: any,
    opacityValue?: string | undefined,
  ): any {
    if (sectionKey) {
      ({ 1: sectionKey, 2: opacityValue } =
        /^(\S+?)(?:\s*\/\s*([^/]+))?$/.exec(sectionKey) ||
        ([, sectionKey] as [undefined, string]));

      if (/[.[]/.test(sectionKey)) {
        const path: string[] = [];

        // dotted deep access: colors.gray.500 or spacing[2.5]
        sectionKey.replace(
          /\[([^\]]+)\]|([^.[]+)/g,
          (_, $1, $2 = $1) => path.push($2) as unknown as string,
        );

        sectionKey = path.shift() as string;
        defaultValue = key;
        key = path.join('-');
      }

      const section =
        resolved[sectionKey] ||
        // two-step deref to allow extend section to reference base section
        Object.assign(
          Object.assign(
            // Make sure to not get into recursive calls
            (resolved[sectionKey] = {}),
            deref(base, sectionKey),
          ),
          deref(extend, sectionKey),
        );
      if (key == null) return section;

      key ||= 'DEFAULT';

      const value =
        section[key] ??
        key.split('-').reduce((obj, prop) => obj?.[prop], section) ??
        defaultValue;

      return opacityValue
        ? toColorValue(value, { opacityValue: resolveThemeFunction(opacityValue, theme) })
        : value;
    }

    // Collect the whole theme
    const result = {} as Record<string, any>;

    for (const section of [...Object.keys(base), ...Object.keys(extend)]) {
      result[section] = theme(section);
    }
    return result;
  }

  function deref(source: any, section: string): any {
    let value = source[section];

    if (typeof value == 'function') {
      value = value(resolveContext);
    }

    if (value && /color|fill|stroke/i.test(section)) {
      return flattenColorPalette(value);
    }

    return value;
  }
}

function flattenColorPalette(
  colors: Record<string, MaybeColorValue>,
  path: string[] = [],
): any {
  const flattened: Record<string, MaybeColorValue> = {};

  for (const key in colors) {
    const value = colors[key];
    if (!value) {
      continue;
    }

    let keyPath = [...path, key];

    flattened[keyPath.join('-')] = value;

    if (key == 'DEFAULT') {
      keyPath = path;
      flattened[path.join('-')] = value;
    }

    if (typeof value == 'object') {
      Object.assign(flattened, flattenColorPalette(value, keyPath));
    }
  }

  return flattened;
}
