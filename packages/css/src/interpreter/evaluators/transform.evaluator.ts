import type { CssTransformValueNode, EvaluatorConfig } from '../../types';
import { evaluateDimensionsNode } from './units.evaluator';

export const evaluateTransformNode = (
  node: CssTransformValueNode,
  config: EvaluatorConfig,
) => {
  const result: any = [{ translateX: evaluateDimensionsNode(node.x, config) }];
  if (node.y) {
    result.push({ translateY: evaluateDimensionsNode(node.y, config) });
  }
  return result;
};
