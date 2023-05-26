import { normalizeCssSelectorString } from '../utils/helpers';

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

export const getCssForSelectors = (target: string[], generated: string[]) => {
  return target.reduce((acc, curr) => {
    const normalized = normalizeCssSelectorString(curr);
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

export function removeCssComment(css: string): string {
  return css.replace(/\/\*[^]*?\*\/|\s\s+|\n/gm, '');
}
