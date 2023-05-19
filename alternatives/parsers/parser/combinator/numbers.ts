import { Parser } from '../Parser';
import { updateParserError, updateParserState } from '../helpers';

const digitsRegex = /^[0-9]+/;

export const matchDigits = new Parser((parserState) => {
  const { targetString, index, isError } = parserState;

  if (isError) {
    return parserState;
  }

  const slicedTarget = targetString.slice(index);

  if (slicedTarget.length === 0) {
    return updateParserError(parserState, `digits: Got unexpected end of input`);
  }

  const regexMatch = slicedTarget.match(digitsRegex);

  if (regexMatch) {
    return updateParserState(parserState, index + regexMatch[0].length, regexMatch[0]);
  }

  return updateParserError(parserState, `digits: Couldn't match digits at index ${index}`);
});
