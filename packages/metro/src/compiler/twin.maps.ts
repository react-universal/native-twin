import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import type { Identifier } from 'ts-morph';
import { Node, SyntaxKind, ts } from 'ts-morph';
import type { RuntimeTW } from '@native-twin/core';
import { type SheetEntry } from '@native-twin/css';
import type { RuntimeComponentEntry } from '../sheet/sheet.types';
import {
  getChildRuntimeEntries,
  getEntriesObject,
  getEntryGroups,
  sheetEntriesOrder,
} from '../sheet/utils/styles.utils';
import type {
  JSXMappedAttribute,
  ValidJSXElementNode,
  ValidOpeningElementNode,
  ResultComponent,
} from './twin.types';
import { isValidJSXElement } from './utils/ts.guards';
import {
  addAttributeToJSXElement,
  getComponentID,
  getComponentStyledEntries,
  getIdentifierText,
  getImportDeclaration,
  getJSXElementConfig,
  getJSXElementTagName,
} from './utils/ts.utils';

export const getJSXElementNode = (
  node: Node,
  twin: RuntimeTW,
  order = 0,
  nodeParentID?: string,
): Option.Option<ResultComponent> => {
  return Option.Do.pipe(
    Option.bind('jsxElement', () => maybeValidElementNode(node)),

    Option.let('parentID', () => nodeParentID),
    Option.let('order', () => order),
    Option.bind('tagName', ({ jsxElement }) =>
      Option.fromNullable(getJSXElementTagName(jsxElement)),
    ),
    // Option.bind('importDeclaration', ({ tagName }) => maybeReactNativeImport(tagName)),
    Option.bind('styledConfig', ({ tagName }) =>
      Option.fromNullable(getJSXElementConfig(tagName)),
    ),
    Option.bind('openingElement', ({ jsxElement }) => getOpeningElement(jsxElement)),
    Option.let('mappedClassNames', ({ styledConfig, openingElement }) =>
      getComponentStyledEntries(openingElement, styledConfig),
    ),
    Option.let('fullEntries', ({ mappedClassNames }) =>
      getComponentEntries(twin, mappedClassNames),
    ),
    Option.let('runtimeEntries', ({ fullEntries }) => fullEntries),
    Option.let('childRuntimeEntries', ({ fullEntries }) =>
      getEntriesObject(getChildRuntimeEntries(fullEntries)),
    ),
    Option.let('componentID', ({ tagName, jsxElement }) =>
      getComponentID(
        jsxElement,
        jsxElement.getSourceFile().getFilePath(),
        getIdentifierText(tagName),
      ),
    ),
    Option.let('childComponents', ({ jsxElement, componentID, order }) =>
      getJSXElementChilds(jsxElement, twin, order++, componentID),
    ),
    Option.let('childsCount', ({ childComponents }) => childComponents.length),
  );
};

export const getJSXElementChilds = (
  jsxElement: ValidJSXElementNode,
  twin: RuntimeTW,
  order: number,
  parentID?: string,
) => {
  return pipe(
    jsxElement.getChildrenOfKind(SyntaxKind.JsxElement),
    RA.appendAll(jsxElement.getChildrenOfKind(SyntaxKind.JsxSelfClosingElement)),
    RA.map((x) => getJSXElementNode(x, twin, order++, parentID)),
    RA.getSomes,
  );
};

export const maybeValidElementNode = (node: Node): Option.Option<ValidJSXElementNode> => {
  return isValidJSXElement(node) ? Option.some(node) : Option.none();
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

export const getOpeningElement = (node: Node): Option.Option<ValidOpeningElementNode> => {
  if (Node.isJsxElement(node)) {
    return Option.some(node.getOpeningElement());
  } else if (Node.isJsxSelfClosingElement(node)) {
    return Option.some(node);
  }
  return Option.none();
};

export const getComponentEntries = (
  twin: RuntimeTW,
  mappedAttributes: JSXMappedAttribute[],
) => {
  const component = mappedAttributes.map((x): RuntimeComponentEntry => {
    const classNames = x.value.literal;

    const entries = pipe(twin(x.value.literal), RA.sort(sheetEntriesOrder));
    const groupedEntries = getEntriesObject(entries);
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
      groupedEntries,
    };
  });
  return component;
};

export const addPropsToChilds = (
  element: ValidJSXElementNode,
  childStyles: SheetEntry[],
  order: number,
) => {
  const childsCount = element.getChildCount();
  element.forEachChild((node) => {
    if (isValidJSXElement(node)) {
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
