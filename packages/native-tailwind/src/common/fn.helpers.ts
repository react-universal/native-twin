import type { MaybeColorValue } from '../types/theme.types';

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
export function hash(value: string): string {
  for (var h = 9, index = value.length; index--; ) {
    h = Math.imul(h ^ value.charCodeAt(index), 0x5f356495);
  }

  return '#' + ((h ^ (h >>> 9)) >>> 0).toString(36);
}

export function flattenColorPalette(
  colors: Record<string, MaybeColorValue>,
  path: string[] = [],
) {
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
