import { Parser } from '../Parser';
import { updateParserError, updateParserResult } from '../helpers';

export function matchMany(parser: Parser) {
  return new Parser((parserState) => {
    if (parserState.isError) return parserState;

    let nextState = parserState;
    const results = [];
    let done = false;

    while (!done) {
      let testState = parser.parserStateTransformerFn(nextState);
      if (!testState.isError) {
        nextState = testState;
        results.push(nextState.result);
      } else {
        done = true;
      }
    }

    return updateParserResult(nextState, results);
  });
}

export function matchStrictMany(parser: Parser) {
  return new Parser((parserState) => {
    let nextState = parserState;
    const results = [];
    let done = false;
    while (!done) {
      nextState = parser.parserStateTransformerFn(nextState);
      if (!nextState.isError) {
        results.push(nextState.result);
      } else {
        done = true;
      }
    }
    if (results.length === 0) {
      return updateParserError(nextState, `many: Unable to match any input`);
    }
    return updateParserResult(nextState, results);
  });
}
