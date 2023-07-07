import type { ParserState } from '../types/parser.types';
import { Parser, updateParserResult } from './Parser';

export const separatedBy =
  <S>(separatorParser: Parser<S>) =>
  <T>(valueParser: Parser<T>) => {
    return new Parser<T[]>((state) => {
      if (state.isError) return state;

      let nextState: ParserState<S | T> = state;
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
        if (results.length == 0) {
          return updateParserResult(state, results) as ParserState<T[]>;
        }
        return error;
      }

      return updateParserResult(nextState, results);
    });
  };
