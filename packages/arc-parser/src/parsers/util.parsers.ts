import { Parser, updateParserError, updateParserResult } from './Parser';

export const fail = (errorData: string) => {
  return new Parser<any>((state) => {
    if (state.isError) return state;

    return updateParserError(state, errorData);
  });
};

export const decide = <A, B>(fn: (value: A) => Parser<B>): Parser<B> => {
  return new Parser((state) => {
    if (state.isError) return state;
    const parser = fn(state.result);
    return parser.transform(state);
  });
};

export const succeedWith = Parser.of;

export const endOfInput = new Parser<null>((state) => {
  if (state.isError) return state;
  const { cursor, target } = state;
  if (cursor != target.length) {
    return updateParserError(state, `Expected end of input but got '${target[cursor]}'`);
  }

  return updateParserResult(state, null);
});

export function mapTo<T>(fn: <U>(x: U) => T): Parser<T> {
  return new Parser((state) => {
    if (state.isError) return state;
    return updateParserResult(state, fn(state.result));
  });
}
