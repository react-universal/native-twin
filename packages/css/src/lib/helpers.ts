import type { AstDimensionsNode, SelectorGroup } from '../types';

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

export const getSelectorGroup = (selector: string): SelectorGroup => {
  if (
    selector.includes('.group-hover') ||
    selector.includes('.group-active') ||
    selector.includes('.group-focus')
  ) {
    return 'group';
  }
  if (
    selector.includes(':hover') ||
    selector.includes(':active') ||
    selector.includes(':focus')
  ) {
    return 'pointer';
  }
  if (selector.includes('.first')) return 'first';
  if (selector.includes('.last')) return 'last';
  if (selector.includes('.odd')) return 'odd';
  if (selector.includes('.even')) return 'even';
  return 'base';
};

export function kebab2camel(input: string) {
  if (!input.includes('-')) return input;
  return input.replace(/-./g, (x) => x.toUpperCase().charAt(1));
}
