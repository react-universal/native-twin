import { kebab2camel } from '../helpers';
import type { AstDeclarationNode, CssParserData } from '../types';

export const declarationAsStyle = (node: AstDeclarationNode, _context: CssParserData) => {
  if (node.value.type === 'DIMENSIONS') {
    return {
      [kebab2camel(node.property)]: node.value,
    };
  }

  if (node.value.type === 'SHADOW') {
    return node.value.value;
  }
  if (node.value.type === 'FLEX') {
    return {
      flexBasis: node.value.flexBasis,
      flexGrow: node.value.flexGrow,
      flexShrink: node.value.flexShrink,
    };
  }
  if (node.value.type === 'TRANSFORM') {
    const transform: {
      translateX?: number | string;
      translateY?: number | string;
      translateZ?: number | string;
    }[] = [{ translateX: node.value.x.value }];
    if (node.value.y) {
      transform.push({ translateY: node.value.y.value });
    }
    if (node.value.z) {
      transform.push({ translateZ: node.value.z.value });
    }
    return { transform };
  }
  return { [kebab2camel(node.property)]: node.value.value };
};
