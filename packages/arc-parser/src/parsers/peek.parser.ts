import { Parser, updateParserError, updateParserState } from './Parser.js';

export const peek: Parser<string> = new Parser((state) => {
  if (state.isError) return state;

  const { cursor, target } = state;

  if (cursor < target.byteLength) {
    return updateParserState(state, target.getUint8(cursor), cursor);
  }
  return updateParserError(
    state,
    `ParseError (position ${cursor}): Unexpected end of input.`,
  );
});
