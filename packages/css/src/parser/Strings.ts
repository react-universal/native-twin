import * as P from './Parser';
import * as PS from './ParserState';

export const char = (cs: string): P.Parser<string> =>
  new P.Parser((state) => {
    if (state.isError) return state;
    const sliced = state.target.slice(state.cursor, state.cursor + 1);
    if (sliced === cs) {
      return PS.updateParserState(state, sliced, state.cursor + 1);
    }
    return PS.updateParserError(
      state,
      `Char: Parser error, expected char ${cs} but got ${sliced}`,
    );
  });

export const literal = (cs: string): P.Parser<string> =>
  new P.Parser((state) => {
    if (state.isError) return state;
    const sliced = state.target.slice(state.cursor, state.cursor + cs.length);
    if (sliced === cs) {
      return PS.updateParserState(state, sliced, state.cursor + cs.length);
    }
    return PS.updateParserError(
      state,
      `Literal: Parser error, expected string ${cs} but got ${sliced}`,
    );
  });

const regexLetters = /^[a-zA-Z]+/;
const regexDigits = /^[0-9]+/;

export const regex = (re: RegExp): P.Parser<string> =>
  new P.Parser((state) => {
    if (state.isError) return state;
    const { cursor, target } = state;
    const sliced = target.slice(cursor);
    const match = sliced.match(re);
    if (!match) {
      return PS.updateParserError(
        state,
        `ParserError: (position ${cursor}) regex could not match any char`,
      );
    }
    return PS.updateParserState(state, match[0], cursor + match[0].length);
  });

export const letters: P.Parser<string> = regex(regexLetters);
export const digits: P.Parser<string> = regex(regexDigits);

const regexWhiteSpace = /^\s+/;
export const whitespace: P.Parser<string> = regex(regexWhiteSpace);

export const alphanumeric: P.Parser<string> = P.many1(
  P.choice([letters, digits, whitespace]),
).map((x) => x.join(''));

export const plusOrMinus = P.choice([char('+'), char('-')]);

export const float = P.many(P.choice([plusOrMinus, digits, char('.')])).map((x) => x.join(''));

export const orEmptyString = <T>(parser: P.Parser<T>) =>
  P.possibly(parser).map((x) => x || '');
