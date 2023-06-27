import type { CssDeclarationValueNode, EvaluatorConfig } from '../../types';
import { kebab2camel } from '../utils';
import { evaluateFlex } from './flex.evaluator';
import { evaluateTransformNode } from './transform.evaluator';
import { evaluateDimensionsNode } from './units.evaluator';

const propToReactStyle = (node: string) => {
  if (node.includes('-')) {
    return kebab2camel(node);
  }
  return node;
};

const evaluateDeclarationValueNode = (
  node: CssDeclarationValueNode,
  config: EvaluatorConfig,
) => {
  switch (node.type) {
    case 'dimensions':
      return evaluateDimensionsNode(node, config);
    case 'calc':
      return node;
    case 'raw':
      return node.value;
    case 'transform':
      return evaluateTransformNode(node, config);
  }
};

export const evaluateTreeDeclarations = (
  x: [string, CssDeclarationValueNode][],
  config: EvaluatorConfig,
) => {
  return x.reduce((prev, current) => {
    if (!current) return prev;

    if (current[0] === 'flex' && current[1].type === 'raw') {
      return Object.assign(prev, evaluateFlex(current[1].value));
    }

    if (current[1].type === 'transform' && current[1].dimension === '2d') {
      if ('transform' in prev) {
        prev['transform'].push(evaluateDeclarationValueNode(current[1], config));
        return prev;
      } else {
        return Object.defineProperty(prev, 'transform', {
          enumerable: true,
          configurable: true,
          value: evaluateDeclarationValueNode(current[1], config),
        });
      }
    }
    if (!Object.getOwnPropertyDescriptor(prev, propToReactStyle(current[0]))) {
      return Object.defineProperty(prev, propToReactStyle(current[0]), {
        enumerable: true,
        configurable: true,
        value: evaluateDeclarationValueNode(current[1], config),
      });
    }
    return prev;
  }, {} as Record<string, any>);
};
