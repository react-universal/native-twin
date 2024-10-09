import { getRawSheet, RuntimeComponentEntry } from '@native-twin/css/jsx';
import type { AnyPrimitive } from '@native-twin/helpers';
import { createPrimitiveExpression, hasJsxAttribute } from '../../babel';
import { JSXElementNode } from '../../models/JSXElement.model';
import { JSXChildElement } from '../jsx.types';
import { entriesToObject, runtimeEntriesToAst } from '../twin';
import * as t from '@babel/types';

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
  if (hasJsxAttribute(element, name, value)) return;
  const newAttribute = createJsxAttribute(name, value);
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
  element.openingElement.attributes.push(newAttribute);
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
  const stringEntries = entriesToObject(elementNode.id, getRawSheet(entries));
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
