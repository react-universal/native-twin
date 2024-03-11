export function identity<A>(a: A): A {
  return a;
}

export function noop(): void {}

export function uniq<T>(value: T[]): T[] {
  return Array.from(new Set(value));
}

export function isString(s: any): s is string {
  return typeof s === 'string';
}

export function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export const hasOwnProperty = {}.hasOwnProperty;

export function asRegExp(value: string | RegExp): RegExp {
  return typeof value == 'string'
    ? new RegExp('^' + value + (value.includes('$') || value.slice(-1) == '-' ? '' : '$'))
    : value;
}
