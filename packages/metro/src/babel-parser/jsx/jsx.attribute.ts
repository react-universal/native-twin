import * as t from '@babel/types';
import { AnyPrimitive, JSXChildElement } from './jsx.types';

export const createPrimitiveExpression = <T extends AnyPrimitive>(value: T) => {
  if (typeof value === 'string') return t.stringLiteral(value);
  if (typeof value === 'number') return t.numericLiteral(value);
  return t.booleanLiteral(value);
};
export const createJsxAttribute = (name: string, value: AnyPrimitive) => {
  const expression = createPrimitiveExpression(value);
  return t.jsxAttribute(t.jsxIdentifier(name), t.jsxExpressionContainer(expression));
};

export const hasJsxAttribute = (
  element: JSXChildElement,
  name: string,
  value: AnyPrimitive,
) => {
  if (!t.isJSXElement(element)) return false;
  return element.openingElement.attributes.some((x) =>
    t.isJSXAttribute(x, {
      name: t.jsxIdentifier(name),
      value: t.jsxExpressionContainer(createPrimitiveExpression(value)),
    }),
  );
};

export const addJsxAttribute = (
  element: JSXChildElement,
  name: string,
  value: AnyPrimitive,
) => {
  if (!t.isJSXElement(element)) return;
  if (hasJsxAttribute(element, name, value)) return;
  const newAttribute = createJsxAttribute(name, value);
  element.openingElement.attributes.push(newAttribute);
};
