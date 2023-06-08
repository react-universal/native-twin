import { Parser, ParserState, updateResult } from './Parser';

// separatedBy :: Parser e a s -> Parser e b s -> Parser e [b] s
export function separatedBy<S, T, E, D>(
  sepParser: Parser<S, E, D>,
): (valueParser: Parser<T, E, D>) => Parser<T[]> {
  return function sepBy$valParser(valueParser) {
    return new Parser<T[]>(function sepBy$valParser$state(state) {
      if (state.isError) return state;

      let nextState: ParserState<S | T, E, D> = state;
      let error = null;
      const results: T[] = [];

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const valState = valueParser.p(nextState);
        const sepState = sepParser.p(valState);

        if (valState.isError) {
          error = valState;
          break;
        } else {
          results.push(valState.result);
        }

        if (sepState.isError) {
          nextState = valState;
          break;
        }

        nextState = sepState;
      }

      if (error) {
        if (results.length === 0) {
          return updateResult(state, results) as ParserState<T[], E, D>;
        }
        return error;
      }

      return updateResult(nextState, results);
    });
  };
}
