import type { AnyStyle, FinalSheet, SelectorGroup } from '@universal-labs/css';
import type { ParsedRule } from '@universal-labs/css/tailwind';
import type { FinalRule } from './rules';

interface RuleSet {
  parsed: ParsedRule;
  style: AnyStyle;
  kind: SelectorGroup;
}

export class StyleGroup {
  // private base: AnyStyle = {};
  // private even: AnyStyle = {};
  // private first: AnyStyle = {};
  // private group: AnyStyle = {};
  // private last: AnyStyle = {};
  // private odd: AnyStyle = {};
  // private pointer: AnyStyle = {};
  ruleSet: RuleSet[] = [];

  addStyle(rule: FinalRule) {
    this.ruleSet.push({
      parsed: rule.parsed,
      style: rule.style,
      kind: rule.selectorGroup,
    });
  }

  get finalSheet(): FinalSheet {
    return Object.freeze(
      this.ruleSet.reduce((prev, current) => {
        prev[current.kind] = {
          ...prev[current.kind],
          ...current.style,
        };
        return prev;
      }, emptySheet),
    );
  }
}

const emptySheet: FinalSheet = Object.seal({
  base: {},
  even: {},
  first: {},
  group: {},
  last: {},
  odd: {},
  pointer: {},
});
