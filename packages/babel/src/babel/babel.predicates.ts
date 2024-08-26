import type { Binding } from '@babel/traverse';
import * as t from '@babel/types';
import * as Option from 'effect/Option';
import type { AnyPrimitive } from '@native-twin/helpers';
import type { JSXChildElement } from '../jsx/jsx.types';
import { createPrimitiveExpression } from './babel.constructors';

export const isReactNativeImport = (binding: Binding) => {
  return (
    t.isImportSpecifier(binding.path.node) &&
    t.isImportDeclaration(binding.path.parent) &&
    binding.path.parent.source.value === 'react-native'
  );
};

export const isReactNativeRequire = (binding: Binding) => {
  return (
    t.isCallExpression(binding.path.node) &&
    t.isIdentifier(binding.path.node.callee, { name: 'require' })
    // binding.path.parent.source.value === 'react-native'
  );
};

export const isReactRequire = (
  node: Option.Option<readonly [t.VariableDeclarator, t.CallExpression]>,
) => {
  return node.pipe(
    Option.filterMap(([, node]) =>
      t.isIdentifier(node.callee, { name: 'require' }) &&
      t.isStringLiteral(node.arguments[0], { value: 'react' })
        ? Option.some(true)
        : Option.none(),
    ),
  );
};

export const isReactInteropRequire = (
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

export const hasJsxAttribute = (
  element: JSXChildElement,
  name: string,
  value: AnyPrimitive,
) => {
  if (!t.isJSXElement(element)) return false;
  return element.openingElement.attributes.some((x) =>
    t.isJSXAttribute(x, {
      name: t.jsxIdentifier(name),
      value: t.jsxExpressionContainer(createPrimitiveExpression(value)),
    }),
  );
};
