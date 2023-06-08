import { Parser, updateError, updateResult } from './Parser';

// parseMany :: Parser e s a -> Parser e s [a]
export const parseMany = function many<T>(parser: Parser<T>): Parser<T[]> {
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
export const parseManyOrOne = function many1<T>(parser: Parser<T>): Parser<T[]> {
  return new Parser(function many1$state(state) {
    if (state.isError) return state;

    const resState = parseManyOrOne(parser).p(state);
    if (resState.result.length) return resState;

    return updateError(
      state,
      `ParseError 'many1' (position ${state.index}): Expecting to match at least one value`,
    );
  });
};
