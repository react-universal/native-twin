import type { StyledContext } from '../types/css.types';
import type { Colors } from '../types/theme.types';

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

export function flattenColorPalette(
  colors: Colors,
  path: string[] = [],
): Record<string, string> {
  const flatten: Record<string, string> | Colors = {};

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

  return flatten as any;
}

export function flattenThemeSection(obj: any, path: string[] = []) {
  const flatten: Record<string, any> = {};
  for (const key in obj) {
    const value = obj[key];
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
      Object.assign(flatten, flattenThemeSection(value, keyPath));
    }
  }
  return flatten;
}

export function getDefaultStyledContext(): StyledContext {
  const vw = 1;
  const vh = 1;
  return {
    colorScheme: 'light',
    deviceAspectRatio: vw / vh,
    deviceHeight: vh,
    deviceWidth: vw,
    orientation: vw > vh ? 'landscape' : 'portrait',
    resolution: 16,
    fontScale: 16,
    platform: 'web',
    units: {
      rem: 16,
      em: 16,
      cm: 37.8,
      mm: 3.78,
      in: 96,
      pt: 1.33,
      pc: 16,
      px: 1,
      vmin: vw < vh ? vw : vh,
      vmax: vw > vh ? vw : vh,
      vw,
      vh,
    },
  };
}
