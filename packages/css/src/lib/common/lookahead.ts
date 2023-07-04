import { Parser, updateParserResult } from '../Parser';

export function lookAhead<T>(parser: Parser<T>): Parser<T> {
  return new Parser((state) => {
    if (state.isError) return state;
    const nextState = parser.transform(state);
    return nextState.isError
      ? updateParserResult(state, state.result)
      : updateParserResult(state, nextState.result);
  });
}
