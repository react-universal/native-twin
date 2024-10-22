import type { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { pipe } from 'effect/Function';
import * as Predicate from 'effect/Predicate';

export const isJSXElement: Predicate.Predicate<t.JSXElement> = pipe(
  (node: t.Node): node is t.JSXElement => t.isJSXElement(node),
  Predicate.mapInput((node: t.Node) => node),
);

export const isJSXElementNode: Predicate.Refinement<t.Node, t.JSXElement> = (
  node: t.Node,
): node is t.JSXElement => t.isJSXElement(node);

export const isCallExpression: Predicate.Refinement<unknown, t.CallExpression> = (
  node: unknown,
): node is t.CallExpression => t.isNode(node) && t.isCallExpression(node);

export const isVariableDeclaratorPath: Predicate.Refinement<
  NodePath,
  NodePath<t.VariableDeclarator>
> = (path: NodePath): path is NodePath<t.VariableDeclarator> =>
  path.isVariableDeclarator();

export const variableDeclaratorIsRequire: Predicate.Refinement<
  NodePath,
  NodePath<t.CallExpression>
> = pipe((path: NodePath): path is NodePath<t.CallExpression> => path.isCallExpression());

export const isImportSpecifier: Predicate.Refinement<
  NodePath,
  NodePath<t.ImportSpecifier>
> = pipe((path: NodePath<t.Node>): path is NodePath<t.ImportSpecifier> =>
  path.isImportSpecifier(),
);

export const isImportDeclaration: Predicate.Refinement<
  NodePath,
  NodePath<t.ImportDeclaration>
> = pipe((path: NodePath<t.Node>): path is NodePath<t.ImportDeclaration> =>
  path.isImportDeclaration(),
);

export const isJSXElementPath: Predicate.Refinement<
  NodePath<t.Node>,
  NodePath<t.JSXElement>
> = (node): node is NodePath<t.JSXElement> => node.isJSXElement();

export const isJSXAttribute: Predicate.Refinement<t.Node, t.JSXAttribute> = (
  node,
): node is t.JSXAttribute => t.isJSXAttribute(node);

export const isJSXAttributePath: Predicate.Refinement<
  NodePath<t.Node>,
  NodePath<t.JSXAttribute>
> = (node): node is NodePath<t.JSXAttribute> => node.isJSXAttribute();
