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
  color: string,
  options = {
    opacityValue: '1',
  },
): string {
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
