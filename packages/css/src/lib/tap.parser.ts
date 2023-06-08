import { Parser, ParserState } from './Parser';

// tapParser :: (a => ()) -> Parser e a s
export function tapParser<T, E, D>(
  fn: (state: ParserState<T, E, D>) => void,
): Parser<T, E, D> {
  return new Parser(function tapParser$state(state) {
    fn(state);
    return state;
  });
}
