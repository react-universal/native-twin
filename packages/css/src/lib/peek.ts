import { Parser, updateError, updateParserState } from './Parser';

// peek :: Parser e Char s
export const peek: Parser<string> = new Parser(function peek$state(state) {
  if (state.isError) return state;

  const { index, target } = state;
  if (index < target.length) {
    return updateParserState(state, target.charAt(index), index);
  }
  return updateError(state, `ParseError (position ${index}): Unexpected end of input.`);
});
