import { Parser, updateParserResult } from '../Parser';

export function skip<E>(parser: Parser<any, E>): Parser<null, E> {
  return new Parser((state) => {
    if (state.isError) return state;
    const nextState = parser.transform(state);
    if (nextState.isError) return nextState;

    return updateParserResult(nextState, state.result);
  });
}
