/* eslint-disable no-console */
import { parser, number } from '../lib';
import type { CssParserData } from '../types';

const _context: CssParserData = {
  deviceHeight: 1000,
  deviceWidth: 720,
  rem: 16,
};

const yieldToken = <TokenType extends string, V>(
  token: { type: TokenType; value: V },
  cursor: number,
) => ({
  type: token.type,
  value: token.value,
  loc: {
    begin: cursor,
  },
});
function* cssLexer(input: string) {
  let cursor = 0;

  const tokenizer = parser.Parser.of(input);

  function getNumbers() {
    return tokenizer.chain((x) => number.float);
    // .transform({
    //   cursor,
    //   data: _context,
    //   error: null,
    //   isError: false,
    //   result: null,
    //   target: input,
    // });
  }
  do {
    const char = input[cursor];

    yield yieldToken({ type: 'UNKNOWN', value: getNumbers() }, cursor);
    cursor++;
    if (char === undefined) {
      yield yieldToken({ type: 'EOF', value: null }, cursor);
    } else {
      throw `unexpected character ${char}`;
    }
  } while (cursor < input.length);
}
const iterator = cssLexer('asd');
console.log('CURRENT: ', iterator.next());
console.log('CURRENT: ', iterator.next());
