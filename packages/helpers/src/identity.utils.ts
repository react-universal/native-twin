import type { MaybeArray } from './utility.types';

export const asNumber = (x: string) => Number(x);

export const asString = <T>(x: T) => String(x);

export function asRegExp(value: string | RegExp): RegExp {
  return typeof value === 'string'
    ? new RegExp(`^${value}${value.includes('$') || value.slice(-1) === '-' ? '' : '$'}`)
    : value;
}

export function asArray<T>(value: MaybeArray<T> = []): NonNullable<T>[] {
  if (value === null || value === undefined) return [];
  if (!Array.isArray(value)) return [value];
  return value.filter((x) => x !== null && x !== undefined);
}

export const identity = <A>(a: A): A => a;

export function keysOf<Obj extends object>(obj: Obj): (keyof Obj)[] {
  return Object.keys(obj) as (keyof Obj)[];
}

export const removeReadonly = <T extends {}>(arr: T[] | readonly T[]): T[] => arr as T[];
