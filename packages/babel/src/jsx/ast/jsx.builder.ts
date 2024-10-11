import * as t from '@babel/types';
import { getRawSheet, RuntimeComponentEntry } from '@native-twin/css/jsx';
import type { AnyPrimitive } from '@native-twin/helpers';
import { createPrimitiveExpression, hasJsxAttribute } from '../../babel';
import { JSXElementNode } from '../../models/JSXElement.model';
import { JSXChildElement } from '../jsx.types';
import { entriesToComponentData, runtimeEntriesToAst } from '../twin';

export const createRequireExpression = (path: string) => {
  return t.callExpression(t.identifier('require'), [t.stringLiteral(path)]);
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
  const newAttribute = createJsxAttribute(name, value);
  if (hasJsxAttribute(element, name, value)) {
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

export const JSXElementHasAttribute = (element: t.JSXElement, name: string) => {
  return element.openingElement.attributes.some(
    (x) =>
      x.type === 'JSXAttribute' &&
      x.name.type === 'JSXIdentifier' &&
      x.name.name === name,
  );
};

export function addTwinPropsToElement(
  elementNode: JSXElementNode,
  entries: RuntimeComponentEntry[],
  options: {
    componentID: boolean;
    order: boolean;
    styledProps: boolean;
    templateStyles: boolean;
  },
) {
  const stringEntries = entriesToComponentData(elementNode.id, getRawSheet(entries));
  const astProps = runtimeEntriesToAst(stringEntries.styledProp);
  // const treeProp = elementNodeToTree(elementNode, filename, elementNode.);

  if (options.componentID) {
    addJsxAttribute(elementNode.path, '_twinComponentID', elementNode.id);
  }

  if (options.order) {
    addJsxAttribute(elementNode.path, '_twinOrd', elementNode.order);
  }

  if (options.styledProps && astProps) {
    addJsxExpressionAttribute(elementNode.path, '_twinComponentSheet', astProps);
  }

  if (options.templateStyles && stringEntries.templateEntries) {
    const astTemplate = runtimeEntriesToAst(stringEntries.templateEntries);
    if (astTemplate) {
      addJsxExpressionAttribute(
        elementNode.path,
        '_twinComponentTemplateEntries',
        astTemplate,
      );
    }
  }
  return astProps;
}

export function compileCssForElement(
  elementNode: JSXElementNode,
  entries: RuntimeComponentEntry[],
  options: {
    componentID: boolean;
    order: boolean;
    styledProps: boolean;
    templateStyles: boolean;
  },
) {
  // const stringEntries = entriesToObject(elementNode.id, getRawSheet(entries));
  // const astProps = runtimeEntriesToAst(stringEntries.styledProp);
  // const treeProp = elementNodeToTree(elementNode, filename, elementNode.);
  // const astTemplate = runtimeEntriesToAst(stringEntries.templateEntries);
  //
  // if (options.componentID) {
  //   addJsxAttribute(elementNode.path, '_twinComponentID', elementNode.id);
  // }
  // if (options.order) {
  //   addJsxAttribute(elementNode.path, '_twinOrd', elementNode.order);
  // }
}
