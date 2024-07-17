import template from '@babel/template';
import * as t from '@babel/types';
import { isObject } from '@native-twin/helpers';
import type { AnyPrimitive } from '../jsx/jsx.types';
import { valueIsPrimitive } from './babel.validators';

export const createPrimitiveExpression = <T extends AnyPrimitive>(value: T) => {
  if (typeof value === 'string') return t.stringLiteral(value);
  if (typeof value === 'number') return t.numericLiteral(value);
  return t.booleanLiteral(value);
};

export const createObjectExpressionWithTemplate = <T extends object>(expression: T) => {
  const ast = template.expression(JSON.stringify(expression));
  return ast();
};

export const createObjectExpression = <T extends object>(
  obj: T,
): t.ObjectExpression | t.ArrayExpression => {
  if (Array.isArray(obj)) {
    return t.arrayExpression(createArrayExpression(obj));
  }
  return t.objectExpression(createOjectExpressionProperties(Object.entries(obj)));
};

export const createArrayExpression = <T>(
  x: T[],
  results: t.Expression[] = [],
): t.Expression[] => {
  const [next, ...rest] = x;
  if (!next) return results;

  let value: t.Expression | null = null;

  if (valueIsPrimitive(next)) {
    value = createPrimitiveExpression(next);
  }

  if (isObject(next) || Array.isArray(next)) {
    value = createObjectExpression(next);
  }

  if (value) {
    results.push(value);
  }
  return createArrayExpression(rest, results);
};

export const createOjectExpressionProperties = (
  entries: [string, any][],
  results: t.ObjectProperty[] = [],
): t.ObjectProperty[] => {
  const [next, ...rest] = entries;
  if (!next) {
    return results;
  }
  const key = t.stringLiteral(next[0]);
  let value: t.Expression | null = null;
  if (valueIsPrimitive(next[1])) {
    value = createPrimitiveExpression(next[1]);
  }

  if (isObject(next[1]) || Array.isArray(next[1])) {
    value = createObjectExpression(next[1]);
  }

  if (value) {
    results.push(t.objectProperty(key, value));
  }
  return createOjectExpressionProperties(rest, results);
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
