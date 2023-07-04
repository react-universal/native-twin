import { Parser, ParserState } from '../Parser';

export const tapParser = <Result, ErrorResult, Data>(
  fn: (state: ParserState<Result, ErrorResult, Data>) => void,
): Parser<Result, ErrorResult, Data> =>
  new Parser((state) => {
    fn(state);
    return state;
  });
