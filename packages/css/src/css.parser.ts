import { evaluateTreeDeclarations } from './interpreter/evaluators/declarations.evaluator';
import * as parser from './interpreter/lib';
import { parseCssToRuleNodes, ParsedRuleNode } from './interpreter/tokenizer/sheet.tokenizer';
import type { EvaluatorConfig, SelectorGroup } from './types';

const evaluateTree = (
  tree: ParsedRuleNode,
  config: EvaluatorConfig,
): [SelectorGroup, Record<string, any>] => {
  return [tree.group, evaluateTreeDeclarations(tree.declarations, config)];
};

export const parseCssString = (input: string, context: EvaluatorConfig) => {
  const ast = parser.apply(parseCssToRuleNodes, input);
  return evaluateTree(ast[0]![0], context);
};
