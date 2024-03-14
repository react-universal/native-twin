import { Binding, NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import * as Ctx from 'effect/Context';
import * as O from 'effect/Option';

export class CreateElementSvc extends Ctx.Tag('CreateElementSvc')<
  CreateElementSvc,
  {
    readonly path: NodePath<t.MemberExpression>;
    readonly getCreateElementExpression: () => O.Option<t.MemberExpression>;
    readonly getReactIdent: (node: O.Option<t.MemberExpression>) => O.Option<t.Identifier>;
  }
>() {}

export class NodeBindingSvc extends Ctx.Tag('NodeBindingSvc')<
  NodeBindingSvc,
  {
    readonly getBinding: (node: O.Option<t.Identifier>) => O.Option<Binding>;
    readonly getVariableDeclarator: (
      binding: O.Option<Binding>,
    ) => O.Option<t.VariableDeclarator>;
    readonly getCallExpression: (
      node: O.Option<t.VariableDeclarator>,
    ) => O.Option<readonly [t.VariableDeclarator, t.CallExpression]>;
    readonly getImportDeclaration: (binding: O.Option<Binding>) => O.Option<boolean>;
  }
>() {}

export class CallExpressionSvc extends Ctx.Tag('CallExpressionSvc')<
  CallExpressionSvc,
  {
    readonly getReactRequire: (
      node: O.Option<readonly [t.VariableDeclarator, t.CallExpression]>,
    ) => O.Option<boolean>;
    readonly isInteropRequire: (
      node: O.Option<readonly [t.VariableDeclarator, t.CallExpression]>,
    ) => O.Option<boolean>;
  }
>() {}

export const createElementRunnable = (path: NodePath<t.MemberExpression>) => {
  return Ctx.empty().pipe(
    Ctx.add(CreateElementSvc, {
      path,
      getCreateElementExpression() {
        if (t.isIdentifier(this.path.node.property, { name: 'createElement' })) {
          return O.some(this.path.node);
        }
        return O.none();
      },
      getReactIdent(node) {
        return node.pipe(
          O.flatMap((x) => {
            if (
              t.isIdentifier(x.object, { name: 'react' }) ||
              t.isIdentifier(x.object, { name: 'React' })
            ) {
              return O.some(x.object);
            }
            if (
              t.isMemberExpression(x.object) &&
              t.isIdentifier(x.object.object, { name: '_react' }) &&
              t.isIdentifier(x.object.property, { name: 'default' })
            ) {
              return O.some(x.object.object);
            }
            return O.none();
          }),
        );
      },
    }),

    Ctx.add(NodeBindingSvc, {
      getBinding(node) {
        return node.pipe(O.flatMap((a) => O.fromNullable(path.scope.getBinding(a.name))));
      },
      getVariableDeclarator(binding) {
        return binding.pipe(
          O.flatMap((x) => (x.path.isVariableDeclarator() ? O.some(x.path.node) : O.none())),
        );
      },
      getCallExpression(node) {
        return node.pipe(
          O.flatMap((x) =>
            t.isCallExpression(x.init) ? O.some([x, x.init] as const) : O.none(),
          ),
        );
      },
      getImportDeclaration(binding) {
        return binding.pipe(
          O.flatMap((x) =>
            x.path.parentPath &&
            t.isImportDeclaration(x.path.parentPath.node) &&
            x.path.parentPath.node.source.value.toLowerCase() === 'react'
              ? O.some(true)
              : O.none(),
          ),
        );
      },
    }),

    Ctx.add(CallExpressionSvc, {
      getReactRequire(node) {
        return node.pipe(
          O.flatMap(([_, node]) =>
            t.isIdentifier(node.callee, { name: 'require' }) &&
            t.isStringLiteral(node.arguments[0], { value: 'react' })
              ? O.some(true)
              : O.none(),
          ),
        );
      },
      isInteropRequire(node) {
        return node.pipe(
          O.flatMap(([_, node]) => {
            if (
              t.isIdentifier(node.callee, { name: '_interopRequireDefault' }) && // const <name> = _interopRequireDefault(require("react"))
              t.isCallExpression(node.arguments[0]) &&
              t.isIdentifier(node.arguments[0].callee, { name: 'require' }) &&
              t.isStringLiteral(node.arguments[0].arguments[0], {
                value: 'react',
              })
            ) {
              return O.some(true);
            }
            return O.none();
          }),
        );
      },
    }),
  );
};
