import type { ParsedRule } from '@universal-labs/twind-adapter';

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

export const hasPointerModifier = (utility: ParsedRule) => {
  return (
    utility.v.includes('hover') || utility.v.includes('active') || utility.v.includes('focus')
  );
};

export const hasGroupModifier = (utility: ParsedRule) => {
  return (
    utility.v.includes('group-hover') ||
    utility.v.includes('group-active') ||
    utility.v.includes('group-focus')
  );
};

export const hasModifier = (utility: ParsedRule, modifier: string) => {
  return utility.v.includes(modifier);
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
