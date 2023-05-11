import { Parser } from '../Parser';
import { updateParserError, updateParserState } from '../helpers';

const lettersRegex = /^[A-Za-z]+/;

export const matchLetters = new Parser((parserState) => {
  const { targetString, index, isError } = parserState;

  if (isError) {
    return parserState;
  }

  const slicedTarget = targetString.slice(index);

  if (slicedTarget.length === 0) {
    return updateParserError(parserState, `letters: Got unexpected end of input`);
  }

  const regexMatch = slicedTarget.match(lettersRegex);

  if (regexMatch) {
    return updateParserState(parserState, index + regexMatch[0].length, regexMatch[0]);
  }

  return updateParserError(parserState, `letters: Couldn't match letters at index ${index}`);
});
