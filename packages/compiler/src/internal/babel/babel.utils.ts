import template from '@babel/template';
import type { Binding, NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import type * as Predicate from 'effect/Predicate';
import type { AnyNodePath, ImportSource } from './babel.models';

export const getSourceLocation = (node: t.Node) =>
  Option.fromNullable(node.loc).pipe(
    Option.getOrThrowWith(() => new Error('The node does not provide SourceLocation')),
  );

// export type TwinDependenciesLookup = (
//   modules: TwinModuleAst[],
// ) => (key: TwinJSXElementNode) => Option.Option<TwinJSXElement>;

// export const makeDependenciesLookup: TwinDependenciesLookup =
//   (modules: TwinModuleAst[]) => (key: TwinJSXElementNode) =>
//     RA.head(RA.filterMap(modules, (external) => external.getJSXElementFromNode(key)));

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

export const isJSXElement: Predicate.Predicate<t.JSXElement> = (
  node: t.Node,
): node is t.JSXElement => t.isJSXElement(node);

export const isObjectExpression: Predicate.Refinement<t.Node, t.ObjectExpression> = (
  node: t.Node,
): node is t.ObjectExpression => t.isObjectExpression(node);

export const isCallExpression: Predicate.Refinement<unknown, t.CallExpression> = (
  node: unknown,
): node is t.CallExpression => t.isNode(node) && t.isCallExpression(node);

export const isVariableDeclaratorPath: Predicate.Refinement<
  NodePath,
  NodePath<t.VariableDeclarator>
> = (path: NodePath): path is NodePath<t.VariableDeclarator> => path.isVariableDeclarator();

export const variableDeclaratorIsRequire: Predicate.Refinement<
  NodePath,
  NodePath<t.CallExpression>
> = (path: NodePath): path is NodePath<t.CallExpression> => path.isCallExpression();

export const isImportSpecifier: Predicate.Refinement<NodePath, NodePath<t.ImportSpecifier>> = pipe(
  (path: NodePath<t.Node>): path is NodePath<t.ImportSpecifier> => path.isImportSpecifier(),
);

export const isImportDeclaration: Predicate.Refinement<NodePath, NodePath<t.ImportDeclaration>> = (
  path: NodePath<t.Node>,
): path is NodePath<t.ImportDeclaration> => path.isImportDeclaration();

export const isJSXElementPath: Predicate.Refinement<NodePath<t.Node>, NodePath<t.JSXElement>> = (
  node,
): node is NodePath<t.JSXElement> => node.isJSXElement();

export const isJSXAttribute: Predicate.Refinement<t.Node, t.JSXAttribute> = (
  node,
): node is t.JSXAttribute => t.isJSXAttribute(node);

export const isJSXAttributePath: Predicate.Refinement<
  NodePath<t.Node>,
  NodePath<t.JSXAttribute>
> = (node): node is NodePath<t.JSXAttribute> => node.isJSXAttribute();

export const isReactRequire = (
  node: Option.Option<readonly [t.VariableDeclarator, t.CallExpression]>,
) =>
  Option.filterMap(node, ([, node]) =>
    t.isIdentifier(node.callee, { name: 'require' }) &&
    t.isStringLiteral(node.arguments[0], { value: 'react' })
      ? Option.some(true)
      : Option.none(),
  );

export const isReactInteropRequire = (
  node: Option.Option<readonly [t.VariableDeclarator, t.CallExpression]>,
) =>
  Option.flatMap(node, ([, node]) => {
    if (
      // const <name> = _interopRequireDefault(require("react"))
      t.isIdentifier(node.callee, { name: '_interopRequireDefault' }) &&
      t.isCallExpression(node.arguments[0]) &&
      t.isIdentifier(node.arguments[0].callee, { name: 'require' }) &&
      t.isStringLiteral(node.arguments[0].arguments[0], {
        value: 'react',
      })
    ) {
      return Option.some(true);
    }
    return Option.none();
  });

export const isFunction = (path: AnyNodePath) =>
  path.isArrowFunctionExpression() || path.isFunctionDeclaration() || path.isFunctionExpression();

export const isLocalImport = (path: string) => path.startsWith('.') || path.startsWith('/');

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
