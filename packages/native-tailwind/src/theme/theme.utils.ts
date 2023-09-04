import type {
  BaseTheme,
  ColorFunctionOptions,
  ColorValue,
  ThemeSectionResolver,
} from '../types/theme.types';

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

export function toCondition(value: string | RegExp): RegExp {
  // "visible" -> /^visible$/
  // "(float)-(left|right|none)" -> /^(float)-(left|right|none)$/
  // "auto-rows-" -> /^auto-rows-/
  // "gap(-|$)" -> /^gap(-|$)/
  return typeof value == 'string'
    ? new RegExp('^' + value + (value.includes('$') || value.slice(-1) == '-' ? '' : '$'))
    : value;
}

export function toColorValue(
  color: ColorValue,
  options: ColorFunctionOptions = {
    opacityValue: '1',
  },
): string {
  if (typeof color == 'function') return color(options);

  if (color[0] == '#' && (color.length == 4 || color.length == 7)) {
    color = color.replace('#', '');
    var r = parseInt(color.length == 3 ? color.slice(0, 1).repeat(2) : color.slice(0, 2), 16);
    var g = parseInt(color.length == 3 ? color.slice(1, 2).repeat(2) : color.slice(2, 4), 16);
    var b = parseInt(color.length == 3 ? color.slice(2, 3).repeat(2) : color.slice(4, 6), 16);
    return `rgba(${[r, g, b, options.opacityValue]})`;
  }

  if (options.opacityValue == '1') return color;

  if (options.opacityValue == '0') return '#0000';
  return color.replace(/^(rgb|hsl)(\([^)]+)\)$/, `$1a$2,${options.opacityValue})`);
}
