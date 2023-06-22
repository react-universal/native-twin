import { evaluateTreeDeclarations } from './interpreter/evaluators/declarations.evaluator';
import { parseCssToRuleNodes } from './parser/tokens/sheet.tokenizer';
import type { EvaluatorConfig, SelectorGroup } from './types';

const evaluateTree = (
  tree: any,
  config: EvaluatorConfig,
): [SelectorGroup, Record<string, any>] => {
  return [tree.group, evaluateTreeDeclarations(tree.declarations, config)];
};

export const parseCssString = (input: string, context: EvaluatorConfig) => {
  const alt = parseCssToRuleNodes(input);
  return evaluateTree(alt[0]?.[0] || { declarations: [], group: 'base' }, context);
};
