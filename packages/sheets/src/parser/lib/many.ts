import { Parser, updateError, updateResult } from '../Parser';

// many :: Parser e s a -> Parser e s [a]
export const many = function many<T>(parser: Parser<T>): Parser<T[]> {
  return new Parser(function many$state(state) {
    if (state.isError) return state;

    const results = [];
    let nextState = state;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const out = parser.p(nextState);

      if (out.isError) {
        break;
      } else {
        nextState = out;
        results.push(nextState.result);

        if (nextState.index >= out.target.length) {
          break;
        }
      }
    }

    return updateResult(nextState, results);
  });
};

// many1 :: Parser e s a -> Parser e s [a]
export const many1 = function many1<T>(parser: Parser<T>): Parser<T[]> {
  return new Parser(function many1$state(state) {
    if (state.isError) return state;

    const resState = many(parser).p(state);
    if (resState.result.length) return resState;

    return updateError(
      state,
      `ParseError 'many1' (position ${state.index}): Expecting to match at least one value`,
    );
  });
};

// recursiveParser :: (() => Parser e a s) -> Parser e a s
export function recursiveParser<T, E, D>(parserThunk: () => Parser<T, E, D>): Parser<T, E, D> {
  return new Parser(function recursiveParser$state(state) {
    return parserThunk().p(state);
  });
}
