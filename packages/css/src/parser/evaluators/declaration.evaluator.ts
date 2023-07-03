import type { AstDeclarationNode, EvaluatorConfig } from '../../types';
import { kebab2camel } from '../helpers';
import { evaluateDimensionsNode } from './dimensions.evaluator';

export const declarationAsStyle = (node: AstDeclarationNode, context: EvaluatorConfig) => {
  if (node.value.type === 'DIMENSIONS') {
    return {
      [kebab2camel(node.property)]: evaluateDimensionsNode(node.value, context),
    };
  }
  if (node.value.type === 'FLEX') {
    return {
      flexBasis: evaluateDimensionsNode(node.value.flexBasis, context),
      flexGrow: evaluateDimensionsNode(node.value.flexGrow, context),
      flexShrink: evaluateDimensionsNode(node.value.flexShrink, context),
    };
  }
  if (node.value.type === 'TRANSFORM') {
    const transform: {
      translateX?: number | string;
      translateY?: number | string;
      translateZ?: number | string;
    }[] = [{ translateX: evaluateDimensionsNode(node.value.x, context) }];
    if (node.value.y) {
      transform.push({ translateY: evaluateDimensionsNode(node.value.y, context) });
    }
    if (node.value.z) {
      transform.push({ translateZ: evaluateDimensionsNode(node.value.z, context) });
    }
    return { transform };
  }
  return { [kebab2camel(node.property)]: node.value.value };
};
