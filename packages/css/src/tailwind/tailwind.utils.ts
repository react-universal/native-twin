export function keysOf<Obj extends object>(obj: Obj): (keyof Obj)[] {
  return Object.keys(obj) as (keyof Obj)[];
}

export function asArray<T>(value: T | T[] = []): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}
