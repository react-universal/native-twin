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

function declarationCanBeReplaced /* #__PURE__ */(value: unknown): asserts value is string {
  if (typeof value !== 'string')
    throw new SyntaxError(`trying to parse ${value} as string but got: ${typeof value}`);
}

export function replaceDeclarationVariables /* #__PURE__ */(declarations: string) {
  if (declarations.includes('var(')) {
    const variable = declarations.split(';');
    let variableRule = variable[0];
    let declaration = `${variable[1]}`;
    declarationCanBeReplaced(variableRule);
    const slicedDeclaration = variableRule.split(':');
    const variableName = slicedDeclaration[0];
    const variableValue = slicedDeclaration[1];
    declarationCanBeReplaced(variableValue);
    return declaration.replace(/(var\((--[\w-]+)\))/g, (match, _p1, p2) => {
      if (p2 === variableName) {
        return variableValue;
      }
      return match;
    });
  }
  return declarations;
}
