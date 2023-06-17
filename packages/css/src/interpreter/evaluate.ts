import { pipe } from '../pipe.composer';
import { parseRuleDeclarations } from './lexer/declaration.tokenizer';
import type * as parser from './lib';

interface SelectorNode extends parser.CssAstNode<'selector', string> {}
interface RuleNode extends parser.CssAstNode<'rule', string> {}

export interface SheetNode extends parser.CssAstNode<'sheet'> {
  readonly value: {
    readonly selector: SelectorNode;
    readonly rule: RuleNode;
  }[];
}

type AnyCss = SelectorNode | RuleNode | SheetNode;

const evaluateRuleNode = (node: RuleNode) => {
  const value = parseRuleDeclarations(node.value).at(0)?.[0]!;
  return value;
};

export interface CssResult {
  selector: string;
  declaration: {
    type: 'declaration';
    value: { property: string; value: string }[];
  };
}

export const evaluateCssTree = (node: AnyCss): CssResult[] => {
  switch (node.type) {
    case 'rule':
      return evaluateRuleNode(node) as any;
    case 'selector':
      return node.value as any;
    case 'sheet':
      return node.value.map((a) => ({
        selector: evaluateCssTree(a.selector) as any,
        declaration: evaluateCssTree(a.rule) as any,
      }));
    default:
      return node;
  }
};

export const evaluateSheet = (rootNode: SheetNode) => {
  const result = pipe(rootNode, evaluateCssTree);
  return result;
};
