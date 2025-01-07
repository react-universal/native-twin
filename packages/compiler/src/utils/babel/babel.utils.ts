import { parse } from '@babel/parser';
import type { Binding } from '@babel/traverse';
import * as t from '@babel/types';
import type { AnyPrimitive } from '@native-twin/helpers';
import * as RA from 'effect/Array';
import * as Option from 'effect/Option';
import * as babelPredicates from './babel.predicates.js';

export const createPrimitiveExpression = <T extends AnyPrimitive>(value: T) => {
  if (typeof value === 'string') return t.stringLiteral(value);
  if (typeof value === 'number') return t.numericLiteral(value);
  return t.booleanLiteral(value);
};

export const createRequireExpression = (path: string) => {
  return t.callExpression(t.identifier('require'), [t.stringLiteral(path)]);
};

export const templateLiteralToStringLike = (literal: t.TemplateLiteral) => {
  const strings = literal.quasis
    .map((x) => (x.value.cooked ? x.value.cooked : x.value.raw))
    .map((x) => x.trim().replace(/\n/g, '').trim().replace(/\s+/g, ' '))
    .filter((x) => x.length > 0)
    .join('');
  const expressions = t.templateLiteral(
    literal.quasis.map(() => t.templateElement({ raw: '', cooked: '' })),
    literal.expressions,
  );
  return { strings, expressions: expressions };
};

export const getBabelBindingImportSource = (binding: Binding) =>
  Option.firstSomeOf([
    getBindingImportDeclaration(binding),
    getBindingRequireDeclaration(binding),
  ]);

const getBindingImportDeclaration = (binding: Binding) =>
  Option.liftPredicate(binding.path, babelPredicates.isImportSpecifier).pipe(
    Option.bindTo('importSpecifier'),
    Option.bind('importDeclaration', ({ importSpecifier }) =>
      Option.liftPredicate(
        importSpecifier.parentPath,
        babelPredicates.isImportDeclaration,
      ),
    ),
    Option.map((source) => ({
      kind: 'import',
      source: source.importDeclaration.node.source.value,
    })),
  );

const getBindingRequireDeclaration = (binding: Binding) =>
  Option.liftPredicate(binding.path, babelPredicates.isVariableDeclaratorPath).pipe(
    Option.bindTo('importSpecifier'),
    Option.bind('requireExpression', ({ importSpecifier }) =>
      Option.fromNullable(importSpecifier.node.init).pipe(
        Option.flatMap((init) =>
          Option.liftPredicate(init, babelPredicates.isCallExpression),
        ),
        Option.flatMap((x) => RA.head(x.arguments)),
        Option.flatMap((x) => Option.liftPredicate(x, t.isStringLiteral)),
      ),
    ),
    Option.map((source) => {
      return {
        kind: 'require',
        source: source.requireExpression.value,
      };
    }),
  );

export const getBabelAST = (code: string, filename: string) => {
  const ast = parse(code, {
    sourceFilename: filename,
    plugins: ['jsx', 'typescript'],
    sourceType: 'module',
    errorRecovery: true,
    startLine: 0,
    startColumn: 1,
    tokens: false,
    ranges: true,
  });
  return ast;
};

const createJsxAttribute = (name: string, value: AnyPrimitive) => {
  const expression = createPrimitiveExpression(value);
  return t.jsxAttribute(t.jsxIdentifier(name), t.jsxExpressionContainer(expression));
};

const JSXElementHasAttribute = (element: t.JSXElement, name: string) => {
  return element.openingElement.attributes.some(
    (x) =>
      x.type === 'JSXAttribute' &&
      x.name.type === 'JSXIdentifier' &&
      x.name.name === name,
  );
};

export const addJsxAttribute = (
  element: t.JSXElement,
  name: string,
  value: AnyPrimitive,
) => {
  if (!t.isJSXElement(element)) return;
  const newAttribute = createJsxAttribute(name, value);
  if (!JSXElementHasAttribute(element, name)) {
    return element.openingElement.attributes.push(newAttribute);
  }

  element.openingElement.attributes = element.openingElement.attributes.map((x) => {
    if (x.type === 'JSXSpreadAttribute') return x;
    if (
      x.type === 'JSXAttribute' &&
      x.name.type === 'JSXIdentifier' &&
      x.name.name === name
    ) {
      return newAttribute;
    }
    return x;
  });

  return;
};

export const addJsxExpressionAttribute = (
  element: t.JSXElement,
  name: string,
  value: t.Expression,
) => {
  if (!t.isJSXElement(element)) return;
  const newAttribute = t.jsxAttribute(
    t.jsxIdentifier(name),
    t.jsxExpressionContainer(value),
  );

  if (JSXElementHasAttribute(element, name)) {
    element.openingElement.attributes = element.openingElement.attributes.map((x) => {
      if (x.type === 'JSXSpreadAttribute') return x;
      if (
        x.type === 'JSXAttribute' &&
        x.name.type === 'JSXIdentifier' &&
        x.name.name === name
      ) {
        return newAttribute;
      }
      return x;
    });
    return;
  }

  element.openingElement.attributes.push(newAttribute);
};

/**
 * @domain Babel
 * @description Extract the {@link t.JSXAttribute[]} from any {@link t.JSXElement}
 * */
export const getJSXElementAttrs = (element: t.JSXElement): t.JSXAttribute[] =>
  RA.filter(element.openingElement.attributes, babelPredicates.isJSXAttribute);
