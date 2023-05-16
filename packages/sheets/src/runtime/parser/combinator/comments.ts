import { Parser } from '../Parser';
import { matchMany } from '../composers/many';
import { matchBetween } from '../composers/separated';
import { matchChoice } from '../composers/sequence';
import { updateParserError } from '../helpers';
import { matchLetters } from './letters';
import { matchDigits } from './numbers';
import { matchString } from './string';

export const matchCssComment = new Parser((parserState) => {
  const { targetString, index, isError } = parserState;

  if (isError) {
    return parserState;
  }

  const slicedTarget = targetString.slice(index);

  if (slicedTarget.length === 0) {
    return updateParserError(parserState, `comment: Got unexpected end of input`);
  }
  const peekTwo = slicedTarget.slice(0, 2);
  if (peekTwo === '/*') {
    const parser = matchBetween(matchString('/*'), matchString('*/'));
    const nextState = parser(
      matchMany(
        matchChoice([
          matchLetters,
          matchDigits,
          matchString(','),
          matchString('-'),
          matchString(':'),
          matchString('!'),
          matchString('['),
          matchString(']'),
        ]),
      ),
    ).parserStateTransformerFn(parserState);
    if (nextState.isError) {
      return updateParserError(
        parserState,
        `comment: trying match "*/" but got "${targetString.slice(
          index,
          index + 10,
        )}" comment at index ${index}`,
      );
    }
    return nextState;
  }

  return updateParserError(
    parserState,
    `comment: trying match "*/" but got "${targetString.slice(
      index,
      index + 10,
    )}" comment at index ${index}`,
  );
}).map((result: any) => ({
  type: 'comment',
  value: result.join(''),
}));
