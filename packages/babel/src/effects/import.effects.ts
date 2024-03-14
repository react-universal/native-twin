import { Binding, NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import * as E from 'effect/Effect';
import * as O from 'effect/Option';

export const getCallExpression = (x: E.Effect<O.Option<t.VariableDeclarator>>) => {
  return x.pipe(E.map(O.map((a) => (t.isCallExpression(a.init) ? O.some(a.init) : O.none()))));
};

export const getImport = (x: Binding) => {
  return E.sync(() => (x.path.isImportSpecifier() ? O.some(x.path.node) : O.none()));
};

export const getImportDefault = (x: Binding) => {
  return E.sync(() => (x.path.isImportDefaultSpecifier() ? O.some(x.path.node) : O.none()));
};

export const getImportDeclaration = (x: Binding) => {
  return E.sync(() => (x.path.isImportDeclaration() ? O.some(x.path.node) : O.none()));
};

export const getImportNamesPace = (x: Binding) => {
  return E.sync(() => (x.path.isImportNamespaceSpecifier() ? O.some(x.path.node) : O.none()));
};

export const isImportDeclaration = (x: NodePath<t.Node>) => {
  return E.sync(() => t.isImportDeclaration(x.node));
};

/**
 * @step `Step #1`
 * @param {t.MemberExpression} node
 * @returns
 */
const getCreateElementIdent = (node: t.MemberExpression): O.Option<t.Expression> => {
  return O.Do.pipe(() =>
    t.isIdentifier(node.property, { name: 'createElement' }) ? O.some(node.object) : O.none(),
  );
};

/**
 * @step `Step #2`
 */
const getReactIdent = (node: O.Option<t.Expression>): O.Option<t.Identifier> => {
  return node.pipe(
    O.flatMap((x) =>
      t.isIdentifier(x, { name: 'react' }) || t.isIdentifier(x, { name: 'React' })
        ? O.some(x)
        : O.none(),
    ),
  );
};

/**
 * @step `Step #3`
 */
const getBinding =
  (path: NodePath<t.MemberExpression>) =>
  (node: O.Option<t.Identifier>): O.Option<Binding> => {
    return node.pipe(O.flatMap((a) => O.fromNullable(path.scope.getBinding(a.name))));
  };

/**
 * @step `Step #3`
 */
const bindingToVariableDeclarator = (
  binding: O.Option<Binding>,
): O.Option<t.VariableDeclarator> => {
  return binding.pipe(
    O.flatMap((x) => (x.path.isVariableDeclarator() ? O.some(x.path.node) : O.none())),
  );
};

const getBindingCallExpression = (binding: O.Option<Binding>): O.Option<t.CallExpression> => {
  return binding.pipe(
    bindingToVariableDeclarator,
    O.flatMap((x) => (t.isCallExpression(x.init) ? O.some(x.init) : O.none())),
  );
};

/**
 * @step `Step #4`
 */
const getReactRequire = (node: O.Option<t.CallExpression>): O.Option<boolean> => {
  return node.pipe(
    O.flatMap((x) =>
      t.isIdentifier(x.callee, { name: 'require' }) &&
      t.isStringLiteral(x.arguments[0], { value: 'react' })
        ? O.some(true)
        : O.none(),
    ),
  );
};

export const pipeMaybeReactFromMemberExpression = (path: NodePath<t.MemberExpression>) => {
  return E.Do.pipe(
    () => O.some(path),
    () => getCreateElementIdent(path.node),
    getReactIdent,
    getBinding(path),
    getBindingCallExpression,
    getReactRequire,
    O.getOrElse(() => false),
  );
};
