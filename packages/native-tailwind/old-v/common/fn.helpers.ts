export function identity<A>(a: A): A {
  return a;
}

export function noop(): void {}

export function toArray<T>(value: T | T[] = []): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

export function uniq<T>(value: T[]): T[] {
  return Array.from(new Set(value));
}

export function isString(s: any): s is string {
  return typeof s === 'string';
}

// Based on https://stackoverflow.com/a/52171480
/**
 * @group Configuration
 * @param value
 * @returns
 */
export function hash(value: string): string {
  for (var h = 9, index = value.length; index--; ) {
    h = Math.imul(h ^ value.charCodeAt(index), 0x5f356495);
  }

  return '#' + ((h ^ (h >>> 9)) >>> 0).toString(36);
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
