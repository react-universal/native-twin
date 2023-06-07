import { Parser, updateError, updateParserState } from '../Parser';

const reDigit = /[0-9]/;
// digit :: Parser e String s
export const digit: Parser<string> = new Parser<string>(function digit$state(state) {
  if (state.isError) return state;

  const { target, index } = state;

  if (target.length > index) {
    if (index <= target.length) {
      const char = target.charAt(index);
      return char && reDigit.test(char)
        ? updateParserState(state, char, index + 1)
        : updateError(state, `ParseError (position ${index}): Expecting digit, got '${char}'`);
    }
  }

  return updateError(
    state,
    `ParseError (position ${index}): Expecting digit, but got end of input.`,
  );
});
