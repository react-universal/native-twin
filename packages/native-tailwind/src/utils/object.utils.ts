import type { DeepPartial } from '../types/util.types';

export function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export function mergeDeep<T>(original: T, patch: DeepPartial<T>, mergeArray = false): T {
  const o = original as any;
  const p = patch as any;

  const output = o;
  for (const key in p) {
    if (isObject(o[key]) && isObject(p[key]))
      output[key] = mergeDeep(o[key], p[key], mergeArray);
    else Object.assign(output, { [key]: p[key] });
  }
  return output;
}
