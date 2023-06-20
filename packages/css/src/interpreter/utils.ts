import type { SelectorGroup } from '../types';

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
  return input.replace(/-./g, (x) => x.toUpperCase().charAt(1));
}
