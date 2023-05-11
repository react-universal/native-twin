import { Parser } from '../Parser';
import { updateParserError, updateParserResult } from '../helpers';
import type { ParserState } from '../types';

export function matchSequenceOf(parsers: Parser[]) {
  return new Parser((parserState: ParserState) => {
    if (parserState.isError) return parserState;

    const results: (string | null)[] = [];
    let nextState = parserState;

    for (let currentParser of parsers) {
      nextState = currentParser.parserStateTransformerFn(nextState);
      results.push(nextState.result);
    }

    return updateParserResult(nextState, results);
  });
}

export function matchChoice(parsers: Parser[]) {
  return new Parser((parserState) => {
    if (parserState.isError) return parserState;

    for (let currentParser of parsers) {
      const nextState = currentParser.parserStateTransformerFn(parserState);
      if (!nextState.isError) return nextState;
    }

    return updateParserError(
      parserState,
      `Choice: Unable to match with any parser at index ${parserState.index}`,
    );
  });
}
