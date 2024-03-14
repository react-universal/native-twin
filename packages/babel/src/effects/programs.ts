import { NodePath, Binding } from '@babel/traverse';
import * as t from '@babel/types';
import * as E from 'effect/Effect';
import * as Exit from 'effect/Exit';
import * as O from 'effect/Option';
import {
  CallExpressionSvc,
  CreateElementSvc,
  NodeBindingSvc,
  createElementRunnable,
} from './services';

export const createMemberExpressionProgram = (path: NodePath<t.MemberExpression>) => {
  const context = createElementRunnable(path);
  const program = E.all([CreateElementSvc, NodeBindingSvc, CallExpressionSvc]).pipe(
    E.flatMap(([createElement, binding, callExp]) => {
      const fromRequire = (x: O.Option<Binding>) =>
        x.pipe(
          binding.getVariableDeclarator,
          binding.getCallExpression,
          (node) => [callExp.getReactRequire(node), callExp.isInteropRequire(node)] as const,
          O.firstSomeOf,
        );
      return createElement
        .getCreateElementExpression()
        .pipe(createElement.getReactIdent, binding.getBinding)
        .pipe(
          (x) => [fromRequire(x), binding.getImportDeclaration(x)] as const,
          O.firstSomeOf,
        );
    }),
  );
  return E.provide(program, context).pipe(
    E.runSyncExit,
    Exit.match({
      onFailure() {
        return false;
      },
      onSuccess() {
        return true;
      },
    }),
  );
};
