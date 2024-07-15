import template from '@babel/template';
import * as t from '@babel/types';
import { AnyPrimitive } from '../jsx/jsx.types';

export const createPrimitiveExpression = <T extends AnyPrimitive>(value: T) => {
  if (typeof value === 'string') return t.stringLiteral(value);
  if (typeof value === 'number') return t.numericLiteral(value);
  return t.booleanLiteral(value);
};

export const createObjectExpression = <T extends object>(expression: T) => {
  const ast = template.expression(JSON.stringify(expression));
  return ast();
};
