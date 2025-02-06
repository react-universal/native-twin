import type { ParserError } from '../types';

const errorExpectationRe = /ParsingError.+Expecting/;

export const createErrorMsg = (parserName: string, cursor: number, expecting: string) => {
  return `ParsingError '${parserName}' (position ${cursor}): Expecting ${expecting}`;
};

export const endOfInputErrorMsg = (
  parserName: string,
  cursor: number,
  expecting?: string,
) => {
  return `ParsingError '${parserName}' (position: ${cursor}): ${expecting ? `Expecting ${expecting} but` : 'got end of input'}`;
};

export const mapErrorMsg =
  (parserName: string) =>
  <Data>(state: ParserError<Data>) => {
    return `ParsingError '${parserName}' (position ${state.cursor}): Expecting ${state.error?.replace(errorExpectationRe, '')}`;
  };
