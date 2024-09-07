import { NodePath, Binding } from '@babel/traverse';
import { MemberExpression } from '@babel/types';
import * as t from '@babel/types';
import * as Console from 'effect/Console';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import {
  isReactInteropRequire,
  isReactRequire,
  maybeCallExpression,
  maybeVariableDeclarator,
} from '../babel';

export const debugEffect = <T>(x: Effect.Effect<T>) => Console.log(x);

const isCreateElementIdent = (node: MemberExpression) => {
  return t.isIdentifier(node.property, { name: 'createElement' });
};

export const getReactIdent = (x: NodePath<MemberExpression>) => {
  if (
    t.isIdentifier(x.node.object, { name: 'react' }) ||
    t.isIdentifier(x.node.object, { name: 'React' })
  ) {
    return x.node.object.name;
  }

  if (
    t.isMemberExpression(x.node.object) &&
    t.isIdentifier(x.node.object.object, { name: '_react' }) &&
    t.isIdentifier(x.node.object.property, { name: 'default' })
  ) {
    return x.node.object.object.name;
  }
  return null;
};

export const isReactRequireBinding = (x: Binding) => {
  if (x.path.isVariableDeclarator() && t.isCallExpression(x.path.node.init)) {
    if (
      t.isIdentifier(x.path.node.init.callee, { name: 'require' }) &&
      t.isStringLiteral(x.path.node.init.arguments[0], { value: 'react' })
    ) {
      return true;
    } else if (
      // const <name> = _interopRequireDefault(require("react"))
      t.isIdentifier(x.path.node.init.callee, { name: '_interopRequireDefault' }) &&
      t.isCallExpression(x.path.node.init.arguments[0]) &&
      t.isIdentifier(x.path.node.init.arguments[0].callee, { name: 'require' }) &&
      t.isStringLiteral(x.path.node.init.arguments[0].arguments[0], {
        value: 'react',
      })
    ) {
      return true;
    }
  }

  return false;
};

export const isReactImport = (x: Binding) => {
  if (
    x.path.isImportSpecifier() ||
    x.path.isImportDefaultSpecifier() ||
    x.path.isImportDeclaration() ||
    x.path.isImportNamespaceSpecifier()
  ) {
    return (
      t.isImportDeclaration(x.path.parentPath.node) &&
      x.path.parentPath.node.source.value.toLowerCase() === 'react'
    );
  }

  return false;
};

export const pipeMemberExpression = (self: NodePath<MemberExpression>) => {
  return Option.Do.pipe(
    () => (isCreateElementIdent(self.node) ? Option.some(self) : Option.none()),
    Option.flatMapNullable(getReactIdent),
    Option.flatMapNullable((x) => self.scope.getBinding(x)),
    Option.map((x) => isReactRequireBinding(x) || isReactImport(x)),
    Option.getOrElse(() => false),
  );
};

export const maybeBindingIsReactImport = (x: Option.Option<Binding>) =>
  x.pipe(
    maybeVariableDeclarator,
    maybeCallExpression,
    (node) => [isReactRequire(node), isReactInteropRequire(node)] as const,
    Option.firstSomeOf,
  );
