import { Parser, updateParserResult } from '../Parser';

export function maybe<T, E>(parser: Parser<T, E>): Parser<T | null, E> {
  return new Parser((state) => {
    if (state.isError) return state;

    const nextState = parser.transform(state);
    return nextState.isError ? updateParserResult(state, null) : nextState;
  });
}
