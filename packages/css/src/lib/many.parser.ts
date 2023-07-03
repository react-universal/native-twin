import { Parser } from './Parser';
import { updateParserError, updateParserResult } from './ParserState';

export const many = <A>(parser: Parser<A>): Parser<A[]> => {
  return new Parser((state) => {
    if (state.isError) return state;
    const results = [];
    let nextState = state;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const out = parser.transform(nextState);

      if (out.isError) {
        break;
      } else {
        nextState = out;
        results.push(nextState.result);
        if (nextState.cursor >= state.target.length) {
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
    // .shadow-md{box-shadow:0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)}
    const response = many(parser).transform(state);
    if (response.result.length) {
      return response;
    }
    return updateParserError(
      state,
      `Many: does not have any result at position ${state.cursor} ${state.target.slice(
        state.cursor,
        5,
      )}`,
    );
  });
};
