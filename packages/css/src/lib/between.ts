import type { Parser } from './Parser';
import { parseSequenceOf } from './sequenceOf';

// parseBetween :: Parser e a s -> Parser e b s -> Parser e c s -> Parser e b s
export function parseBetween<L, T, R>(
  leftParser: Parser<L>,
): (rightParser: Parser<R>) => (parser: Parser<T>) => Parser<T> {
  return function between$rightParser(rightParser) {
    return function between$parser(parser) {
      return parseSequenceOf([leftParser, parser, rightParser]).map(([_, x]) => x);
    };
  };
}
