import type { Parser } from '../Parser';
import { sequenceOf } from './sequenceOf';

// between :: Parser e a s -> Parser e b s -> Parser e c s -> Parser e b s
export function between<L, T, R>(
  leftParser: Parser<L>,
): (rightParser: Parser<R>) => (parser: Parser<T>) => Parser<T> {
  return function between$rightParser(rightParser) {
    return function between$parser(parser) {
      return sequenceOf([leftParser, parser, rightParser]).map(([_, x]) => x);
    };
  };
}
