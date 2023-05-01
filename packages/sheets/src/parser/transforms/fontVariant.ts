import type TokenStream from '../TokenStream';
import { SPACE, IDENT } from '../tokenTypes';

export default (tokenStream: TokenStream) => {
  const values = [tokenStream.expect(IDENT)];

  while (tokenStream.hasTokens()) {
    tokenStream.expect(SPACE);
    values.push(tokenStream.expect(IDENT));
  }

  return {
    fontVariant: values,
  };
};
