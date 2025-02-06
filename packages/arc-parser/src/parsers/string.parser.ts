import { createErrorMsg, endOfInputErrorMsg } from '../utils/parser.utils.js';
import {
  decoder,
  encoder,
  getCharacterLength,
  getNextCharWidth,
  getString,
  getUtf8Char,
} from '../utils/unicode.utils.js';
import { Parser, updateParserError, updateParserState } from './Parser.js';
import { everythingUntil } from './everything.parser.js';
import { maybe } from './maybe.parser.js';

export const char = (cs: string): Parser<string> => {
  if (!cs || getCharacterLength(cs) !== 1) {
    throw new TypeError(`char must be called with a single character, but got ${cs}`);
  }

  return new Parser(function char$parser(state) {
    if (state.isError) return state;

    const { cursor, target } = state;

    if (cursor < target.byteLength) {
      const charWidth = getNextCharWidth(cursor, target);
      const nextCursor = cursor + charWidth;
      if (nextCursor <= target.byteLength) {
        const char = getUtf8Char(cursor, charWidth, target);
        return char === cs
          ? updateParserState(state, cs, nextCursor)
          : updateParserError(
              state,
              createErrorMsg('char', cursor, `char ${cs} but got ${char}`),
            );
      }
    }

    return updateParserError(state, endOfInputErrorMsg('char', cursor, `char ${cs}`));
  });
};

export const literal = <A extends string>(cs: A): Parser<A> => {
  if (!cs || getCharacterLength(cs) < 1) {
    throw new TypeError(
      `input must be called with a string with length > 1, but got ${cs}`,
    );
  }

  const encodedStr = encoder.encode(cs);

  return new Parser((state) => {
    if (state.isError) return state;

    const { cursor, target } = state;

    const remainingBytes = target.byteLength - cursor;

    if (remainingBytes < encodedStr.byteLength) {
      return updateParserError(
        state,
        `literal (position ${cursor}): Expecting string '${cs}', but got end of input.`,
      );
    }

    const stringAtIndex = getString(cursor, encodedStr.byteLength, target);
    return cs === stringAtIndex
      ? updateParserState(state, stringAtIndex, cursor + encoder.encode(cs).byteLength)
      : updateParserError(
          state,
          `(position ${cursor}): Expecting string '${cs}', got '${stringAtIndex}...'`,
        );
  });
};

const regexLetters = /^[a-zA-Z]+/;
const regexAnyLetter = /^[a-zA-Z]/;

export const regex = (re: RegExp): Parser<string> => {
  const typeofRe = Object.prototype.toString.call(re);
  if (typeofRe !== '[object RegExp]') {
    throw new TypeError(
      `regex must be called with a Regular Expression, but got ${typeofRe}`,
    );
  }

  if (re.toString()[1] !== '^') {
    throw new Error(`regex parsers must contain '^' start assertion.`);
  }

  return new Parser((state) => {
    if (state.isError) return state;

    const { cursor, target } = state;
    const rest = getString(cursor, target.byteLength - cursor, target);

    if (rest.length >= 1) {
      const match = rest.match(re);
      return match
        ? updateParserState(state, match[0], cursor + encoder.encode(match[0]).byteLength)
        : updateParserError(
            state,
            `(position ${cursor}): Expecting string matching '${re}', got '${rest.slice(
              0,
              5,
            )}...'`,
          );
    }

    return updateParserError(
      state,
      `(position ${cursor}): Expecting string matching '${re}', but got end of input.`,
    );
  });
};

export const letters: Parser<string> = regex(regexLetters);
export const anyLetter: Parser<string> = regex(regexAnyLetter);

const regexWhiteSpace = /^\s+/;
export const whitespace: Parser<string> = regex(regexWhiteSpace);

export const orEmptyString = <T>(parser: Parser<T>) => maybe(parser).map((x) => x || '');

export const everyCharUntil = (parser: Parser<any>) =>
  everythingUntil(parser).map((results) => decoder.decode(Uint8Array.from(results)));

export const optionalWhitespace = maybe(whitespace).map((x) => x || '');

export const newLine = regex(/^\n/);

export const startOfInput = new Parser<null>((state) => {
  if (state.isError) return state;

  const { cursor } = state;
  if (cursor > 0) {
    return updateParserError(state, `'startOfInput': Expected start of input'`);
  }

  return state;
});

// anyCharExcept :: Parser e a s -> Parser e Char s
export const anyCharExcept = (parser: Parser<any>): Parser<string> =>
  new Parser((state) => {
    if (state.isError) return state;
    const { cursor, target } = state;

    const out = parser.transform(state);
    if (out.isError) {
      if (cursor < target.byteLength) {
        const charWidth = getNextCharWidth(cursor, target);
        if (cursor + charWidth <= target.byteLength) {
          const char = getUtf8Char(cursor, charWidth, target);
          return updateParserState(state, char, cursor + charWidth);
        }
      }
      return updateParserError(
        state,
        `'anyCharExcept' (position ${cursor}): Unexpected end of input`,
      );
    }

    return updateParserError(
      state,
      `'anyCharExcept' (position ${cursor}): Matched '${out.result}' from the exception parser`,
    );
  });

export const anyChar = new Parser((state) => {
  if (state.isError) return state;

  const { cursor, target } = state;
  if (cursor < target.byteLength) {
    const charWidth = getNextCharWidth(cursor, target);
    if (cursor + charWidth <= target.byteLength) {
      const char = getUtf8Char(cursor, charWidth, target);
      return updateParserState(state, char, cursor + charWidth);
    }
  }

  return updateParserError(state, endOfInputErrorMsg('anyChar', cursor, 'a character'));
});

export const anyOfString = (cs: string) =>
  new Parser((state) => {
    if (state.isError) return state;

    const { cursor, target } = state;
    if (target.byteLength > cursor) {
      const charWidth = getNextCharWidth(cursor, target);
      const char = getUtf8Char(cursor, charWidth, target);
      return cs.includes(char)
        ? updateParserState(state, char, cursor + charWidth)
        : updateParserError(
            state,
            createErrorMsg('anyOfString', cursor, `any of "${cs}", got ${char}`),
          );
    }

    return updateParserError(
      state,
      endOfInputErrorMsg('anyOfString', cursor, `any of "${cs}"`),
    );
  });
