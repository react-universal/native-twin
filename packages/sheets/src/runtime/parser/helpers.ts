import { Parser } from './Parser';
import type { ParserState } from './types';

export function updateParserState(
  state: ParserState,
  index: number,
  result: ParserState['error'],
): ParserState {
  return {
    ...state,
    index,
    result,
  };
}

export function updateParserResult(state: ParserState, result: any): ParserState {
  return {
    ...state,
    result,
  };
}

export function updateParserError(state: ParserState, errorMsg: string): ParserState {
  return {
    ...state,
    error: errorMsg,
    isError: true,
  };
}

export function parserSucceed<T>(result: T) {
  return new Parser((state) => updateParserResult(state, result));
}
