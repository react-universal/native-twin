import * as parser from './interpreter/lib';
import { parseCssToRuleNodes, ParsedRuleNode } from './interpreter/tokenizer/sheet.tokenizer';
import { kebab2camel } from './interpreter/utils';
import type {
  CssDeclarationValueNode,
  CssTransformValueNode,
  CssValueDimensionNode,
  EvaluatorConfig,
  SelectorGroup,
} from './types';

export function placeContent(value: string) {
  const [alignContent, justifyContent = alignContent] = value.split(/\s/g);
  return { alignContent, justifyContent };
}

export function flexFlow(value: string) {
  const values = value.split(/\s/g);
  const result = {} as { [prop: string]: string };
  values.forEach((val) => {
    if (['wrap', 'nowrap', 'wrap-reverse'].includes(val)) result['flexWrap'] = val;
    else if (['row', 'column', 'row-reverse', 'column-reverse'].includes(val))
      result['flexDirection'] = val;
  });
  return result;
}

export function flex(value: string) {
  let [flexGrow, flexShrink = '0', flexBasis = '0%'] = value.split(/\s/g);
  if (!flexGrow) flexGrow = '1';
  // If the only property is a not a number, its value is flexBasis. See https://developer.mozilla.org/en-US/docs/Web/CSS/flex
  if (parseFloat(flexGrow) + '' !== flexGrow) return { flexBasis: flexGrow };
  // If the second property is not a number, its value is flexBasis.
  if (parseFloat(flexShrink) + '' !== flexShrink)
    return { flexGrow: flexGrow, flexBasis: flexShrink };
  return {
    flexGrow: flexGrow,
    flexShrink: flexShrink,
    flexBasis,
  };
}

const transformNodeToTranslate = (node: CssTransformValueNode, config: EvaluatorConfig) => {
  const result: any = [{ translateX: parseDimensionsValue(node.x, config) }];
  if (node.y) {
    result.push({ translateY: parseDimensionsValue(node.y, config) });
  }
  return result;
};

const propToReactStyle = (node: string) => {
  if (node.includes('-')) {
    return kebab2camel(node);
  }
  return node;
};

const parseDimensionsValue = (node: CssValueDimensionNode, config: EvaluatorConfig) => {
  switch (node.unit) {
    case 'none':
      return node.value;
    case 'rem':
    case 'em':
      return node.value * config.rem;
    default:
      console.debug('NOT_IMPLEMENTED_UNIT: ', node);
      return node.value;
  }
};

const evaluateDeclarationValueNode = (
  node: CssDeclarationValueNode,
  config: EvaluatorConfig,
) => {
  switch (node.type) {
    case 'dimensions':
      return parseDimensionsValue(node, config);
    case 'calc':
      return node;
    case 'flex':
      return flex(node.value);
    case 'raw':
      return node.value;
    case 'transform':
      return transformNodeToTranslate(node, config);
  }
};

const evaluateTreeDeclarations = (
  x: [string, CssDeclarationValueNode][],
  config: EvaluatorConfig,
) => {
  return x.reduce((prev, current) => {
    if (!current) return prev;

    if (current[0] === 'flex' && current[1].type === 'raw') {
      return Object.assign(prev, flex(current[1].value));
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

const evaluateTree = (
  tree: ParsedRuleNode,
  config: EvaluatorConfig,
): [SelectorGroup, Record<string, any>] => {
  // if (groups.includes(tree.group)) {
  // }
  return [tree.group, evaluateTreeDeclarations(tree.declarations, config)];
};

export const parseCssString = (input: string, context: EvaluatorConfig) => {
  const ast = parser.apply(parseCssToRuleNodes, input);
  return evaluateTree(ast[0]![0], context);
};
