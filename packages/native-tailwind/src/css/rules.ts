import type { AnyStyle, SelectorGroup } from '@universal-labs/css';
import type { ParsedRule } from '@universal-labs/css/tailwind';

export class FinalRule {
  constructor(public name: string, public parsed: ParsedRule, public style: AnyStyle) {}

  get selectorGroup(): SelectorGroup {
    if (this.parsed.v.length == 0) return 'base';
    if (
      this.parsed.v.includes('group') ||
      this.parsed.v.includes('group-hover') ||
      this.parsed.v.includes('group-active') ||
      this.parsed.v.includes('group-focus')
    )
      return 'group';
    if (this.parsed.v.includes('odd')) return 'odd';
    if (this.parsed.v.includes('even')) return 'even';
    if (this.parsed.v.includes('first')) return 'first';
    if (this.parsed.v.includes('last')) return 'last';
    if (
      this.parsed.v.includes('hover') ||
      this.parsed.v.includes('focus') ||
      this.parsed.v.includes('active')
    )
      return 'pointer';
    return 'base';
  }
}
