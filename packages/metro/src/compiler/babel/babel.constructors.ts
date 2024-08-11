import generate from '@babel/generator';
import template from '@babel/template';
import * as t from '@babel/types';
import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import { cx } from '@native-twin/core';
import { MappedComponent } from '../../utils';
import { AnyPrimitive, JSXMappedAttribute } from '../ast.types';
import { getJSXElementConfig } from '../ast/ast.utils';

/**
 * @category Transformer
 * @domain Babel
 * Extract {@link JSXMappedAttribute} from a jsx Attribute
 * */
export const getMappedAttribute = (
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

      if (expression.expressions.length > 0) {
        const quasis = expression.expressions.map(() =>
          t.templateElement({
            raw: '',
            cooked: '',
          }),
        );
        quasis.push(t.templateElement({ raw: '', cooked: '' }));
        const newTemplate = t.templateLiteral(
          quasis,
          expression.expressions.map((x) => x),
        );
        templates = generate(newTemplate).code;
        // templates = `\`\``;
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

/**
 * @category Transformer
 * @domain Babel
 * Extract {@link JSXMappedAttribute[]} list from a jsx Attribute
 * */
export const getMappedAttributes = (
  attributes: t.JSXAttribute[],
  config: MappedComponent,
): JSXMappedAttribute[] => {
  return attributes
    .map((x) => getMappedAttribute(x, config))
    .filter((x) => x !== null) as JSXMappedAttribute[];
};

export const getJSXMappedAttributes = (
  attributes: t.JSXAttribute[],
  config: MappedComponent,
): JSXMappedAttribute[] => {
  return attributes
    .map((x) => getMappedAttribute(x, config))
    .filter((x) => x !== null) as JSXMappedAttribute[];
};

export const getBabelJSXElementAttrs = (element: t.JSXElement): t.JSXAttribute[] =>
  pipe(
    element.openingElement.attributes,
    RA.filterMap((x) => (isBabelJSXAttribute(x) ? Option.some(x) : Option.none())),
  );

export const getBabelJSXElementAttrByName = (
  attributes: t.JSXAttribute[],
  name: string,
) => {
  return pipe(
    attributes,
    RA.findFirst((x) => {
      if (!isBabelJSXIdentifier(x.name)) return false;
      return x.name.name === name;
    }),
  );
};

export const getBabelJSXElementName = (node: t.JSXElement) => {
  if (t.isJSXIdentifier(node.openingElement.name)) {
    return node.openingElement.name.name;
  }
  return null;
};

export const getBabelElementMappedAttributes = (
  node: t.JSXElement,
): JSXMappedAttribute[] => {
  const attributes = getBabelJSXElementAttrs(node);
  return pipe(
    Option.fromNullable(getBabelJSXElementName(node)),
    Option.flatMap((x) => Option.fromNullable(getJSXElementConfig(x))),
    Option.map((mapped) => getJSXMappedAttributes(attributes, mapped)),
    Option.getOrElse(() => []),
  );
};

export const addAttributesToElement = (
  node: t.JSXElement,
  attribute: { name: string; value: AnyPrimitive },
) => {
  // if (typeof attribute.value === 'string') {
  //   attribute.value = attribute.value.replace()
  // }
  const ast = template.ast(`${attribute.value}`);
  try {
    let value: t.Expression | undefined;
    if (Array.isArray(ast)) return;

    if (t.isExpressionStatement(ast)) {
      value = ast.expression;
    }

    if (t.isBlockStatement(ast)) {
      const firstBlock = ast.body[0];
      if (t.isExpression(firstBlock)) {
        value = firstBlock;
      }
      if (t.isExpressionStatement(firstBlock)) {
        value = firstBlock.expression;
      }
    }

    if (!value) {
      return;
    }

    node.openingElement.attributes.push(
      t.jsxAttribute(t.jsxIdentifier(attribute.name), t.jsxExpressionContainer(value)),
    );
  } catch {
    console.log('ASD', ast);
  }
};

export const isBabelJSXAttribute: Predicate.Refinement<t.Node, t.JSXAttribute> = (
  x,
): x is t.JSXAttribute => t.isJSXAttribute(x);

export const isBabelJSXIdentifier: Predicate.Refinement<t.Node, t.JSXIdentifier> = (
  x,
): x is t.JSXIdentifier => t.isJSXIdentifier(x);
