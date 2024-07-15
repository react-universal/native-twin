import template from '@babel/template';
import * as t from '@babel/types';
import { isObject } from '@native-twin/helpers';
import { getSheetEntryStyles as getSheetEntryStylesRuntime } from '@native-twin/jsx/build/utils/sheet.utils';
import { AnyPrimitive } from '../jsx/jsx.types';

const valueIsPrimitive = (value: unknown): value is AnyPrimitive => {
  return (
    typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
  );
};

export const createPrimitiveExpression = <T extends AnyPrimitive>(value: T) => {
  if (typeof value === 'string') return t.stringLiteral(value);
  if (typeof value === 'number') return t.numericLiteral(value);
  return t.booleanLiteral(value);
};

export const createObjectExpressionWithTemplate = <T extends object>(expression: T) => {
  const ast = template.expression(JSON.stringify(expression));
  return ast();
};

export function createBabelStylesTemplate(styles: any) {
  const ast = template.expression(`
  () => {
   const styles = ${JSON.stringify(styles)}
    return ${getSheetEntryStylesRuntime.toString()}
  }
  `);
  return ast();
}

export const createObjectExpression = <T extends object>(
  obj: T,
): t.ObjectExpression | t.ArrayExpression => {
  if (Array.isArray(obj)) {
    return t.arrayExpression(createArrayExpression(obj));
  }
  return t.objectExpression(createOjectExpressionProperties(Object.entries(obj)));
};

const createArrayExpression = <T>(
  x: T[],
  results: t.Expression[] = [],
): t.Expression[] => {
  const next = x.shift();
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
  return createArrayExpression(x, results);
};

const createOjectExpressionProperties = (
  entries: [string, any][],
  results: t.ObjectProperty[] = [],
): t.ObjectProperty[] => {
  const next = entries.shift();
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
  return createOjectExpressionProperties(entries, results);
};
