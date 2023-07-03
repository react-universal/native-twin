import type { Parser } from '../Parser';
import { choice } from './choice.parser';
import { many, many1 } from './many.parser';
import { char, letters, regex, whitespace } from './string.parser';

const regexDigits = /^[0-9]+/;

export const digits: Parser<string> = regex(regexDigits);
export const plusOrMinus = choice([char('+'), char('-')]);

export const float = many(choice([plusOrMinus, digits, char('.')])).map((x) => x.join(''));

export const alphanumeric: Parser<string> = many1(choice([letters, digits, whitespace])).map(
  (x) => x.join(''),
);
