import * as Option from 'effect/Option';
import type {
  Identifier,
  JsxElement,
  JsxOpeningElement,
  JsxSelfClosingElement,
} from 'ts-morph';
import { Node, ts } from 'ts-morph';
import type { RuntimeComponentEntry } from '@native-twin/babel/build/jsx';
import type { RuntimeTW } from '@native-twin/core';
import { getEntryGroups } from '../sheet/utils/styles.utils';
import type { JSXMappedAttribute } from './twin.types';
import {
  addAttributeToJSXElement,
  getImportDeclaration,
  getJSXElementAttributes,
  getJSXElementTagName,
} from './utils/ts.utils';

export const maybeValidElementNode = (
  node: Node,
): Option.Option<JsxElement | JsxSelfClosingElement> => {
  return Node.isJsxElement(node) || Node.isJsxSelfClosingElement(node)
    ? Option.some(node)
    : Option.none();
};

export const maybeReactNativeImport = (
  ident: Identifier,
): Option.Option<ts.ImportDeclaration> => {
  return Option.fromNullable(getImportDeclaration(ident)).pipe(
    Option.flatMap((x) => {
      const moduleSpecifier = x.moduleSpecifier;
      if (!ts.isStringLiteral(moduleSpecifier)) return Option.none();
      if (moduleSpecifier.text !== 'react-native') return Option.none();

      return Option.some(x);
    }),
  );
};

export const getComponentID = (node: Node, filename: string, tagName: string) => {
  return `${filename}-${node.getStart()}-${node.getEnd()}-${tagName}`;
};
export const getOpeningElement = (
  node: Node,
): Option.Option<JsxOpeningElement | JsxSelfClosingElement> => {
  if (Node.isJsxElement(node)) {
    return Option.some(node.getOpeningElement());
  } else if (Node.isJsxSelfClosingElement(node)) {
    return Option.some(node);
  }
  return Option.none();
};

export const getIdentifierText = (node: Identifier) => node.compilerNode.text;

export const getJSXElementNode = (node: Node) => {
  return Option.Do.pipe(
    Option.bind('jsxElement', () => maybeValidElementNode(node)),
    Option.bind('tagName', ({ jsxElement }) =>
      Option.fromNullable(getJSXElementTagName(jsxElement)),
    ),
    Option.bind('importDeclaration', ({ tagName }) => maybeReactNativeImport(tagName)),
    Option.bind('attributes', ({ jsxElement }) =>
      Option.fromNullable(getJSXElementAttributes(jsxElement)),
    ),
    Option.let('componentID', ({ tagName, jsxElement }) =>
      getComponentID(
        jsxElement,
        jsxElement.getSourceFile().getFilePath(),
        getIdentifierText(tagName),
      ),
    ),
    Option.bind('openingElement', ({ jsxElement }) => getOpeningElement(jsxElement)),
  );
};

export const getComponentEntries = (
  twin: RuntimeTW,
  mappedAttributes: JSXMappedAttribute[],
) => {
  const component = mappedAttributes.map((x): RuntimeComponentEntry => {
    const classNames = x.value.literal;

    const entries = twin(x.value.literal);
    return {
      prop: x.prop,
      target: x.target,
      templateLiteral: x.value.templates,
      metadata: getEntryGroups({
        classNames: classNames,
        entries,
        expression: x.value.templates,
        prop: x.prop,
        target: x.target,
      }),
      entries,
    };
  });
  return component;
};

export const addOrderToChilds = (
  element: JsxElement | JsxSelfClosingElement,
  order: number,
) => {
  const childsCount = element.getChildCount();
  element.forEachChild((node) => {
    if (Node.isJsxElement(node) || Node.isJsxSelfClosingElement(node)) {
      // const tagName = Option.fromNullable(getJSXElementTagName(node)).pipe(
      //   Option.getOrNull,
      // );
      // if (tagName && Option.isNone(maybeReactNativeImport(tagName))) {
      //   return undefined;
      // }
      if (order === 0) {
        addAttributeToJSXElement(node, 'isFirstChild', `{true}`);
      }
      addAttributeToJSXElement(node, 'ord', `{${order++}}`);
      if (order === childsCount) {
        addAttributeToJSXElement(node, 'isLastChild', `{true}`);
      }
    }
  });
  return {
    childsCount,
    finalOrder: order,
  };
};
