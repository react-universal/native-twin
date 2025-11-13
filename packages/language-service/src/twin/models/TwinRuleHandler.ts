import * as Trie from 'effect/Trie';
import * as Utils from '../TwinParser.utils';
import type { ExpandedRule, TwinRuleNode } from './TwinParser.models';

export class TwinRuleHandler {
  private readonly taggedRule: TwinRuleNode;
  private readonly patterns: string[];
  private readonly resolvedRules = new Map<string, ExpandedRule>();
  private readonly themeRecord: Record<string, any>;
  private _lookUp: Trie.Trie<Record<string, any>> = Trie.empty();

  get meta() {
    return this.taggedRule.meta;
  }
  get feature() {
    return this.taggedRule.meta.feature;
  }
  get classNamesTrie() {
    if (Trie.size(this._lookUp) > 0) {
      return this._lookUp;
    }
    this._lookUp = Trie.fromIterable(
      Object.entries(this.themeRecord).map(([key, value]) => {
        const className = Utils.sanitizeClassName(this.taggedRule, key);
        return [className, { key, value, className }] as const;
      }),
    );
    return this._lookUp;
  }

  constructor(taggedRule: TwinRuleNode, themeRecord?: Record<string, any>) {
    this.taggedRule = taggedRule;
    this.patterns = taggedRule.pattern.split('|');
    this.themeRecord = themeRecord ?? {};
  }

  conformClassName(className: string) {
    return this.patterns.some((x) => className.startsWith(x)) || this.resolvedRules.has(className);
  }
}
