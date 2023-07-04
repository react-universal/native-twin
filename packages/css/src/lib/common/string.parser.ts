import { Parser, updateParserError, updateParserState } from '../Parser';
import { maybe } from './maybe.parser';

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

const regexWhiteSpace = /^\s+/;
export const whitespace: Parser<string> = regex(regexWhiteSpace);

export const orEmptyString = <T>(parser: Parser<T>) => maybe(parser).map((x) => x || '');

export const everyCharUntil = (char: string): Parser<string> =>
  new Parser((state) => {
    if (state.isError) return state;
    const { cursor, target } = state;
    const sliced = target.slice(cursor);
    const nextIndex = sliced.indexOf(char);
    return updateParserState(state, sliced.slice(0, nextIndex), cursor + nextIndex);
  });
