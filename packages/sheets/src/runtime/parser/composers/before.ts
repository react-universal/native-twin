import { Parser } from '../Parser';
import { updateParserError, updateParserState } from '../helpers';

export function parseBefore(target: string) {
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
    let currentIndex = index;
    let results: string[] = [];
    while (currentIndex <= targetString.length) {
      currentChar = targetString[currentIndex]!;
      if (currentChar === target) {
        return updateParserState(parserState, currentIndex, results as any);
      }
      results.push(currentChar);
      currentIndex++;
    }

    return updateParserError(
      parserState,
      `before: Trying to match ${target} but got "${targetString.slice(
        index,
        index + 10,
      )}" at index ${index}`,
    );
  });
}
