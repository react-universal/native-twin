import { Parser, updateParserError, updateParserState } from './Parser';

export const peek: Parser<string> = new Parser((state) => {
  if (state.isError) return state;

  const { cursor, target } = state;
  const sliced = target[cursor];
  if (sliced) {
    return updateParserState(state, sliced[0], cursor);
  }
  return updateParserError(state, {
    message: `ParseError (position ${cursor}): Unexpected end of input.`,
    position: cursor,
  });
});
