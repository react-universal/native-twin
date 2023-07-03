import { Parser } from '../Parser';
import { sequenceOf } from './sequence-of';

export const between =
  <L>(leftParser: Parser<L>) =>
  <R>(rightParser: Parser<R>) =>
  <T>(parser: Parser<T>): Parser<T> =>
    sequenceOf([leftParser, parser, rightParser]).map(([_, x]) => x);

export function recursiveParser<T, E>(parserThunk: () => Parser<T, E>): Parser<T, E> {
  return new Parser((state) => {
    return parserThunk().transform(state);
  });
}
