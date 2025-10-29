import * as _babelParser from '@babel/parser';
import template from '@babel/template';
import type { Binding } from '@babel/traverse';
import * as t from '@babel/types';
import * as RA from 'effect/Array';
import * as Option from 'effect/Option';
import type { TwinModuleAst } from '../Domain/TwinAst';
import type { TwinJSXElement, TwinJSXElementNode } from '../Domain/TwinJSXElementNode';
import type { BabelFileAst, ImportSource } from './Models';
import {
  isCallExpression,
  isImportDeclaration,
  isImportSpecifier,
  isJSXAttribute,
  isVariableDeclaratorPath,
} from './Predicates';

t.react.isCompatTag;
export type TwinDependenciesLookup = (
  modules: TwinModuleAst[],
) => (key: TwinJSXElementNode) => Option.Option<TwinJSXElement>;

export const makeDependenciesLookup: TwinDependenciesLookup =
  (modules: TwinModuleAst[]) => (key: TwinJSXElementNode) =>
    RA.head(RA.filterMap(modules, (external) => external.getJSXElementFromNode(key)));

export const isLocalImport = (path: string) => path.startsWith('.') || path.startsWith('/');

/**
 * @domain Babel
 * @description Extract the {@link t.JSXAttribute[]} from any {@link t.JSXElement}
 * */
export const getJSXElementAttrs = (element: t.JSXElement): t.JSXAttribute[] =>
  RA.filter(element.openingElement.attributes, isJSXAttribute);

export const getBabelBindingImportSource = (binding: Binding) =>
  Option.firstSomeOf([getBindingImportDeclaration(binding), getBindingRequireDeclaration(binding)]);

const getBindingImportDeclaration = (binding: Binding) =>
  Option.liftPredicate(binding.path, isImportSpecifier).pipe(
    Option.bindTo('importSpecifier'),
    Option.bind('importDeclaration', ({ importSpecifier }) =>
      Option.liftPredicate(importSpecifier.parentPath, isImportDeclaration),
    ),
    Option.map(
      (source): ImportSource => ({
        kind: 'import',
        source: source.importDeclaration.node.source.value,
      }),
    ),
  );

const getBindingRequireDeclaration = (binding: Binding) =>
  Option.liftPredicate(binding.path, isVariableDeclaratorPath).pipe(
    Option.bindTo('importSpecifier'),
    Option.bind('requireExpression', ({ importSpecifier }) =>
      Option.fromNullable(importSpecifier.node.init).pipe(
        Option.flatMap((init) => Option.liftPredicate(init, isCallExpression)),
        Option.flatMap((x) => RA.head(x.arguments)),
        Option.flatMap((x) => Option.liftPredicate(x, t.isStringLiteral)),
      ),
    ),
    Option.map((source): ImportSource => {
      return {
        kind: 'require',
        source: source.requireExpression.value,
      };
    }),
  );

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

export const babelParserOptions: _babelParser.ParserOptions = {
  plugins,
  sourceType: 'module',
  errorRecovery: true,
};

const parser = _babelParser.parse.bind(_babelParser);

export function babelParse(code: string | Buffer, fileName?: string): BabelFileAst {
  const codeString = code.toString();
  try {
    return parser(codeString, babelParserOptions);
  } catch (err) {
    throw new Error(
      `Error parsing babel: ${err} in ${fileName}, code:\n${codeString}\n ${(err as any).stack}`,
    );
  }
}

const importNativeView = template(`
const __ReactNativeView = require('react-native').View;
const __ReactNativeText = require('react-native').Text;
`);

const importStyleSheet = template(`
const __ReactNativeStyleSheet = require('@native-twin/jsx/sheet').StyleSheet;
`);

const importReactUseMemo = template(`
const __ReactUseMemo = require('react').useMemo;
`);

const styledPropCall = template.expression(`
  STYLESHEET_VAR_NAME.getComponentStyles(ELEMENT_KEY, PROP, false);
  `);

const styleSheetRegisterJSX = template.expression(`
  STYLESHEET_VAR_NAME.registerComponent(JSX_NODE_SHEET);
  `);

const importTwinStore = template(`
  const TWIN_STORE_HANDLER_VAR = require('@native-twin/styled');
  `);

const twinStoreRegisterJSX = template(`
  STYLESHEET_VAR_NAME.registerComponent(RUNTIME_COMPONENTS);
  `);
export const babelTemplates = {
  importRNView: importNativeView,
  importRNStyleSheet: importStyleSheet,
  importReactUseMemo,
  importTwinStore,
  twinStoreRegisterJSX,
  styledPropCall,
  styleSheetRegisterJSX,
};
