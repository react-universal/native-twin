import { Parser } from '../Parser';

export function recursiveParser<T, E>(parserThunk: () => Parser<T, E>): Parser<T, E> {
  return new Parser((state) => {
    return parserThunk().transform(state);
  });
}
