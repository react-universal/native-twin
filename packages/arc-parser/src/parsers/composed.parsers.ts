import type { Parser } from './Parser';
import { between } from './between.parser';
import { separatedBy } from './separated-by.parser';
import { char, optionalWhitespace, whitespace } from './string.parser';

export const betweenBrackets = between(char('{'))(char('}'));

export const betweenParens = between(char('('))(char(')'));
export const separatedBySpace = separatedBy(whitespace);
export const separatedByOptionalSpace = separatedBy(optionalWhitespace);

export const whitespaceSurrounded = <T>(parser: Parser<T>) =>
  between(optionalWhitespace)(optionalWhitespace)(parser);

export const separatedByComma = separatedBy(char(','));
export const separatedBySpacedComma = separatedBy(whitespaceSurrounded(char(',')));

export const separatedBySemicolon = separatedBy(char(';'));

export const betweenSpacedBrackets = between(whitespaceSurrounded(char('{')))(
  whitespaceSurrounded(char('}')),
);
