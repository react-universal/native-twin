import { Parser } from '../Parser';
import { matchChoice } from '../composers/sequence';
import { updateParserError, updateParserState } from '../helpers';
import { matchString } from './string';

const matchDotSelector = matchString('.').map((result) => ({
  type: 'dot-selector',
  value: result,
}));
const matchAtSelector = matchString('@').map((result) => ({
  type: 'at-selector',
  value: result,
}));
const matchSharpSelector = matchString('#').map((result) => ({
  type: 'sharp-selector',
  value: result,
}));

export const matchCssSelector = matchChoice([
  matchDotSelector,
  matchAtSelector,
  matchSharpSelector,
]);

export const cssSelectorSYmbolParser = new Parser((parserState) => {
  const { targetString, index, isError } = parserState;

  if (isError) {
    return parserState;
  }

  const slicedTarget = targetString.slice(index);

  const firstChar = slicedTarget[0];

  if (slicedTarget.length === 0) {
    return updateParserError(parserState, `selector: Got unexpected end of input`);
  }

  if (firstChar === '@' || firstChar === '.' || firstChar === '#') {
    let currentChar = firstChar;
    let currentIndex = index;
    while (currentChar !== '{') {
      currentIndex++;
      currentChar = targetString[currentIndex]!;
    }
    return updateParserState(
      parserState,
      currentIndex,
      targetString.slice(index, currentIndex),
    );
  }

  return updateParserError(parserState, `selector: Couldn't match selector at index ${index}`);
}).map((result) => ({
  type: 'selector',
  value: result,
}));
