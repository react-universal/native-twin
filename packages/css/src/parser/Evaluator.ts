import type { AstDeclarationNode, AstDimensionsNode, EvaluatorConfig } from '../types';
import * as P from './Parser';
import { kebab2camel } from './helpers';
import { DeclarationToken } from './tokens/Declaration.token';
import { SelectorToken } from './tokens/Selector.token';

const evaluateDimensionsNode = (node: AstDimensionsNode, context: EvaluatorConfig) => {
  switch (node.units) {
    case 'rem':
    case 'em':
      return node.value * context.rem;
    case '%':
      return `${node.value}%`;
    case 'none':
    case 'px':
    default:
      return node.value;
  }
};

const declarationAsStyle = (node: AstDeclarationNode, context: EvaluatorConfig) => {
  if (node.value.type === 'DIMENSIONS') {
    return {
      [kebab2camel(node.property)]: evaluateDimensionsNode(node.value, context),
    };
  }
  if (node.value.type === 'FLEX') {
    return {
      flexBasis: evaluateDimensionsNode(node.value.flexBasis, context),
      flexGrow: evaluateDimensionsNode(node.value.flexGrow, context),
      flexShrink: evaluateDimensionsNode(node.value.flexShrink, context),
    };
  }
  if (node.value.type === 'TRANSFORM') {
    const transform: {
      translateX?: number | string;
      translateY?: number | string;
      translateZ?: number | string;
    }[] = [{ translateX: evaluateDimensionsNode(node.value.x, context) }];
    if (node.value.y) {
      transform.push({ translateY: evaluateDimensionsNode(node.value.y, context) });
    }
    if (node.value.z) {
      transform.push({ translateZ: evaluateDimensionsNode(node.value.z, context) });
    }
    return { transform };
  }
  return { [kebab2camel(node.property)]: node.value.value };
};

export const CssParserRoutine = (target: string, context: EvaluatorConfig) =>
  P.coroutine((run) => {
    const declarations: Record<string, any> = {};
    const selector = run(SelectorToken);

    run(DeclarationToken).forEach((declaration) => {
      const style = declarationAsStyle(declaration, context);
      Object.assign(declarations, style);
    });

    return { selector, declarations };
  }).run(target);
