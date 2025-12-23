import type * as vscode from 'vscode';
import type { ParseResult } from '@babel/parser';
import * as _babelParser from '@babel/parser';
import traverse, { type NodePath } from '@babel/traverse';
import type * as t from '@babel/types';
import {
  createCommonMappedAttribute,
  type MappedComponent,
  mappedComponents,
} from '@native-twin/core';
import { makeTreeFrom } from '@native-twin/helpers/tree';
import * as Chunk from 'effect/Chunk';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Stream from 'effect/Stream';
import { VscodeContext } from '../extension/extension.service';

const make = Effect.gen(function* () {
  yield* VscodeContext;

  const babelParseDocument = (document: vscode.TextDocument) =>
    babelParse(document.getText(), document.fileName);

  const getLanguageRegions = (node: JSXElementPath) => {
    const openingElement = node.get('openingElement');
    // const attributes = openingElement.get('attributes').filter((x) => x.isJSXAttribute());
    const jsxElementName = openingElement.get('name');
    if (!jsxElementName.isJSXIdentifier()) return [];
    const mappedComponent =
      mappedComponents.find((mapped) => mapped.name === jsxElementName.node.name) ||
      createCommonMappedAttribute(jsxElementName.node.name);

    const styledProps = getClassNamePropsFromJSX(node, mappedComponent);

    return styledProps.map((x) => x.node.loc).filter((x) => typeof x !== 'undefined');
  };

  const getJSXElementsTree = (ast: BabelFileAst) =>
    getRootJSXElements(ast).pipe(
      Stream.map((babelPath) => {
        const tree = makeTreeFrom({
          input: babelPath,
          getChilds: (item) => getJSXElementChilds(item),
          transform: (jsxElement) => jsxElement,
        });
        return tree;
      }),
    );
  return { babelParseDocument, getJSXElementsTree, getLanguageRegions };
});

export interface TwinDocumentsProvider extends Effect.Effect.Success<typeof make> {}
export const TwinDocumentsProvider =
  Context.GenericTag<TwinDocumentsProvider>('TwinDocumentsProvider');

export const TwinDocumentsProviderLive = Layer.effect(TwinDocumentsProvider, make);

const getClassNamePropsFromJSX = (
  jsxElement: JSXElementBabelPath,
  mappedConfig: MappedComponent,
) => {
  const validClassNames = Object.entries(mappedConfig.config);
  return jsxElement
    .get('openingElement')
    .get('attributes')
    .filter((x) => x.isJSXAttribute())
    .filter((prop) => {
      const namePath = prop.get('name');

      return (
        !namePath.isJSXIdentifier() ||
        typeof validClassNames.find((x) => prop.node.name.name === x[0]) !== 'undefined'
      );
    });
};

const getRootJSXElements = (ast: BabelFileAst) =>
  Stream.async<JSXElementBabelPath>((emit) => {
    traverse(
      ast,
      {
        Program: {
          exit() {
            emit.chunk(Chunk.fromIterable(this.elements)).then(() => emit.end());
          },
        },
        JSXElement(path) {
          this.elements.push(path);
          path.skip();
        },
      },
      undefined,
      {
        elements: [] as JSXElementBabelPath[],
      },
    );
  });

const parser = _babelParser.parse.bind(_babelParser);

const plugins: _babelParser.ParserPlugin[] = [
  'asyncGenerators',
  'classProperties',
  'dynamicImport',
  'functionBind',
  'jsx',
  'numericSeparator',
  'objectRestSpread',
  'optionalCatchBinding',
  'decorators-legacy',
  'typescript',
  'optionalChaining',
  'nullishCoalescingOperator',
];

const babelParserOptions: _babelParser.ParserOptions = {
  plugins,
  sourceType: 'module',
  errorRecovery: true,
};

function babelParse(code: string | Buffer, fileName?: string): BabelFileAst {
  const codeString = code.toString();
  try {
    return parser(codeString, babelParserOptions);
  } catch (err) {
    throw new Error(
      `Error parsing babel: ${err} in ${fileName}, code:\n${codeString}\n ${(err as any).stack}`,
    );
  }
}

const getJSXElementChilds = (jsxElement: JSXElementPath): JSXElementPath[] => {
  const childAttrs = pathJSXAttributeChilds(jsxElement.get('openingElement'));
  return jsxElement
    .get('children')
    .filter((x) => x.isJSXElement())
    .concat(childAttrs);
};

const pathJSXAttributeChilds = (openingElement: JSXOpeningElementPath) => {
  const jsxAttrs: JSXElementPath[] = [];
  for (const attr of openingElement.get('attributes')) {
    attr.traverse({
      JSXElement: (path) => {
        jsxAttrs.push(path);
        path.skip();
      },
    });
  }
  return jsxAttrs;
};

export type JSXElementBabelPath = NodePath<JSXElementNode>;
export type BabelFileAst = ParseResult<t.File>;
export type JSXElementNode = t.JSXElement;
export type JSXElementPath = NodePath<t.JSXElement>;
type AnyNode = t.Node;
export type AnyNodePath = NodePath<AnyNode>;
export type JSXOpeningElementPath = NodePath<t.JSXOpeningElement>;
