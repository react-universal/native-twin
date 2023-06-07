import { Parser } from '../Parser';
import { updateParserError, updateParserState } from '../helpers';
import type { ParserState } from '../types';

export function matchString(s: string) {
  return new Parser((parserState: ParserState): ParserState => {
    const { targetString, index, isError } = parserState;

    if (isError) {
      return parserState;
    }

    const slicedTarget = targetString.slice(index);
    if (slicedTarget.length === 0) {
      return updateParserError(
        parserState,
        `str: Tried to match "${s}", but got Unexpected end of input`,
      );
    }

    if (slicedTarget.startsWith(s)) {
      return updateParserState(parserState, index + s.length, s);
    }

    return updateParserError(
      parserState,
      `Tried to match "${s}" but got "${targetString.slice(index, index + 10)}"`,
    );
  });
}

const test = matchString('he').run('he');
