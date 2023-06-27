import type { AstDimensionsNode } from '../types';

export const resolveCssCalc = (
  left: AstDimensionsNode,
  operator: string,
  right: AstDimensionsNode,
): AstDimensionsNode => {
  switch (operator) {
    case '+':
      return {
        ...left,
        value: left.value + right.value,
      };
    case '-':
      return {
        ...left,
        value: left.value - right.value,
      };
    case '*':
      return {
        ...left,
        value: left.value * right.value,
      };
    case '/':
      return {
        ...left,
        value: left.value / right.value,
      };
    default:
      return {
        ...left,
      };
  }
};
