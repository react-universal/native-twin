import type { CssDeclarationNode } from '../types';
import { Parser, updateResult } from './Parser';
import {
  parseSequenceOf,
  parseBetween,
  parseChoice,
  parseMany,
  parseEveryCharUntil,
  parseChar,
  parseLiteral,
  parseRegex,
} from './common';
import { parseCssDeclaration } from './declarations.parser';

export const parseComment = parseBetween(parseLiteral('/*'))(parseLiteral('*/'))(
  parseEveryCharUntil(parseLiteral('*/')),
);

const newLine = parseChoice([
  parseChar('\n'),
  parseChar('\r'),
  parseChar('\r'),
  parseChar('\f'),
]);

export const parseWhiteSpace = parseChoice([parseChar(' '), parseChar('\t'), newLine]);

export const parseHexadecimalDigit = parseMany(
  parseChoice([parseRegex(/^[0-9]/), parseRegex(/^[a-fA-F]/)]),
);

export const parseCssSelector = parseSequenceOf([
  parseChar('.'),
  parseEveryCharUntil(parseChar('{')),
]).map((x) => x.join(''));

const parseCssDeclarations = (x: string) => {
  return new Parser<CssDeclarationNode[]>((state) => {
    const nextState = parseMany(parseCssDeclaration).run(x);
    if (nextState.isError) return state;
    return updateResult(state, nextState.result);
  });
};

export const parseCssRule = parseSequenceOf([
  parseChar('{'),
  parseEveryCharUntil(parseChar('}')).chain(parseCssDeclarations),
  parseChar('}'),
]).map((x): CssDeclarationNode[] => x[1]);
