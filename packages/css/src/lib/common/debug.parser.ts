import type { ParserState } from '../../types';
import { Parser } from '../Parser';

export const tapParser = <Result>(fn: (state: ParserState<Result>) => void): Parser<Result> =>
  new Parser((state) => {
    fn(state);
    return state;
  });
