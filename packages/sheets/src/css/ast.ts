import { Platform } from 'react-native';
import type { AnyStyle, Context } from './css.types';
import { cssStyleToRN } from './declarations';
import { replaceDeclarationVariables } from './helpers';
import { cssDeclarationParser } from './parsers/property.parser';
import { shouldApplyAddRule } from './tokenizer';

class SheetNode {
  type: 'sheet' = 'sheet';
  value: Map<string, RuleNode | AtRuleNode> = new Map();

  addRule(css: string) {
    if (css.startsWith('@')) {
      const rule = new AtRuleNode(css);
      return rule;
    }
    const rule = new RuleNode(css);
    this.value.set(css, rule);
    return rule;
  }

  getRule(css: string) {
    return this.value.get(css);
  }
}

export class SelectorNode {
  type: 'selector' = 'selector';
  value: string;
  isPointer: boolean;
  isGroup: boolean;
  isPseudo: boolean;
  isFirst: boolean;
  isOdd: boolean;
  isEven: boolean;
  isLast: boolean;
  constructor(css: string) {
    this.value = this.parseSelector(css);
    this.isPointer =
      this.value.endsWith(':hover') ||
      this.value.endsWith(`:hover:${Platform.OS}`) ||
      this.value.endsWith(`:active:${Platform.OS}`) ||
      this.value.endsWith(`:focus:${Platform.OS}`) ||
      this.value.endsWith(':active') ||
      this.value.endsWith(':focus');
    this.isGroup =
      this.value.includes('.group-hover') ||
      this.value.includes('.group-active') ||
      this.value.includes('.group-focus');
    this.isFirst = this.value.includes('.first');
    this.isLast = this.value.includes('.last');
    this.isOdd = this.value.includes('.odd');
    this.isEven = this.value.includes('.even');
    this.isPseudo = this.value.includes(':');
  }

  private parseSelector(css: string) {
    const selectorEndIndex = css.indexOf('{');
    return css.slice(0, selectorEndIndex);
  }
}

export class RuleNode {
  type: 'rule' = 'rule';
  raw: string;
  value: {
    selector: SelectorNode;
    value: AnyStyle;
  };

  constructor(css: string) {
    this.raw = css;
    this.value = {
      selector: new SelectorNode(css),
      value: this.getDeclarations(),
    };
  }

  private getDeclarations() {
    const ruleEndIndex = this.raw.indexOf('}') + 1;
    const ruleStartIndex = this.raw.indexOf('{') + 1;
    const ruleDeclarations = this.raw.slice(ruleStartIndex, ruleEndIndex - 1);
    const rawStyles = replaceDeclarationVariables(ruleDeclarations);
    const list = rawStyles.split(';');
    return list.reduce((prev, current) => {
      const [name, value] = current.split(':');
      if (name && value) {
        Object.assign(prev, cssDeclarationParser(name, value));
      }
      return prev;
    }, {} as AnyStyle);
  }
}

export class AtRuleNode {
  type: 'at-rule' = 'at-rule';
  raw: string;
  condition: (context: Context) => boolean;
  value: {
    selector: SelectorNode;
    value: AnyStyle;
  };

  constructor(css: string) {
    this.condition = (context) => shouldApplyAddRule(css, context);
    this.raw = css;
    const selector = css.indexOf('{', css.indexOf('{')) + 1;
    this.value = {
      selector: new SelectorNode(css.slice(selector)),
      value: this.getDeclarations(),
    };
  }

  private getDeclarations() {
    const ruleEndIndex = this.raw.indexOf('}', this.raw.indexOf('}')) + 1;
    const ruleStartIndex = this.raw.indexOf('{', this.raw.indexOf('{') + 1);
    const ruleDeclarations = this.raw.slice(ruleStartIndex + 1, ruleEndIndex - 1);
    // const rawStyles = replaceDeclarationVariables(ruleDeclarations);
    const list = ruleDeclarations.split(';');
    return list.reduce((prev, current) => {
      const [name, value] = current.split(':');
      if (name && value) {
        Object.assign(prev, cssDeclarationParser(name, value));
      }
      return prev;
    }, {} as AnyStyle);
  }
}

const virtualSheet = new SheetNode();

export const cssToAst = (target: string[], context: Context) => {
  const response = {
    base: {} as AnyStyle,
    pointer: {} as AnyStyle,
    group: {} as AnyStyle,
    first: {} as AnyStyle,
    last: {} as AnyStyle,
    even: {} as AnyStyle,
    odd: {} as AnyStyle,
  };
  for (const current of target) {
    if (
      current.includes('ios') ||
      current.includes('android') ||
      current.includes('web') ||
      current.includes('native')
    ) {
      if (!current.includes(Platform.OS)) continue;
    }
    const rule = virtualSheet.getRule(current) ?? virtualSheet.addRule(current);
    if (rule.type === 'at-rule') {
      const isValid = rule.condition(context);
      if (!isValid) continue;
    }
    if (
      !rule.value.selector.isPointer &&
      !rule.value.selector.isGroup &&
      !rule.value.selector.isEven &&
      !rule.value.selector.isOdd &&
      !rule.value.selector.isFirst &&
      !rule.value.selector.isLast
    ) {
      Object.assign(response.base, cssStyleToRN(rule.value.value, context));
      continue;
    }
    if (rule.value.selector.isPointer) {
      Object.assign(response.pointer, cssStyleToRN(rule.value.value, context));
      continue;
    }
    if (rule.value.selector.isGroup) {
      Object.assign(response.group, cssStyleToRN(rule.value.value, context));
      continue;
    }
    if (rule.value.selector.isEven) {
      Object.assign(response.even, cssStyleToRN(rule.value.value, context));
      continue;
    }
    if (rule.value.selector.isOdd) {
      Object.assign(response.odd, cssStyleToRN(rule.value.value, context));
      continue;
    }
    if (rule.value.selector.isFirst) {
      Object.assign(response.first, cssStyleToRN(rule.value.value, context));
      continue;
    }
    if (rule.value.selector.isLast) {
      Object.assign(response.last, cssStyleToRN(rule.value.value, context));
      continue;
    }
  }

  return response;
};
