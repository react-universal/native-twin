import { createErrorMsg, endOfInputErrorMsg } from '../utils/parser.utils';
import { getNextCharWidth, getUtf8Char } from '../utils/unicode.utils';
import { choice } from './choice.parser';
import { many1 } from './many.parser';
import { Parser, updateParserError, updateParserState } from './Parser';
import { char, letters, regex, whitespace } from './string.parser';

const regexDigits = /^[0-9]+/;

export const digit = new Parser((state) => {
  if (state.isError) return state;

  const { cursor, target } = state;
  if (target.byteLength > cursor) {
    const charWidth = getNextCharWidth(cursor, target);
    if (cursor + charWidth <= target.byteLength) {
      const char = getUtf8Char(cursor, charWidth, target);
      return target.byteLength && char && regexDigits.test(char)
        ? updateParserState(state, char, cursor + charWidth)
        : updateParserError(state, createErrorMsg('digit', cursor, `got: '${char}'`));
    }
  }

  return updateParserError(state, endOfInputErrorMsg('digit', cursor));
});

export const digits: Parser<string> = regex(regexDigits);
export const plusOrMinus = choice([char('+'), char('-')]);

export const float = many1(choice([plusOrMinus, digits, char('.')])).map((x) => x.join(''));

export const alphanumeric: Parser<string> = many1(choice([letters, digits, whitespace])).map((x) =>
  x.join(''),
);
