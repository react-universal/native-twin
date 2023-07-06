import type { CSSLengthUnit } from '../css.types';
import type { CssParserData } from '../types';

export const evaluateDimensionsNode = (node: CSSLengthUnit, context: CssParserData) => {
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
    case 'turn':
      return `${360 * node.value}deg` as unknown as number;
    case 'deg':
      return `${node.value}deg` as unknown as number;
    case 'rad':
      return `${node.value}rad` as unknown as number;
    case 'none':
    case 'px':
    default:
      return node.value;
  }
};
