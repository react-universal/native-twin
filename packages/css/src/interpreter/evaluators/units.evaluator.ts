import type { CssValueDimensionNode, EvaluatorConfig } from '../../types';

export const evaluateDimensionsNode = (
  node: CssValueDimensionNode,
  config: EvaluatorConfig,
) => {
  switch (node.unit) {
    case 'none':
      return node.value;
    case 'rem':
    case 'em':
      return node.value * config.rem;
    case 'vh':
      return config.deviceHeight! * (node.value / 100);
    case 'vw':
      return config.deviceWidth! * (node.value / 100);
    case 'px':
      return node.value;
    default:
      return node.value;
  }
};
