import { colorToColorValue } from '../parsers/color.parser';
import {
  BaseTheme,
  MaybeColorValue,
  ThemeConfig,
  ThemeFunction,
  ThemeSectionResolverContext,
} from '../theme.types';

export function createThemeFunction<Theme extends BaseTheme = BaseTheme>({
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

  return theme;

  function theme(
    sectionKey?: string,
    key?: string,
    defaultValue?: any,
    opacityValue?: string | undefined,
  ) {
    // console.log('RESOLVED: ', resolved);
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
      // console.log('KEY: ', key, sectionKey);
      if (key == null) return section;

      key ||= 'DEFAULT';

      const value =
        section[key] ??
        key.split('-').reduce((obj, prop) => obj?.[prop], section) ??
        defaultValue;
      return opacityValue ? colorToColorValue(value, { opacityValue }) : value;
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

function flattenColorPalette(colors: Record<string, MaybeColorValue>, path: string[] = []) {
  const flatten: Record<string, MaybeColorValue> = {};

  for (const key in colors) {
    const value = colors[key];

    let keyPath = [...path, key];
    if (value) {
      flatten[keyPath.join('-')] = value;
    }

    if (key == 'DEFAULT') {
      keyPath = path;
      if (value) {
        flatten[path.join('-')] = value;
      }
    }

    if (typeof value == 'object') {
      Object.assign(flatten, flattenColorPalette(value, keyPath));
    }
  }

  return flatten;
}
