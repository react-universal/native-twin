import { Parser } from './Parser';
import { ParserState, updateParserResult } from './ParserState';

export const separatedBy =
  <S, E>(separatorParser: Parser<S, E>) =>
  <T>(valueParser: Parser<T, E>) => {
    return new Parser<T[]>((state) => {
      if (state.isError) return state;

      let nextState: ParserState<S | T, E> = state;
      let error = null;
      const results: T[] = [];

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const valState = valueParser.transform(nextState);
        const sepState = separatorParser.transform(valState);

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
          return updateParserResult(state, results) as ParserState<T[], E>;
        }
        return error;
      }

      return updateParserResult(nextState, results);
    });
  };
