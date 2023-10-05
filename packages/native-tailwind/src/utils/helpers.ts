export function keysOf<Obj extends object>(obj: Obj): (keyof Obj)[] {
  return Object.keys(obj) as (keyof Obj)[];
}

export function identity<A>(a: A): A {
  return a;
}

export function noop(): void {}

export function asArray<T>(value: T | T[] = []): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

export function uniq<T>(value: T[]): T[] {
  return Array.from(new Set(value));
}

export function isString(s: any): s is string {
  return typeof s === 'string';
}

export function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export function asRegExp(value: string | RegExp): RegExp {
  return typeof value == 'string'
    ? new RegExp('^' + value + (value.includes('$') || value.slice(-1) == '-' ? '' : '$'))
    : value;
}
