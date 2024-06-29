import * as t from '@babel/types';
import * as Context from 'effect/Context';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';

export class BabelService extends Context.Tag('CallExpressionSvc')<
  BabelService,
  {
    readonly getReactRequire: (
      node: Option.Option<readonly [t.VariableDeclarator, t.CallExpression]>,
    ) => Option.Option<boolean>;
    readonly isInteropRequire: (
      node: Option.Option<readonly [t.VariableDeclarator, t.CallExpression]>,
    ) => Option.Option<boolean>;
  }
>() {}

export const makeBabelService = Layer.succeed(BabelService, {
  getReactRequire(node) {
    return node.pipe(
      Option.flatMap(([, node]) =>
        t.isIdentifier(node.callee, { name: 'require' }) &&
        t.isStringLiteral(node.arguments[0], { value: 'react' })
          ? Option.some(true)
          : Option.none(),
      ),
    );
  },
  isInteropRequire(node) {
    return node.pipe(
      Option.flatMap(([, node]) => {
        if (
          t.isIdentifier(node.callee, { name: '_interopRequireDefault' }) && // const <name> = _interopRequireDefault(require("react"))
          t.isCallExpression(node.arguments[0]) &&
          t.isIdentifier(node.arguments[0].callee, { name: 'require' }) &&
          t.isStringLiteral(node.arguments[0].arguments[0], {
            value: 'react',
          })
        ) {
          return Option.some(true);
        }
        return Option.none();
      }),
    );
  },
});
