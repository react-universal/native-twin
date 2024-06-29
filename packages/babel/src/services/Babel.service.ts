import { PluginPass, NodePath } from '@babel/core';
import * as t from '@babel/types';
import * as Context from 'effect/Context';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';

export class BabelService extends Context.Tag('CallExpressionSvc')<
  BabelService,
  {
    readonly path: NodePath;
    isValidPath(state: PluginPass): boolean;
    readonly getReactRequire: (
      node: Option.Option<readonly [t.VariableDeclarator, t.CallExpression]>,
    ) => Option.Option<boolean>;
    readonly isInteropRequire: (
      node: Option.Option<readonly [t.VariableDeclarator, t.CallExpression]>,
    ) => Option.Option<boolean>;
  }
>() {}

const allowedFileRegex =
  /^(?!.*[/\\](react|react-native|react-native-web|@native-twin\/*)[/\\]).*$/;

const isValidFile = (x = '') => allowedFileRegex.test(x);

export const makeBabelService = (path: NodePath) =>
  Layer.succeed(BabelService, {
    path,
    isValidPath: (state: PluginPass) => {
      return isValidFile(state.filename);
    },
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
            // const <name> = _interopRequireDefault(require("react"))
            (t.isIdentifier(node.callee, { name: '_interopRequireDefault' }) ||
              t.isIdentifier(node.callee, { name: '_interopRequireWildcard' })) &&
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
