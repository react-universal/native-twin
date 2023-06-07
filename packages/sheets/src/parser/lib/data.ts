import { Parser, updateData } from '../Parser';

// setData :: t -> Parser e a t
export function setData<T, E, D2>(data: D2): Parser<T, E, D2> {
  return new Parser(function setData$state(state) {
    if (state.isError) return state;
    return updateData<T, E, any, D2>(state, data);
  });
}

// withData :: Parser e a x -> s -> Parser e a s
export function withData<T, E, D>(parser: Parser<T, E, any>): (data: D) => Parser<T, E, D> {
  return function withData$stateData(stateData) {
    return setData<T, E, any>(stateData).chain(() => parser);
  };
}
