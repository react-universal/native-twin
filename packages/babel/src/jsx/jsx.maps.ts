import * as t from '@babel/types';
import type { RuntimeTW } from '@native-twin/core';
import {
  createPrimitiveExpression,
  templateLiteralToStringLike,
} from '../babel/babel.constructors';
import { hasJsxAttribute } from '../babel/babel.validators';
import type { MappedComponent } from '../utils/component.maps';
import type {
  AnyPrimitive,
  JSXChildElement,
  JSXElementHandler,
  JSXMappedAttribute,
  StyledPropEntries,
} from './jsx.types';

export const addOrderToJSXChilds = (element: JSXElementHandler) => {
  let ord = 0;
  element.mutateChilds((x) => {
    if (!t.isJSXElement(x)) return x;
    if (ord === 0) {
      addJsxAttribute(x, 'firstChild', true);
    }
    addJsxAttribute(x, 'ord', ord++);
    if (ord === element.childrenCount) {
      addJsxAttribute(x, 'lastChild', true);
    }
    return x;
  });
};

export const extractElementClassNames = (
  attributes: t.JSXAttribute[],
  config: MappedComponent,
) => {
  return attributes.map((x) => extractClassNameProp(x, config)).filter((x) => x !== null);
};

export const extractClassNameProp = (
  attribute: t.JSXAttribute,
  config: MappedComponent,
): JSXMappedAttribute | null => {
  const validClassNames = Object.entries(config.config);
  if (!t.isJSXAttribute(attribute)) return null;
  if (!t.isJSXIdentifier(attribute.name)) return null;
  const className = validClassNames.find((x) => attribute.name.name === x[0]);
  if (!className) return null;

  if (t.isStringLiteral(attribute.value)) {
    return {
      prop: className[0],
      target: className[1],
      value: attribute.value,
    };
  }
  if (
    t.isJSXExpressionContainer(attribute.value) &&
    t.isTemplateLiteral(attribute.value.expression)
  ) {
    return {
      prop: className[0],
      target: className[1],
      value: attribute.value.expression,
    };
  }
  return null;
};

export const compileMappedAttributes = (
  mapped: JSXMappedAttribute[],
  twin: RuntimeTW,
) => {
  return mapped.map((x) => compileMappedAttribute(x, twin));
};

const compileMappedAttribute = (classNameValue: JSXMappedAttribute, twin: RuntimeTW) => {
  const classProp: StyledPropEntries = {
    entries: [],
    prop: classNameValue.prop,
    target: classNameValue.target,
    expression: null,
    classNames: '',
  };
  if (t.isStringLiteral(classNameValue.value)) {
    classProp.classNames = classNameValue.value.value;
    classProp.entries = twin(classNameValue.value.value);
  }
  if (t.isTemplateLiteral(classNameValue.value)) {
    const cooked = templateLiteralToStringLike(classNameValue.value);
    classProp.classNames = cooked.strings;
    classProp.entries = twin(`${cooked.strings}`);
    // classProp.expression = cooked.expressions;
  }

  return classProp;
};

export const createJsxAttribute = (name: string, value: AnyPrimitive) => {
  const expression = createPrimitiveExpression(value);
  return t.jsxAttribute(t.jsxIdentifier(name), t.jsxExpressionContainer(expression));
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

export const createRequireExpression = (path: string) => {
  return t.callExpression(t.identifier('require'), [t.stringLiteral(path)]);
};
