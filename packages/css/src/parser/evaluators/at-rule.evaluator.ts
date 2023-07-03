import type { AstDeclarationNode, EvaluatorConfig } from '../../types';
import { evaluateDimensionsNode } from './dimensions.evaluator';

export const evaluateMediaQueryConstrains = (
  node: AstDeclarationNode,
  context: EvaluatorConfig,
) => {
  if (node.value.type === 'DIMENSIONS') {
    const value = evaluateDimensionsNode(node.value, context);
    let valueNumber = typeof value === 'number' ? value : parseFloat(value);

    if (node.property === 'width') {
      return context.deviceWidth == valueNumber;
    }

    if (node.property === 'height') {
      return context.deviceHeight == valueNumber;
    }

    if (node.property === 'min-width') {
      return context.deviceWidth >= valueNumber;
    }

    if (node.property === 'max-width') {
      return context.deviceWidth <= valueNumber;
    }

    if (node.property === 'min-height') {
      return context.deviceHeight >= valueNumber;
    }

    if (node.property === 'max-height') {
      return context.deviceHeight <= valueNumber;
    }
  }
  return true;
};
