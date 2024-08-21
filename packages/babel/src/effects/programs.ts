import { NodePath, Binding } from '@babel/traverse';
import * as t from '@babel/types';
import * as Option from 'effect/Option';
import {
  isReactInteropRequire,
  isReactRequire,
  maybeBinding,
  maybeCallExpression,
  maybeCreateElementExpression,
  maybeImportDeclaration,
  maybeReactIdent,
  maybeVariableDeclarator,
} from '../babel';

const fromRequire = (x: Option.Option<Binding>) =>
  x.pipe(
    maybeVariableDeclarator,
    maybeCallExpression,
    (node) => [isReactRequire(node), isReactInteropRequire(node)] as const,
    Option.firstSomeOf,
  );

export const importProgram = (path: NodePath<t.MemberExpression>) => {
  return maybeCreateElementExpression(path)
    .pipe(maybeReactIdent, (x) => maybeBinding(x, path))
    .pipe(
      (x) => [fromRequire(x), maybeImportDeclaration(x)] as const,
      Option.firstSomeOf,
    );
};
