import type { ParsedRule } from '@universal-labs/twind-adapter';

export function toClassName(rule: ParsedRule): string {
  return [...rule.v, (rule.i ? '!' : '') + rule.n].join(':');
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

export function addSpaces(value: string): string {
  return (value[0] === '-' ? '- ' : '') + value.replace(/[-\s]+/g, ' ');
}
