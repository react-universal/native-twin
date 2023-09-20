import type { AnyStyle, FinalSheet, SelectorGroup } from '@universal-labs/css';
import type { ParsedRule } from '@universal-labs/css/tailwind';

export class StyleGroup {
  private base: AnyStyle = {};
  private even: AnyStyle = {};
  private first: AnyStyle = {};
  private group: AnyStyle = {};
  private last: AnyStyle = {};
  private odd: AnyStyle = {};
  private pointer: AnyStyle = {};

  addStyle(rule: ParsedRule, style: AnyStyle) {
    const kind = getSelectorGroup(rule);
    this[kind] = {
      ...this[kind],
      ...style,
    };
  }

  get finalSheet(): FinalSheet {
    return Object.freeze<FinalSheet>({
      base: this.base,
      even: this.even,
      first: this.first,
      group: this.group,
      last: this.last,
      odd: this.odd,
      pointer: this.pointer,
    });
  }
}

function getSelectorGroup(rule: ParsedRule): SelectorGroup {
  if (rule.v.length == 0) return 'base';
  if ('group' in rule.v) return 'group';
  if ('odd' in rule.v) return 'odd';
  if ('even' in rule.v) return 'even';
  if ('first' in rule.v) return 'first';
  if ('last' in rule.v) return 'last';
  if ('pointer' in rule.v) return 'pointer';
  return 'base';
}
