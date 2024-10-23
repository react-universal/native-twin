import * as t from '@babel/types';
import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import type { AnyPrimitive } from '@native-twin/helpers';
import type { JSXChildElement } from '../models/jsx.models';
import { isJSXAttribute } from './babel.predicates';
import { createPrimitiveExpression, getBindingImportSource } from './babel.utils';
import type { JSXElementNodePath } from '../models/jsx.models';

const createJsxAttribute = (name: string, value: AnyPrimitive) => {
  const expression = createPrimitiveExpression(value);
  return t.jsxAttribute(t.jsxIdentifier(name), t.jsxExpressionContainer(expression));
};

const JSXElementHasAttribute = (element: t.JSXElement, name: string) => {
  return element.openingElement.attributes.some(
    (x) =>
      x.type === 'JSXAttribute' &&
      x.name.type === 'JSXIdentifier' &&
      x.name.name === name,
  );
};

export const addJsxAttribute = (
  element: JSXChildElement,
  name: string,
  value: AnyPrimitive,
) => {
  if (!t.isJSXElement(element)) return;
  const newAttribute = createJsxAttribute(name, value);
  if (!JSXElementHasAttribute(element, name)) {
    return element.openingElement.attributes.push(newAttribute);
  }

  element.openingElement.attributes = element.openingElement.attributes.map((x) => {
    if (x.type === 'JSXSpreadAttribute') return x;
    if (
      x.type === 'JSXAttribute' &&
      x.name.type === 'JSXIdentifier' &&
      x.name.name === name
    ) {
      return newAttribute;
    }
    return x;
  });

  return;
};

export const addJsxExpressionAttribute = (
  element: JSXChildElement,
  name: string,
  value: t.Expression,
) => {
  if (!t.isJSXElement(element)) return;
  const newAttribute = t.jsxAttribute(
    t.jsxIdentifier(name),
    t.jsxExpressionContainer(value),
  );

  if (JSXElementHasAttribute(element, name)) {
    console.log('ALREADY_HAS: ', name);
    element.openingElement.attributes = element.openingElement.attributes.map((x) => {
      if (x.type === 'JSXSpreadAttribute') return x;
      if (
        x.type === 'JSXAttribute' &&
        x.name.type === 'JSXIdentifier' &&
        x.name.name === name
      ) {
        return newAttribute;
      }
      return x;
    });
    return;
  }

  element.openingElement.attributes.push(newAttribute);
};

export const getJSXElementName = (
  openingElement: t.JSXOpeningElement,
): Option.Option<string> => {
  if (t.isJSXIdentifier(openingElement.name)) {
    return Option.some(openingElement.name.name);
  }
  return Option.none();
};

/**
 * @domain Babel
 * @description Extract the {@link t.JSXAttribute[]} from any {@link t.JSXElement}
 * */
export const getJSXElementAttrs = (element: t.JSXElement): t.JSXAttribute[] =>
  pipe(element.openingElement.attributes, RA.filter(isJSXAttribute));

export const getJSXElementSource = (path: JSXElementNodePath) =>
  pipe(
    getJSXElementName(path.node.openingElement),
    Option.flatMap((x) => Option.fromNullable(path.scope.getBinding(x))),
    Option.flatMap((binding) => getBindingImportSource(binding)),
    Option.getOrElse(() => ({ kind: 'local', source: 'unknown' })),
  );
