import type { Context } from '../css.types';
import type { CssValueCalcNode } from '../types';
import { evaluateDimensionsValue } from './dimensions';

export function min(string: string) {
  const values = string.split(',').map((val) => parseFloat(val.trim()));
  return Math.min(...values);
}
export function max(string: string) {
  const values = string.split(',').map((val) => parseFloat(val.trim()));
  return Math.max(...values);
}

export function evaluateCalcOperation(node: CssValueCalcNode, context: Context) {
  switch (node.operation) {
    case '+':
      return (
        evaluateDimensionsValue(node.left, context) +
        evaluateDimensionsValue(node.right, context)
      );
    case '-':
      return (
        evaluateDimensionsValue(node.left, context) -
        evaluateDimensionsValue(node.right, context)
      );
    case '*':
      return (
        evaluateDimensionsValue(node.left, context) *
        evaluateDimensionsValue(node.right, context)
      );
    case '/':
      return (
        evaluateDimensionsValue(node.left, context) /
        evaluateDimensionsValue(node.right, context)
      );
    default:
      return 0;
  }
}
