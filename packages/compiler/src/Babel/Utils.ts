// import template from '@babel/template';
// import type { Binding } from '@babel/traverse';
// import * as t from '@babel/types';
// import * as RA from 'effect/Array';
// import * as Option from 'effect/Option';
// import type { ImportSource, TwinJSXElement, TwinJSXElementNode, TwinModuleAst } from './Models';
// import {
//   isCallExpression,
//   isImportDeclaration,
//   isImportSpecifier,
//   isJSXAttribute,
//   isVariableDeclaratorPath,
// } from './Predicates';

// export const getSourceLocation = (node: t.Node) =>
//   Option.fromNullable(node.loc).pipe(
//     Option.getOrThrowWith(() => new Error('The node does not provide SourceLocation')),
//   );

// export type TwinDependenciesLookup = (
//   modules: TwinModuleAst[],
// ) => (key: TwinJSXElementNode) => Option.Option<TwinJSXElement>;

// export const makeDependenciesLookup: TwinDependenciesLookup =
//   (modules: TwinModuleAst[]) => (key: TwinJSXElementNode) =>
//     RA.head(RA.filterMap(modules, (external) => external.getJSXElementFromNode(key)));

// /**
//  * @domain Babel
//  * @description Extract the {@link t.JSXAttribute[]} from any {@link t.JSXElement}
//  * */
// export const getJSXElementAttrs = (element: t.JSXElement): t.JSXAttribute[] =>
//   RA.filter(element.openingElement.attributes, isJSXAttribute);

// export const getBabelBindingImportSource = (binding: Binding) =>
//   Option.firstSomeOf([getBindingImportDeclaration(binding), getBindingRequireDeclaration(binding)]);

// const getBindingImportDeclaration = (binding: Binding) =>
//   Option.liftPredicate(binding.path, isImportSpecifier).pipe(
//     Option.bindTo('importSpecifier'),
//     Option.bind('importDeclaration', ({ importSpecifier }) =>
//       Option.liftPredicate(importSpecifier.parentPath, isImportDeclaration),
//     ),
//     Option.map(
//       (source): ImportSource => ({
//         kind: 'import',
//         source: source.importDeclaration.node.source.value,
//       }),
//     ),
//   );

// const getBindingRequireDeclaration = (binding: Binding) =>
//   Option.liftPredicate(binding.path, isVariableDeclaratorPath).pipe(
//     Option.bindTo('importSpecifier'),
//     Option.bind('requireExpression', ({ importSpecifier }) =>
//       Option.fromNullable(importSpecifier.node.init).pipe(
//         Option.flatMap((init) => Option.liftPredicate(init, isCallExpression)),
//         Option.flatMap((x) => RA.head(x.arguments)),
//         Option.flatMap((x) => Option.liftPredicate(x, t.isStringLiteral)),
//       ),
//     ),
//     Option.map((source): ImportSource => {
//       return {
//         kind: 'require',
//         source: source.requireExpression.value,
//       };
//     }),
//   );

// const importNativeView = template(`
// const __ReactNativeView = require('react-native').View;
// const __ReactNativeText = require('react-native').Text;
// `);

// const importStyleSheet = template(`
// const __ReactNativeStyleSheet = require('@native-twin/jsx/sheet').StyleSheet;
// `);

// const importReactUseMemo = template(`
// const __ReactUseMemo = require('react').useMemo;
// `);

// const styledPropCall = template.expression(`
//   STYLESHEET_VAR_NAME.getComponentStyles(ELEMENT_KEY, PROP, false);
//   `);

// const styleSheetRegisterJSX = template.expression(`
//   STYLESHEET_VAR_NAME.registerComponent(JSX_NODE_SHEET);
//   `);

// const importTwinStore = template(`
//   const TWIN_STORE_HANDLER_VAR = require('@native-twin/styled');
//   `);

// const twinStoreRegisterJSX = template(`
//   STYLESHEET_VAR_NAME.registerComponent(RUNTIME_COMPONENTS);
//   `);
// export const babelTemplates = {
//   importRNView: importNativeView,
//   importRNStyleSheet: importStyleSheet,
//   importReactUseMemo,
//   importTwinStore,
//   twinStoreRegisterJSX,
//   styledPropCall,
//   styleSheetRegisterJSX,
// };
