import type { ParserState } from '../../types/types';
import { Parser } from '../Parser';

export const tapParser = <Result>(fn: (state: ParserState<Result>) => void): Parser<Result> =>
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
