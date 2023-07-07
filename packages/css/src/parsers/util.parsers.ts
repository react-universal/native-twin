import type { CssParserError } from '../types/parser.types';
import { Parser, updateParserError } from './Parser';

export function fail(errorData: CssParserError) {
  return new Parser<any>(function fail$state(state) {
    if (state.isError) return state;
    return updateParserError(state, errorData);
  });
}
