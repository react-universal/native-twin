import { InputTypes, type ParserState } from '../types';
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
  const { cursor, target, inputType } = state;

  if (cursor !== target.byteLength) {
    const errorByte =
      inputType === InputTypes.STRING
        ? String.fromCharCode(target.getUint8(cursor))
        : `0x${target.getUint8(cursor).toString(16).padStart(2, '0')}`;

    return updateParserError(state, `Expected end of input but got '${errorByte}'`);
  }

  return updateParserResult(state, null);
});

export function mapTo<T>(fn: <U>(x: U) => T): Parser<T> {
  return new Parser((state) => {
    if (state.isError) return state;
    return updateParserResult(state, fn(state.result));
  });
}

export function mapState<T>(fn: <U>(x: ParserState<U, any>) => T): Parser<T> {
  return new Parser((state) => {
    if (state.isError) return state;
    return updateParserResult(state, fn(state));
  });
}
