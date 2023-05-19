import { Parser } from '../Parser';
import { updateParserResult } from '../helpers';
import { matchSequenceOf } from './sequence';

export const matchSeparatedBy = (separatorParser: Parser) => (valueParser: Parser) => {
  return new Parser((parserState) => {
    const results = [];
    let nextState = parserState;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const composedState = valueParser.parserStateTransformerFn(nextState);
      if (composedState.isError) {
        break;
      }
      results.push(composedState.result);
      nextState = composedState;

      const separatorState = separatorParser.parserStateTransformerFn(nextState);
      if (separatorState.isError) {
        break;
      }

      nextState = separatorState;
    }

    return updateParserResult(nextState, results);
  });
};

export const matchBetween =
  (leftParser: Parser, rightParser: Parser) => (contentParser: Parser) => {
    return matchSequenceOf([leftParser, contentParser, rightParser]).map((results) =>
      results ? results[1] : null,
    );
  };
