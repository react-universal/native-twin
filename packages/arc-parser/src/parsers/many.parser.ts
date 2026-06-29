import { Parser, updateParserError, updateParserResult } from './Parser';

export const many = <A>(parser: Parser<A>): Parser<A[]> => {
  return new Parser((state) => {
    if (state.isError) return state;

    const results = [];
    let nextState = state;
    while (true) {
      const out = parser.transform(nextState);

      if (out.isError) {
        break;
      } else {
        nextState = out;
        results.push(nextState.result);
        if (nextState.cursor >= nextState.target.byteLength) {
          break;
        }
      }
    }
    return updateParserResult(nextState, results);
  });
};

export const many1 = <A>(parser: Parser<A>): Parser<A[]> => {
  return new Parser((state) => {
    if (state.isError) return state;

    const response = many(parser).transform(state);
    if (response.result.length > 0) {
      return response;
    }
    return updateParserError(
      state,
      `Many1: Expecting to match at least one value at: ${state.cursor}`,
    );
  });
};
