import type TokenStream from '../TokenStream';
import { SPACE, LINE } from '../tokenTypes';

export default (tokenStream: TokenStream) => {
  const lines = [];

  let didParseFirst = false;
  while (tokenStream.hasTokens()) {
    if (didParseFirst) tokenStream.expect(SPACE);

    lines.push(tokenStream.expect(LINE).toLowerCase());

    didParseFirst = true;
  }

  lines.sort().reverse();

  return { textDecorationLine: lines.join(' ') };
};
