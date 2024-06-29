import { NodePath, Binding } from '@babel/traverse';
import * as t from '@babel/types';
import * as Effect from 'effect/Effect';
import * as Exit from 'effect/Exit';
import * as Option from 'effect/Option';
import {
  ReactService,
  BabelService,
  NodeBindingSvc,
  makeServiceLayer,
} from '../services';

export const createMemberExpressionProgram = (path: NodePath<t.MemberExpression>) => {
  const context = makeServiceLayer(path);
  const program = Effect.gen(function* () {
    const createElement = yield* ReactService;
    const binding = yield* NodeBindingSvc;
    const callExp = yield* BabelService;
    const fromRequire = (x: Option.Option<Binding>) =>
      x.pipe(
        binding.getVariableDeclarator,
        binding.getCallExpression,
        (node) =>
          [callExp.getReactRequire(node), callExp.isInteropRequire(node)] as const,
        Option.firstSomeOf,
      );

    return yield* createElement
      .getCreateElementExpression()
      .pipe((x) => {
        console.log('CREATE_ELEMENT: ', x);
        return x;
      })
      .pipe(createElement.getReactIdent, binding.getBinding)
      .pipe(
        (x) => [fromRequire(x), binding.getImportDeclaration(x)] as const,
        Option.firstSomeOf,
      );
  });
  return Effect.provide(program, context).pipe(
    Effect.runSyncExit,
    Exit.match({
      onFailure(cause) {
        console.log('CAUSE:', cause);
        return false;
      },
      onSuccess() {
        return true;
      },
    }),
  );
};
