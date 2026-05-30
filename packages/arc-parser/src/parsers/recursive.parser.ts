import { Parser } from './Parser';

export function recursiveParser<T>(parserThunk: () => Parser<T>): Parser<T> {
  return new Parser((state) => {
    const parser = parserThunk();
    return parser.transform(state);
  });
}
