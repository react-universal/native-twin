import * as t from '@babel/types';
import * as Option from 'effect/Option';
import { AnyPrimitive } from '../jsx/jsx.types';

export const isReactRequire = (
  node: Option.Option<readonly [t.VariableDeclarator, t.CallExpression]>,
) => {
  return node.pipe(
    Option.flatMap(([, node]) =>
      t.isIdentifier(node.callee, { name: 'require' }) &&
      t.isStringLiteral(node.arguments[0], { value: 'react' })
        ? Option.some(true)
        : Option.none(),
    ),
  );
};

export const isInteropRequire = (
  node: Option.Option<readonly [t.VariableDeclarator, t.CallExpression]>,
) => {
  return node.pipe(
    Option.flatMap(([, node]) => {
      if (
        // const <name> = _interopRequireDefault(require("react"))
        t.isIdentifier(node.callee, { name: '_interopRequireDefault' }) &&
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
};

export const valueIsPrimitive = (value: unknown): value is AnyPrimitive => {
  return (
    typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
  );
};
