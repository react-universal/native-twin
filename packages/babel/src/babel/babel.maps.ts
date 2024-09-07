import { NodePath, Binding } from '@babel/traverse';
import * as t from '@babel/types';
import * as Option from 'effect/Option';

export const maybeCallExpression = (node: Option.Option<t.VariableDeclarator>) => {
  return node.pipe(
    Option.flatMap((x) =>
      t.isCallExpression(x.init) ? Option.some([x, x.init] as const) : Option.none(),
    ),
  );
};

export const maybeImportDeclaration = (binding: Option.Option<Binding>) => {
  return binding.pipe(
    Option.flatMap((x) =>
      x.path.parentPath &&
      t.isImportDeclaration(x.path.parentPath.node) &&
      x.path.parentPath.node.source.value.toLowerCase() === 'react'
        ? Option.some(true)
        : Option.none(),
    ),
  );
};

export const maybeReactIdent = (node: Option.Option<t.MemberExpression>) => {
  return node.pipe(
    Option.flatMap((x) => {
      if (
        t.isIdentifier(x.object, { name: 'react' }) ||
        t.isIdentifier(x.object, { name: 'React' })
      ) {
        return Option.some(x.object);
      }
      if (
        t.isMemberExpression(x.object) &&
        t.isIdentifier(x.object.object, { name: '_react' }) &&
        t.isIdentifier(x.object.property, { name: 'default' })
      ) {
        return Option.some(x.object.object);
      }
      return Option.none();
    }),
  );
};

export const maybeCreateElementExpression = (
  path: NodePath<t.MemberExpression>,
): Option.Option<t.MemberExpression> => {
  if (t.isIdentifier(path.node.property, { name: 'createElement' })) {
    return Option.some(path.node);
  }
  return Option.none();
};

export const maybeBinding = (
  node: Option.Option<t.Identifier>,
  path: NodePath<t.MemberExpression>,
) => {
  return node.pipe(
    Option.flatMap((a) => Option.fromNullable(path.scope.getBinding(a.name))),
  );
};

export const maybeVariableDeclarator = (binding: Option.Option<Binding>) => {
  return binding.pipe(
    Option.flatMap((x) =>
      x.path.isVariableDeclarator() ? Option.some(x.path.node) : Option.none(),
    ),
  );
};
