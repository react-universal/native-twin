import { Binding, NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';

export const getCallExpression = (
  x: Effect.Effect<Option.Option<t.VariableDeclarator>>,
) => {
  return x.pipe(
    Effect.map(
      Option.map((a) =>
        t.isCallExpression(a.init) ? Option.some(a.init) : Option.none(),
      ),
    ),
  );
};

export const getImport = (x: Binding) => {
  return Effect.sync(() =>
    x.path.isImportSpecifier() ? Option.some(x.path.node) : Option.none(),
  );
};

export const getImportDefault = (x: Binding) => {
  return Effect.sync(() =>
    x.path.isImportDefaultSpecifier() ? Option.some(x.path.node) : Option.none(),
  );
};

export const getImportDeclaration = (x: Binding) => {
  return Effect.sync(() =>
    x.path.isImportDeclaration() ? Option.some(x.path.node) : Option.none(),
  );
};

export const getImportNamesPace = (x: Binding) => {
  return Effect.sync(() =>
    x.path.isImportNamespaceSpecifier() ? Option.some(x.path.node) : Option.none(),
  );
};

export const isImportDeclaration = (x: NodePath<t.Node>) => {
  return Effect.sync(() => t.isImportDeclaration(x.node));
};

/**
 * @step `Step #1`
 * @param {t.MemberExpression} node
 * @returns
 */
const getCreateElementIdent = (node: t.MemberExpression): Option.Option<t.Expression> => {
  return Option.Do.pipe(() =>
    t.isIdentifier(node.property, { name: 'createElement' })
      ? Option.some(node.object)
      : Option.none(),
  );
};

/**
 * @step `Step #2`
 */
const getReactIdent = (
  node: Option.Option<t.Expression>,
): Option.Option<t.Identifier> => {
  return node.pipe(
    Option.flatMap((x) =>
      t.isIdentifier(x, { name: 'react' }) || t.isIdentifier(x, { name: 'React' })
        ? Option.some(x)
        : Option.none(),
    ),
  );
};

/**
 * @step `Step #3`
 */
const getBinding =
  (path: NodePath<t.MemberExpression>) =>
  (node: Option.Option<t.Identifier>): Option.Option<Binding> => {
    return node.pipe(
      Option.flatMap((a) => Option.fromNullable(path.scope.getBinding(a.name))),
    );
  };

/**
 * @step `Step #3`
 */
const bindingToVariableDeclarator = (
  binding: Option.Option<Binding>,
): Option.Option<t.VariableDeclarator> => {
  return binding.pipe(
    Option.flatMap((x) =>
      x.path.isVariableDeclarator() ? Option.some(x.path.node) : Option.none(),
    ),
  );
};

const getBindingCallExpression = (
  binding: Option.Option<Binding>,
): Option.Option<t.CallExpression> => {
  return binding.pipe(
    bindingToVariableDeclarator,
    Option.flatMap((x) =>
      t.isCallExpression(x.init) ? Option.some(x.init) : Option.none(),
    ),
  );
};

/**
 * @step `Step #4`
 */
const getReactRequire = (
  node: Option.Option<t.CallExpression>,
): Option.Option<boolean> => {
  return node.pipe(
    Option.flatMap((x) =>
      t.isIdentifier(x.callee, { name: 'require' }) &&
      t.isStringLiteral(x.arguments[0], { value: 'react' })
        ? Option.some(true)
        : Option.none(),
    ),
  );
};

export const pipeMaybeReactFromMemberExpression = (
  path: NodePath<t.MemberExpression>,
) => {
  return Effect.Do.pipe(
    () => Option.some(path),
    () => getCreateElementIdent(path.node),
    getReactIdent,
    getBinding(path),
    getBindingCallExpression,
    getReactRequire,
    Option.getOrElse(() => false),
  );
};
