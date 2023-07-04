import type { AstDimensionsNode, CssParserData } from '../types';
import { evaluateDimensionsNode } from './dimensions.evaluator';

export const evaluateMediaQueryConstrains = (
  node: {
    value: AstDimensionsNode;
    property: string;
  },
  context: CssParserData,
) => {
  console.log('NODE: ', node);
  if (node.value.type === 'DIMENSIONS') {
    const value = evaluateDimensionsNode(node.value, context);
    let valueNumber = typeof value === 'number' ? value : parseFloat(value);
    console.log('valueNumber: ', valueNumber, context.deviceWidth);
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
