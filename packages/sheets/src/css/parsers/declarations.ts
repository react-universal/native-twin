import type { Context } from '../css.types';
import type { CssDeclarationValueNode } from '../types';
import { evaluateDimensionsValue } from './dimensions';
import { evaluateCalcOperation } from './maths';
import { evaluateTransformNode } from './transform';

function kebab2camel(input: string) {
  return input.replace(/-./g, (x) => x.toUpperCase().charAt(1));
}

export function flex(value: string) {
  let [flexGrow, flexShrink = '0', flexBasis = '0%'] = value.split(/\s/g);
  if (!flexGrow) {
    flexGrow = '1';
  }
  // If the only property is a not a number, its value is flexBasis. See https://developer.mozilla.org/en-US/docs/Web/CSS/flex
  if (parseFloat(flexGrow) + '' !== flexGrow) {
    return { flexBasis: flexGrow };
  }
  // If the second property is not a number, its value is flexBasis.
  if (parseFloat(flexShrink) + '' !== flexShrink) {
    return { flexGrow: +flexGrow, flexBasis: flexShrink };
  }
  return {
    flexGrow: +flexGrow,
    flexShrink: +flexShrink,
    flexBasis: parseFloat(flexBasis),
  };
}

export function evaluateDeclaration(
  property: string,
  node: CssDeclarationValueNode,
  context: Context,
) {
  const propertyCamel = kebab2camel(property);
  switch (node.type) {
    case 'raw':
      if (property === 'flex') {
        return {
          ...flex(node.value),
        };
      }
      return {
        [propertyCamel]: node.value,
      };
    case 'dimensions':
      return {
        [propertyCamel]: evaluateDimensionsValue(node, context),
      };
    case 'transform':
      return {
        [propertyCamel]: evaluateTransformNode(node, context),
      };
    case 'calc':
      return {
        [propertyCamel]: evaluateCalcOperation(node, context),
      };
    default:
      throw new Error(
        `Cant parse declaration property: ${property} for ${JSON.stringify(node)}`,
      );
  }
}
