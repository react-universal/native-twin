import type TokenStream from '../TokenStream';
import { NUMBER, SLASH } from '../tokenTypes';

export default (tokenStream: TokenStream) => {
  let aspectRatio: number = tokenStream.expect(NUMBER);

  if (tokenStream.hasTokens()) {
    tokenStream.expect(SLASH);
    aspectRatio /= tokenStream.expect(NUMBER);
  }

  return { aspectRatio };
};
