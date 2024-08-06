import generate from '@babel/generator';
import * as t from '@babel/types';
import { cx } from '@native-twin/core';
import { MappedComponent } from '../../utils';
import { JSXMappedAttribute } from '../types/tsCompiler.types';

export const extractClassNameProp = (
  attribute: t.JSXAttribute,
  config: MappedComponent,
): JSXMappedAttribute | null => {
  const validClassNames = Object.entries(config.config);
  if (!t.isJSXAttribute(attribute)) return null;
  if (!t.isJSXIdentifier(attribute.name)) return null;
  const className = validClassNames.find((x) => attribute.name.name === x[0]);
  if (!className) return null;

  if (t.isStringLiteral(attribute.value)) {
    return {
      prop: className[0],
      target: className[1],
      value: {
        literal: attribute.value.value,
        templates: null,
      },
    };
  }
  if (t.isJSXExpressionContainer(attribute.value)) {
    let templates = ``;
    let literal = '';

    if (t.isTemplateLiteral(attribute.value.expression)) {
      const expression = attribute.value.expression;
      literal = cx`${expression.quasis.map((x) => x.value.raw).join(' ')}`;
      console.log('EXPRESSION: ', expression);

      if (expression.expressions.length > 0) {
        templates = expression.expressions
          .filter((x) => t.isExpression(x))
          .map((x) => generate(x).code)
          .join(' ');
        templates = `\`${templates}\``;
      }
    }

    if (t.isCallExpression(attribute.value.expression)) {
      templates = generate(attribute.value.expression).code;
    }

    return {
      prop: className[0],
      target: className[1],
      value: {
        literal,
        templates,
      },
    };
  }
  return null;
};

export const extractElementClassNames = (
  attributes: t.JSXAttribute[],
  config: MappedComponent,
): JSXMappedAttribute[] => {
  return attributes
    .map((x) => extractClassNameProp(x, config))
    .filter((x) => x !== null) as JSXMappedAttribute[];
};

export const getJSXMappedAttributes = (
  attributes: t.JSXAttribute[],
  config: MappedComponent,
): JSXMappedAttribute[] => {
  return attributes
    .map((x) => extractClassNameProp(x, config))
    .filter((x) => x !== null) as JSXMappedAttribute[];
};
