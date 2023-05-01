import type TokenStream from '../TokenStream';
import { SPACE, IDENT, STRING } from '../tokenTypes';

export default (tokenStream: TokenStream) => {
  let fontFamily;

  if (tokenStream.matches(STRING)) {
    fontFamily = tokenStream.lastValue;
  } else {
    fontFamily = tokenStream.expect(IDENT);
    while (tokenStream.hasTokens()) {
      tokenStream.expect(SPACE);
      const nextIdent = tokenStream.expect(IDENT);
      fontFamily += ` ${nextIdent}`;
    }
  }

  tokenStream.expectEmpty();

  return { fontFamily };
};
