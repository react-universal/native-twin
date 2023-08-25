import { toArray } from '../common/fn.helpers';
import { colorToColorValue } from '../parsers/color.parser';
import { Context } from '../types';
import { ColorValue, BaseTheme, ThemeSectionResolver } from '../theme.types';

// 0: '0px',
// 2: '2px',
// 4: '4px',
// 8: '8px',
export function createExponentialUnits(
  stop: number,
  unit: string,
  start = 0,
): Record<string, string> {
  const result: Record<string, string> = {};

  for (; start <= stop; start = start * 2 || 1) {
    result[start] = start + unit;
  }

  return result;
}

// 3: '.75rem',
// 4: '1rem',
// 5: '1.25rem',
// 6: '1.5rem',
// 7: '1.75rem',
// 8: '2rem',
// 9: '2.25rem',
// 10: '2.5rem',
export function createLinearUnits(
  stop: number,
  unit = '',
  divideBy = 1,
  start = 0,
  step = 1,
  result: Record<string, string> = {},
): Record<string, string> {
  for (; start <= stop; start += step) {
    result[start] = start / divideBy + unit;
  }

  return result;
}

// '1/2': '50%',
// '1/3': '33.333333%',
// '2/3': '66.666667%',
// '1/4': '25%',
// '2/4': '50%',
// '3/4': '75%',
// '1/5': '20%',
// '2/5': '40%',
// '3/5': '60%',
// '4/5': '80%',
// '1/6': '16.666667%',
// '2/6': '33.333333%',
// '3/6': '50%',
// '4/6': '66.666667%',
// '5/6': '83.333333%',
export function createPercentRatios(start: number, end: number): Record<string, string> {
  const result: Record<string, string> = {};

  do {
    // XXX: using var to avoid strange bug when generating cjs where `= 1` is removed
    for (var dividend = 1; dividend < start; dividend++) {
      result[`${dividend}/${start}`] = Number(((dividend / start) * 100).toFixed(6)) + '%';
    }
  } while (++start <= end);

  return result;
}

export function themeAlias<Section extends keyof BaseTheme>(
  section: Section,
): ThemeSectionResolver<BaseTheme[Section], BaseTheme> {
  return ({ theme }) => theme(section);
}

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
        // @ts-expect-error
        return colorToColorValue(value as ColorValue);
      }

      return '' + toArray(value as unknown).filter((v) => Object(v) !== v);
    },
  );
  // }

  // return value
}
