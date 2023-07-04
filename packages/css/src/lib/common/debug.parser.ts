import { Parser } from '../Parser';
import type { ParserState } from '../ParserState';

export const tapParser = <Result, ErrorResult, Data>(
  fn: (state: ParserState<Result, ErrorResult, Data>) => void,
): Parser<Result, ErrorResult, Data> =>
  new Parser((state) => {
    fn(state);
    return state;
  });

export const debugState = <T>(expected: string, msg: string): Parser<T> => {
  return tapParser((state) => {
    // eslint-disable-next-line no-console
    console.debug(`TAP \n Message: (${msg}) expected: ("${expected}")`, '\n', state);
  });
};
