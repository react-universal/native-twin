import type { AstDeclarationNode, AstDimensionsNode, EvaluatorConfig } from '../types';
import * as P from './Parser';
import { kebab2camel } from './helpers';
import { DeclarationTokens } from './tokens/Declaration.token';
import { SelectorToken } from './tokens/Selector.token';
import {
  GetAtRuleConditionToken,
  GetAtRuleRules,
  GetMediaRuleIdentToken,
} from './tokens/at-rule.token';

const evaluateDimensionsNode = (node: AstDimensionsNode, context: EvaluatorConfig) => {
  switch (node.units) {
    case 'rem':
    case 'em':
      return node.value * context.rem;
    case '%':
      return `${node.value}%`;
    case 'vh':
      return context.deviceHeight! * (node.value / 100);
    case 'vw':
      return context.deviceWidth! * (node.value / 100);
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

const evaluateMediaQueryConstrains = (node: AstDeclarationNode, context: EvaluatorConfig) => {
  if (node.value.type === 'DIMENSIONS') {
    const value = evaluateDimensionsNode(node.value, context);
    let valueNumber = typeof value === 'number' ? value : parseFloat(value);

    if (node.property === 'width') {
      return context.deviceWidth == valueNumber;
    }

    if (node.property === 'height') {
      return context.deviceHeight == valueNumber;
    }

    if (node.property === 'min-width') {
      return context.deviceWidth >= valueNumber;
    }

    if (node.property === 'max-width') {
      return context.deviceWidth <= valueNumber;
    }

    if (node.property === 'min-height') {
      return context.deviceHeight >= valueNumber;
    }

    if (node.property === 'max-height') {
      return context.deviceHeight <= valueNumber;
    }
  }
  return true;
};

export const CssParserRoutine = (target: string, context: EvaluatorConfig) =>
  P.coroutine((run) => {
    const declarations: Record<string, any> = {};
    const firstChar = run(P.peek);
    if (firstChar === '@') {
      run(GetMediaRuleIdentToken);
      const mediaRuleConstrains = run(GetAtRuleConditionToken);
      if (evaluateMediaQueryConstrains(mediaRuleConstrains, context)) {
        const rule = run(GetAtRuleRules);
        rule.declarations.forEach((declaration) => {
          const style = declarationAsStyle(declaration, context);
          Object.assign(declarations, style);
        });
        return { declarations, selector: rule.selector };
      }
      return { declarations, selector: '' };
    }
    const selector = run(SelectorToken);

    run(DeclarationTokens).forEach((declaration) => {
      const style = declarationAsStyle(declaration, context);
      Object.assign(declarations, style);
    });

    return { selector, declarations };
  }).run(target);
