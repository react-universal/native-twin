import type { CssParserError } from '../types/parser.types';
import { Parser, updateParserError, updateParserResult } from './Parser';

export const fail = (errorData: CssParserError) => {
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
    return updateParserError(state, {
      message: `Expected end of input but got '${target[cursor]}'`,
      position: cursor,
    });
  }

  return updateParserResult(state, null);
});

export function mapTo<T>(fn: (x: any) => T): Parser<T> {
  return new Parser((state) => {
    if (state.isError) return state;
    return updateParserResult(state, fn(state.result));
  });
}
