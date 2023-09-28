import type { ParsedRule } from '@universal-labs/css/tailwind';
import type { CSSValue } from '../types/css.types';

export function interleave<Interpolations>(
  strings: TemplateStringsArray,
  interpolations: readonly Interpolations[],
  handle: (interpolation: Interpolations) => string,
): string {
  return interpolations.reduce(
    (result: string, interpolation, index) =>
      result + handle(interpolation) + strings[index + 1],
    strings[0],
  )!;
}

// based on https://github.com/lukeed/clsx and https://github.com/jorgebucaran/classcat
export function interpolate(
  strings: TemplateStringsArray | CSSValue,
  interpolations: CSSValue[],
): string {
  if (
    Array.isArray(strings) &&
    Array.isArray((strings as unknown as TemplateStringsArray).raw)
  ) {
    return interleave(strings as unknown as TemplateStringsArray, interpolations, (value) =>
      toString(value).trim(),
    );
  }

  return interpolations
    .filter(Boolean)
    .reduce(
      (result: string, value) => result + toString(value),
      strings ? toString(strings as CSSValue) : '',
    ) as string;
}

export function toString(value: CSSValue): string {
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

export function toClassName(rule: ParsedRule): string {
  let modifier = '';
  if (rule.m) {
    modifier = `/${rule.m.value}`;
  }
  return `.${[...rule.v, (rule.i ? '!' : '') + rule.n + modifier].join(':')}`;
}

export function format(rules: ParsedRule[]): string {
  return rules.map(toClassName).join(' ');
}
