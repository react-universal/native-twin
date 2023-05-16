import { Parser } from '../Parser';
import { updateParserError, updateParserState } from '../helpers';

export const parsePeekPositions = (positions: number) => {
  return new Parser((parserState) => {
    const { targetString, index, isError } = parserState;

    if (isError) {
      return parserState;
    }

    const slicedTarget = targetString.slice(index);

    if (slicedTarget.length === 0) {
      return updateParserError(parserState, `selector: Got unexpected end of input`);
    }

    let currentChar = '';
    let results: string[] = [];
    for (let i = 0; i < positions; i++) {
      currentChar = slicedTarget[i]!;
      results.push(currentChar);
    }
    return updateParserState(parserState, index, results as any);
  });
};
