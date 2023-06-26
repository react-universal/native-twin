import type { SelectorGroup } from '../types';

class CssRootNode {
  // PROPS
  rules: Map<string, [SelectorGroup, Record<string, any>]> = new Map();
  // STATIC
  static instance: CssRootNode;
  static getInstance = () => {
    if (!this.instance) {
      return new CssRootNode();
    }
    return this.instance;
  };

  addRule(cs: string): [string, string] {
    // ^?
    const endOfSelector = cs.indexOf('{');
    return [cs.slice(0, endOfSelector), cs.slice(endOfSelector + 1, -1)];
  }

  addRules(css: string[]) {
    return css.map(this.addRule);
  }
}

export const SheetRootNode = CssRootNode.getInstance();
