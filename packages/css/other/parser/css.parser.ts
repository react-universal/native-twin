import { evaluateTreeDeclarations } from '../interpreter/evaluators/declarations.evaluator';
import type { EvaluatorConfig, SelectorGroup } from '../types';
import * as parser from './Parser';
import { parseAtRule, parseCssToRuleNodes } from './tokens/sheet.tokenizer';

const evaluateTree = (
  tree: any,
  config: EvaluatorConfig,
): [SelectorGroup, Record<string, any>] => {
  return [tree.group, evaluateTreeDeclarations(tree.declarations, config)];
};

export const CssParser = parser.recursiveParser(() =>
  parser.choice([parseCssToRuleNodes, parseAtRule]),
);

export const parseCssString = (input: string, context: EvaluatorConfig) => {
  const alt = parseCssToRuleNodes(input);
  return evaluateTree(alt[0]?.[0] || { declarations: [], group: 'base' }, context);
};
