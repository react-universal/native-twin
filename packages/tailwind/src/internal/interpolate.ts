import type { Class } from '../types';
import { interleave } from './interleave';

// based on https://github.com/lukeed/clsx and https://github.com/jorgebucaran/classcat
export function interpolate(
  strings: TemplateStringsArray | Class,
  interpolations: Class[],
): string {
  if (Array.isArray(strings)) {
    if (Array.isArray((strings as unknown as TemplateStringsArray).raw)) {
      return interleave(strings as unknown as TemplateStringsArray, interpolations, (value) =>
        toString(value).trim(),
      );
    } else {
      return interpolations
        .filter(Boolean)
        .reduce(
          (result: string, value): string => result + toString(value),
          strings ? toString(strings as Class) : '',
        ) as string;
    }
  }
  return '';
}

function toString(value: Class): string {
  let result = '';
  let tmp: string;

  if (value && typeof value == 'object') {
    if (Array.isArray(value)) {
      if ((tmp = interpolate(value[0], value.slice(1)))) {
        result += ' ' + tmp;
      }
    } else {
      for (const key in value) {
        if (value[key]) result += ' ' + key;
      }
    }
  } else if (value != null && typeof value != 'boolean') {
    result += ' ' + value;
  }

  return result;
}
