import type { CssParserData } from '../types';

export const evaluateMediaQueryConstrains = (
  node: {
    value: number;
    property: string;
  },
  context: CssParserData,
) => {
  if (typeof node.value == 'number') {
    const value = node.value;
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
