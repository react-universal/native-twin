import { Binding, NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import * as Context from 'effect/Context';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';

export class NodeBindingSvc extends Context.Tag('NodeBindingSvc')<
  NodeBindingSvc,
  {
    readonly getBinding: (node: Option.Option<t.Identifier>) => Option.Option<Binding>;
    readonly getVariableDeclarator: (
      binding: Option.Option<Binding>,
    ) => Option.Option<t.VariableDeclarator>;
    readonly getCallExpression: (
      node: Option.Option<t.VariableDeclarator>,
    ) => Option.Option<readonly [t.VariableDeclarator, t.CallExpression]>;
    readonly getImportDeclaration: (
      binding: Option.Option<Binding>,
    ) => Option.Option<boolean>;
  }
>() {}

export const makeBindingService = (path: NodePath) => {
  return Layer.succeed(NodeBindingSvc, {
    getBinding(node) {
      return node.pipe(
        Option.flatMap((a) => Option.fromNullable(path.scope.getBinding(a.name))),
      );
    },
    getVariableDeclarator(binding) {
      return binding.pipe(
        Option.flatMap((x) =>
          x.path.isVariableDeclarator() ? Option.some(x.path.node) : Option.none(),
        ),
      );
    },
    getCallExpression(node) {
      return node.pipe(
        Option.flatMap((x) =>
          t.isCallExpression(x.init) ? Option.some([x, x.init] as const) : Option.none(),
        ),
      );
    },
    getImportDeclaration(binding) {
      return binding.pipe(
        Option.flatMap((x) =>
          x.path.parentPath &&
          t.isImportDeclaration(x.path.parentPath.node) &&
          x.path.parentPath.node.source.value.toLowerCase() === 'react'
            ? Option.some(true)
            : Option.none(),
        ),
      );
    },
  });
};
