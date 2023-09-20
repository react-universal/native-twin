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
  if (
    rule.v.includes('group') ||
    rule.v.includes('group-hover') ||
    rule.v.includes('group-active') ||
    rule.v.includes('group-focus')
  )
    return 'group';
  if (rule.v.includes('odd')) return 'odd';
  if (rule.v.includes('even')) return 'even';
  if (rule.v.includes('first')) return 'first';
  if (rule.v.includes('last')) return 'last';
  if (rule.v.includes('hover') || rule.v.includes('focus') || rule.v.includes('active'))
    return 'pointer';
  return 'base';
}
