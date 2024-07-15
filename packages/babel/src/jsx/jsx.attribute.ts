import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { RuntimeTW } from '@native-twin/core';
import { SheetEntry } from '@native-twin/css';
import { createObjectExpression, createPrimitiveExpression } from '../utils/babel.utils';
import { MappedComponent, mappedComponents } from '../utils/component.maps';
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

interface StyledProp {
  entries: SheetEntry[];
  prop: string;
  target: string;
}
export const visitJSXAttribute = (
  openingElement: NodePath<t.JSXOpeningElement>,
  attribute: NodePath<t.JSXAttribute>,
  twin: RuntimeTW,
) => {
  if (!t.isJSXIdentifier(openingElement.node.name)) return;
  const componentName = openingElement.node.name;
  const componentConfig = mappedComponents.find((x) => x.name === componentName.name);
  if (!componentConfig) return;

  const classNameValue = extractClassNameProp(attribute, componentConfig);

  if (!classNameValue) return;
  let expressions: { prop: string; expression: t.TemplateLiteral } | null = null;
  const classProp: StyledProp = {
    entries: [],
    prop: classNameValue.prop,
    target: classNameValue.target,
  };
  if (t.isStringLiteral(classNameValue.value)) {
    classProp.entries = twin(classNameValue.value.value);
  }
  if (t.isTemplateLiteral(classNameValue.value)) {
    const cooked = templateLiteralToStringLike(classNameValue.value);
    classProp.entries = twin(cooked.strings);
    console.log('COOKED: ', cooked);
    expressions = { expression: cooked.expressions, prop: classNameValue.target };
  }

  openingElement.node.attributes = openingElement.node.attributes.filter(
    (x) =>
      t.isJSXAttribute(x) &&
      (t.isIdentifier(x.name, { name: 'styledProps' }) ||
        t.isIdentifier(x.name, { name: 'entries_expressions' })),
  );

  if (expressions) {
    const expressionsProp = t.jsxAttribute(
      t.jsxIdentifier('entries_expressions'),
      t.jsxExpressionContainer(
        t.arrayExpression([
          t.stringLiteral(classNameValue.target),
          expressions.expression,
        ]),
      ),
    );

    openingElement.node.attributes.push(expressionsProp);
  }

  const jsxClassProp = t.jsxAttribute(
    t.jsxIdentifier('styledProps'),
    t.jsxExpressionContainer(createObjectExpression({...classProp})),
  );
  openingElement.node.attributes.push(jsxClassProp);
};

const extractClassNameProp = (
  path: NodePath<t.JSXAttribute>,
  config: MappedComponent,
): {
  prop: string;
  value: t.StringLiteral | t.TemplateLiteral;
  target: string;
} | null => {
  const validClassNames = Object.entries(config.config);
  if (!t.isJSXAttribute(path.node)) return null;
  if (!t.isJSXIdentifier(path.node.name)) return null;
  const className = validClassNames.find((x) => path.node.name.name === x[0]);
  if (!className) return null;

  if (t.isStringLiteral(path.node.value)) {
    return {
      prop: className[0],
      target: className[1],
      value: path.node.value,
    };
  }
  if (
    t.isJSXExpressionContainer(path.node.value) &&
    t.isTemplateLiteral(path.node.value.expression)
  ) {
    return {
      prop: className[0],
      target: className[1],
      value: path.node.value.expression,
    };
  }
  return null;
};

export const templateLiteralToStringLike = (literal: t.TemplateLiteral) => {
  const strings = literal.quasis
    .map((x) => x.value.cooked?.trim().replace(/\n/g, ' ').replace(/\s+/g, ' '))
    .filter((x) => x !== undefined)
    .join(' ');
  const expressions = t.templateLiteral(
    literal.quasis.map(() => t.templateElement({ raw: '', cooked: '' })),
    literal.expressions,
  );
  return { strings, expressions: expressions };
};
