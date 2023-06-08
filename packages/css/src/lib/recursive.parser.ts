import { Parser } from './Parser';

// recursiveParser :: (() => Parser e a s) -> Parser e a s
export function recursiveParser<T, E, D>(parserThunk: () => Parser<T, E, D>): Parser<T, E, D> {
  return new Parser(function recursiveParser$state(state) {
    return parserThunk().p(state);
  });
}
