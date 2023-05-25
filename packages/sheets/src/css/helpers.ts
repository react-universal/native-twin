import { normalizeClassNameString } from '../utils/helpers';
import type { AnyStyle, Context, RuleNode } from './css.types';

export const selectorIsGroupPointerEvent = (selector: string) => {
  return (
    selector.includes('group-hover:') ||
    selector.includes('group-focus:') ||
    selector.includes('group-active:')
  );
};

export const selectorIsPointerEvent = (selector: string) => {
  return (
    selector.includes('hover:') || selector.includes('focus:') || selector.includes('active:')
  );
};

export const getRulesForStyleType = (
  type: 'base' | 'pointer' | 'group' | 'even' | 'odd' | 'first' | 'last',
  rules: RuleNode[],
  generated: string[],
  context: Context,
): AnyStyle => {
  const styles = rules.filter((x) => {
    if (!generated.includes(x.selector)) {
      return false;
    }
    if (type === 'pointer') {
      return selectorIsPointerEvent(x.selector);
    }
    if (type === 'group') {
      return selectorIsGroupPointerEvent(x.selector);
    }
    if (type === 'even') {
      return x.selector.includes('even');
    }
    if (type === 'odd') {
      return x.selector.includes('odd');
    }
    if (type === 'first') {
      return x.selector.includes('first');
    }
    if (type === 'last') {
      return x.selector.includes('last');
    }
    if (type === 'base') {
      return !x.selector.includes(':');
    }
    return false;
  });
  return styles.reduce((acc, curr) => {
    return Object.assign(acc, curr.getStyles(context));
  }, {});
};

export const getCssForSelectors = (target: string[], generated: string[]) => {
  return target.reduce((acc, curr) => {
    const normalized = normalizeClassNameString(curr);
    const found = generated.find((x) => normalized.includes(x));
    if (found) {
      acc += curr;
    }
    return acc;
  }, ``);
};

export const replaceCSSValueVariables = (
  rawValue: string,
  variables: Record<string, string>,
) => {
  rawValue = rawValue.replace(/var\((--[\w-]+)\)/g, (match, p1) =>
    p1 in variables ? variables[p1]! : match,
  );
  return rawValue;
};
