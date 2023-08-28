import { inspect } from 'util';
import { TailwindUserConfig } from './config.types';
import { defineConfig } from './config/define-config';
import { BaseTheme, MaybeColorValue } from './theme.types';
import { baseTailwindTheme } from './theme/baseTheme';
import * as colors from './theme/colors';
import { tailwindBaseRules } from './theme/tailwind-rules';
import { createThemeContext } from './theme/theme.context';

export function createTailwind<Theme = BaseTheme>({
  ignorelist = [],
  rules = [],
  theme = {},
}: TailwindUserConfig<Theme>) {
  const config = defineConfig({
    ignorelist: ignorelist,
    rules: [...rules, ...tailwindBaseRules],
    theme: {
      colors,
      ...baseTailwindTheme,
      ...theme,
      extend: {
        ...theme.extend,
      },
    },
  });
  const context = createThemeContext<BaseTheme>(config);
  const patterns = createRulePatterns();
  console.log('OOOO', inspect(patterns, false, null));
  return context;

  function createRulePatterns() {
    return config.rules
      .map((x) => {
        if (Array.isArray(x[1])) {
          return x[1].map((y) => `${x[0]}${y}`);
        }
        // @ts-expect-error
        return flattenUtils(config.theme!, x[1], x[0]);
      })
      .flat();
  }
}

function flattenUtils<Theme extends BaseTheme = BaseTheme>(
  theme: Theme,
  section: keyof Theme,
  prefix: string,
) {
  function flat(obj: any, path: any[] = []) {
    const flatten: Record<string, MaybeColorValue> = {};

    for (const key in obj) {
      const value = obj[key];

      let keyPath = [...path, key];
      if (value) {
        // a-
        flatten[keyPath.join('-')] = value;
      }

      if (key == 'DEFAULT') {
        keyPath = path;
        if (value) {
          flatten[path.join('-')] = value;
        }
      }

      if (typeof value == 'object') {
        Object.assign(flatten, flat(value, keyPath));
      }
    }

    return flatten;
  }
  const flatten = flat(theme[section]); //?
  return Object.keys(flatten).map((x) => `${prefix}${x}`); //?
}

const tailwind = createTailwind({ ignorelist: [], rules: [], theme: {} });

tailwind.theme('colors', ['blue', '50']); // ?
tailwind.theme('colors', ['blue', '300']); // ?
