import type TokenStream from '../TokenStream';
import { parseShadow } from './util';

export default (tokenStream: TokenStream) => {
  const { offset, radius, color } = parseShadow(tokenStream);
  return {
    textShadowOffset: offset,
    textShadowRadius: radius,
    textShadowColor: color,
  };
};
