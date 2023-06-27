import type { StylesheetGroup } from '../types';

export function normalizeCssSelectorString(className: string): string {
  let result = className.replace(/\\/g, '').replace('.', '');
  result = result.includes(':') ? result.split(':')[1]! : result;
  return result;
}

export const selectorIsGroupPointerEvent = (selector: string) => {
  return (
    selector.includes('group-hover:') ||
    selector.includes('group-focus:') ||
    selector.includes('group-active:')
  );
};

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

export const getSelectorGroup = (selector: string): StylesheetGroup => {
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
