import { Parser, possibly } from './Parser';
import { updateParserError, updateParserState } from './ParserState';
import { choice } from './choice.parser';
import { many, many1 } from './many.parser';

export const char = (cs: string): Parser<string> =>
  new Parser((state) => {
    if (state.isError) return state;
    const sliced = state.target.slice(state.cursor, state.cursor + 1);
    if (sliced === cs) {
      return updateParserState(state, sliced, state.cursor + 1);
    }
    return updateParserError(
      state,
      `Char: Parser error, expected char ${cs} but got ${sliced}`,
    );
  });

export const literal = (cs: string): Parser<string> =>
  new Parser((state) => {
    if (state.isError) return state;
    const sliced = state.target.slice(state.cursor, state.cursor + cs.length);
    if (sliced === cs) {
      return updateParserState(state, sliced, state.cursor + cs.length);
    }
    return updateParserError(
      state,
      `Literal: Parser error, expected string ${cs} but got ${sliced}`,
    );
  });

const regexLetters = /^[a-zA-Z]+/;
const regexDigits = /^[0-9]+/;

export const regex = (re: RegExp): Parser<string> =>
  new Parser((state) => {
    if (state.isError) return state;
    const { cursor, target } = state;
    const sliced = target.slice(cursor);
    const match = sliced.match(re);
    if (!match) {
      return updateParserError(
        state,
        `ParserError: (position ${cursor}) regex could not match any char`,
      );
    }
    return updateParserState(state, match[0], cursor + match[0].length);
  });

export const letters: Parser<string> = regex(regexLetters);
export const digits: Parser<string> = regex(regexDigits);

const regexWhiteSpace = /^\s+/;
export const whitespace: Parser<string> = regex(regexWhiteSpace);

export const alphanumeric: Parser<string> = many1(choice([letters, digits, whitespace])).map(
  (x) => x.join(''),
);

export const plusOrMinus = choice([char('+'), char('-')]);

export const float = many(choice([plusOrMinus, digits, char('.')])).map((x) => x.join(''));

export const orEmptyString = <T>(parser: Parser<T>) => possibly(parser).map((x) => x || '');

export const everyCharUntil = (char: string): Parser<string> =>
  new Parser((state) => {
    if (state.isError) return state;
    const { cursor, target } = state;
    const sliced = target.slice(cursor);
    const nextIndex = sliced.indexOf(char);
    return updateParserState(state, sliced.slice(0, nextIndex), cursor + nextIndex);
  });
