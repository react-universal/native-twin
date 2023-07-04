import type { AstDimensionsNode, CssParserData } from '../types';

export const evaluateDimensionsNode = (node: AstDimensionsNode, context: CssParserData) => {
  // console.log('evaluateDimensionsNode -> node', node);
  switch (node.units) {
    case 'rem':
    case 'em':
      return node.value * context.rem;
    case '%':
      return `${node.value}%` as unknown as number;
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
