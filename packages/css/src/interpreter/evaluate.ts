import type { CssNodeMonad } from '../parser/CssParser';
import type {
  CssAstNode,
  CssRawRuleNode,
  CssRawSheetNode,
  CssRuleNode,
  CssSheetNode,
} from '../types';
import { parseRuleDeclarations } from './tokenizer/declaration.tokenizer';

const evaluateRawRuleNode = (node: CssRawRuleNode): CssRuleNode => {
  const value = parseRuleDeclarations(node.value).at(0)?.[0]!;
  return {
    type: 'rule',
    selector: node.selector,
    declarations: value,
  } as CssRuleNode;
};

const evaluateRawCssTree = (node: CssRawSheetNode): CssSheetNode => {
  return {
    type: 'sheet',
    rules: node.rules.map((rule) => evaluateRawRuleNode(rule)),
  };
};

export const evaluateRawTree = (tree: CssNodeMonad<CssAstNode>) => {
  return tree.flatMap((x) => {
    if (x.type === 'raw-sheet') {
      return evaluateRawCssTree(x);
    }
    return x;
  });
};
