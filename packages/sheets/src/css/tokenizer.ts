import type { Context } from './css.types';

interface ConditionNode {
  type: 'condition';
  value: string;
}
interface OperationNode {
  type: 'operation';
  left: ConditionNode | null;
  right: ConditionNode | null;
}

type AnyNode = ConditionNode | OperationNode;

const evaluateMedia = (node: AnyNode, context: Context): boolean => {
  if (node.type === 'operation') {
    const leftCondition = node.left ? evaluateMedia(node.left, context) : true;
    const rightCondition = node.right ? evaluateMedia(node.right, context) : true;
    return leftCondition && rightCondition;
  }
  if (node.type === 'condition') {
    const [name, value] = node.value.split(':');
    if (!name || !value) return false;
    if (name.startsWith('min-')) {
      if (name.endsWith('width')) {
        return context.width >= parseFloat(value);
      }
      if (name.endsWith('height')) {
        return context.height >= parseFloat(value);
      }
    }
    if (name.startsWith('max-')) {
      if (name.endsWith('width')) {
        return context.width <= parseFloat(value);
      }
      if (name.endsWith('height')) {
        return context.height <= parseFloat(value);
      }
    }
  }
  return false;
};

export const shouldApplyAddRule = (css: string, context: Context) => {
  const rootNode: OperationNode = {
    type: 'operation',
    left: null,
    right: null,
  };
  const media = css.slice(0, css.indexOf('{'));
  let cursor = 0;
  while (cursor < media.length) {
    const currentChar = media.charAt(cursor);
    if (currentChar == '(') {
      const endOfCondition = media.indexOf(')');
      rootNode.left = {
        type: 'condition',
        value: media.slice(cursor + 1, endOfCondition),
      };
      cursor += endOfCondition + 2;
      continue;
    }
    cursor++;
  }
  return evaluateMedia(rootNode, context);
};
