import { Parser, updateParserResult } from './Parser';

export function exactly<T, N extends 1>(n: N): (p: Parser<T>) => Parser<[T]>;
export function exactly<T, N extends 2>(n: N): (p: Parser<T>) => Parser<[T, T]>;
export function exactly<T, N extends 3>(n: N): (p: Parser<T>) => Parser<[T, T, T]>;
export function exactly<T, N extends 4>(n: N): (p: Parser<T>) => Parser<[T, T, T, T]>;
export function exactly<T, N extends 5>(n: N): (p: Parser<T>) => Parser<[T, T, T, T, T]>;
export function exactly<T>(n: number) {
  return (parser: Parser<T>): Parser<T[]> => {
    return new Parser((state) => {
      if (state.isError) return state;
      const results = [];

      let nextState = state;
      for (let i = 0; i < n; i++) {
        const out = parser.transform(nextState);
        if (out.isError) {
          return out;
        }
        nextState = out;
        results.push(nextState.result);
      }

      return updateParserResult(state, results);
    });
  };
}
