import { parse } from '@babel/parser';
import babelTemplate from '@babel/template';
import type { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { type AnyPrimitive, asArray } from '@native-twin/helpers';
import * as Func from 'effect/Function';
import * as Match from 'effect/Match';

export const templateLiteralsToInject = (value: string) => {
  if (value.startsWith('`') && value.endsWith('`')) {
    const ast = babelTemplate.ast(value) as t.ExpressionStatement;
    if (t.isTemplateLiteral(ast.expression)) {
      const template = ast.expression;
      // template.expressions.map((x) => {});
      // traverse.node
      // traverse.node(ast, {
      //   TemplateElement: (path) => {},
      //   Identifier: (path) => {
      //     path.replaceWith(
      //       t.arrowFunctionExpression(
      //         asArray(t.identifier(path.node.name)),
      //         t.identifier(path.node.name),
      //         false,
      //       ),
      //     );
      //   },
      // });
      // template.expression.expressions.map((x) => {});
      return template;
    }
    // t.arrowFunctionExpression(asArray(t.identifier('x')), template);
    // console.log('TEMPLATE: ', template);
  }
};

export const literalValueToAst = (value: any): t.Expression => {
  return Match.value(value).pipe(
    Match.when(Match.string, (x) => t.stringLiteral(x)),
    Match.when(Match.number, (x) => t.numericLiteral(x)),
    Match.when(Match.bigint, (x) => t.bigIntLiteral(x)),
    Match.when(Match.boolean, (x) => t.booleanLiteral(x)),
    Match.when(Match.null, () => t.nullLiteral()),
    Match.when(Match.undefined, () => t.unaryExpression('void', t.numericLiteral(0), true)),
    Match.when(Array.isArray, (x) => t.arrayExpression(x.map(literalValueToAst))),
    Match.when(Match.record, (x) =>
      t.objectExpression(
        Object.keys(x)
          .filter((key) => typeof x[key] !== 'undefined')
          .map((key) => t.objectProperty(t.stringLiteral(key), literalValueToAst(value[key]))),
      ),
    ),
    Match.orElse(() => t.nullLiteral()),
  );
};

const valueTypes = ['BooleanLiteral', 'StringLiteral', 'NumericLiteral'];

export const astToLiteralValue = (node: any): any => {
  if (!node) return;
  if (valueTypes.includes(node.type)) {
    return node.value;
  }
  if (node.name === 'undefined' && !node.value) {
    return undefined;
  }
  if (t.isNullLiteral(node)) {
    return null;
  }
  if (t.isObjectExpression(node)) {
    return computeProps(node);
  }
  if (t.isArrayExpression(node)) {
    return node.elements.reduce(
      // @ts-expect-error
      (acc, element) => [
        ...acc,
        ...(element?.type === 'SpreadElement'
          ? astToLiteralValue(element.argument)
          : [astToLiteralValue(element)]),
      ],
      [],
    );
  }
};

function computeProps(props: any) {
  return props.reduce((acc: any, prop: any) => {
    if (prop.type === 'SpreadElement') {
      return {
        ...acc,
        ...astToLiteralValue(prop.argument),
      };
    }
    if (prop.type !== 'ObjectMethod') {
      const val = astToLiteralValue(prop.value);
      if (val !== undefined) {
        return {
          ...acc,
          [prop.key.name]: val,
        };
      }
    }
    return acc;
  }, {});
}

export type JSXElementFunction =
  | NodePath<t.ArrowFunctionExpression>
  | NodePath<t.FunctionDeclaration>
  | NodePath<t.FunctionExpression>;

export const funcJSXElementFunction = (
  jsxPath: NodePath<t.JSXElement>,
): JSXElementFunction | null => {
  const isFunction = (path: NodePath<any>) =>
    path.isArrowFunctionExpression() || path.isFunctionDeclaration() || path.isFunctionExpression();

  let compFn: NodePath<any> | null = jsxPath.findParent(isFunction);
  while (compFn) {
    const parent = compFn.findParent(isFunction);
    if (parent) {
      compFn = parent;
    } else {
      break;
    }
  }
  if (!compFn) {
    console.error('Cant find the component top most function');
    return null;
  }
  return compFn;
};

export const createPrimitiveExpression = <T extends AnyPrimitive>(value: T) => {
  if (typeof value === 'string') {
    if (value === 'NULL') {
      return t.nullLiteral();
    }
    return t.stringLiteral(value);
  }
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
    (x) => x.type === 'JSXAttribute' && x.name.type === 'JSXIdentifier' && x.name.name === name,
  );
};

export const addJsxAttribute = (element: t.JSXElement, name: string, value: AnyPrimitive): void => {
  if (!t.isJSXElement(element)) return;
  const newAttribute = createJsxAttribute(name, value);
  if (!JSXElementHasAttribute(element, name)) {
    return void element.openingElement.attributes.push(newAttribute);
  }

  element.openingElement.attributes = element.openingElement.attributes.map((x) => {
    if (x.type === 'JSXSpreadAttribute') return x;
    if (x.type === 'JSXAttribute' && x.name.type === 'JSXIdentifier' && x.name.name === name) {
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
  const newAttribute = t.jsxAttribute(t.jsxIdentifier(name), t.jsxExpressionContainer(value));

  if (JSXElementHasAttribute(element, name)) {
    element.openingElement.attributes = element.openingElement.attributes.map((x) => {
      if (x.type === 'JSXSpreadAttribute') return x;
      if (x.type === 'JSXAttribute' && x.name.type === 'JSXIdentifier' && x.name.name === name) {
        return newAttribute;
      }
      return x;
    });
    return;
  }

  element.openingElement.attributes.push(newAttribute);
};

export const createBabelVariable = (name: string, expression: t.Expression) =>
  t.variableDeclaration('const', asArray(t.variableDeclarator(t.identifier(name), expression)));
