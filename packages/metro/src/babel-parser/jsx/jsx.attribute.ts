import template from '@babel/template';
import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { RuntimeTW } from '@native-twin/core';
import { getSheetEntryStyles as getSheetEntryStylesRuntime } from '@native-twin/jsx/build/utils/sheet.utils';
import { getSheetEntryStyles } from '../twin/styles.compiler';
import { createObjectExpression, createPrimitiveExpression } from '../utils/babel.utils';
import { AnyPrimitive, JSXChildElement } from './jsx.types';

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

export const visitJSXAttribute = (attribute: NodePath<t.JSXAttribute>, tw: RuntimeTW) => {
  if (attribute.node.name.name === 'className') {
    if (t.isJSXExpressionContainer(attribute.node.value)) {
      if (t.isTemplateLiteral(attribute.node.value.expression)) {
        const cooked = attribute.node.value.expression.quasis
          .map((x) => x.value.cooked?.trim().replace(/\n/g, ' ').replace(/\s+/g, ' '))
          .filter((x) => x !== undefined);
        console.log('COOKED: ', cooked.join(' '));
      }
    }
    if (t.isStringLiteral(attribute.node.value)) {
      const entries = tw(attribute.node.value.value);
      const sheet = getSheetEntryStyles(entries, tw);
      const styles = createObjectExpression(sheet);
      const newAttribute = t.jsxAttribute(
        t.jsxIdentifier('style'),
        t.jsxExpressionContainer(styles),
      );
      // attribute.replaceWith(newAttribute);
      if (t.isJSXOpeningElement(attribute.parent)) {
        attribute.parent.attributes.push(newAttribute);
      }
      // console.log('PARENT: ', attribute.parent.type);
      // if (t.isJSXOpeningElement(attribute.parent)) {
      //   const newAttribute = t.jsxAttribute(
      //     t.jsxIdentifier('getStyles'),
      //     t.jsxExpressionContainer(createBabelStylesTemplate()),
      //   );
      //   attribute.parent.attributes.push(newAttribute);
      // }
    }
  }
};

export function createBabelStylesTemplate() {
  const ast = template.expression(`
    ${getSheetEntryStylesRuntime.toString()}
  `);
  return ast();
}
