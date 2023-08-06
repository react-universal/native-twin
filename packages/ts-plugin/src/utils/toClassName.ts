import type { ParsedRule } from '@universal-labs/twind-adapter';

export function toClassName(rule: ParsedRule): string {
  return [...rule.v, (rule.i ? '!' : '') + rule.n].join(':');
}
