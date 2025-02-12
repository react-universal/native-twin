import { describe, expect, it } from 'vitest';
import pkgJson from '../package.json?raw';
import * as P from '../src/index.js';

type AnyType = string | number | boolean | number | null | object | AnyType[];

const JSONValue: P.Parser<AnyType> = P.recursiveParser(() =>
  P.whitespaceSurrounded(
    P.choice([
      stringParser,
      numberValue,
      booleanValue,
      nullValue,
      arrayParser,
      JSONParser,
    ]),
  ),
);

const scaped = P.sequenceOf([P.literal('\\'), P.char('"')]).map((x) => x[1]);
const stringParser = P.between(P.char('"'))(P.char('"'))(
  P.many1(P.choice([scaped, P.alphanumeric, P.anyCharExcept(P.char('"'))])),
).map((x) => x.join(''));

const numberValue = P.float.map((x) => Number(x));

const nullValue = P.literal('null').map(() => null);

const booleanValue = P.choice([P.literal('true'), P.literal('false')]).map((x) => {
  return x === 'true';
});

const JSONKeyValue = P.sequenceOf([
  stringParser,
  P.whitespaceSurrounded(P.char(':')),
  JSONValue,
]).map((x) => [[x[0]], x[2]]);

const arrayParser: P.Parser<AnyType[]> = P.between(P.char('['))(P.char(']'))(
  P.separatedBySpacedComma(JSONValue),
);

const JSONParser = P.betweenSpacedBrackets(P.separatedBySpacedComma(JSONKeyValue)).map(
  Object.fromEntries,
);

const betweenSquareBrackets = P.between(P.char('['))(P.char(']'));

const separatedByComma = P.separatedBy(P.char(','));

const value: P.Parser<AnyType> = P.recursiveParser(() =>
  P.whitespaceSurrounded(P.choice([P.digits, P.letters, P.alphanumeric, parser])),
);
const parser = betweenSquareBrackets(separatedByComma(value));

describe('Parsers', () => {
  it('Parse package.json', () => {
    const result = JSONValue.run(pkgJson); //?
    let message = '';
    if (result.isError) {
      message = result.error ?? '';
    }
    expect(result.isError, message).toBeFalsy();
    if (!result.isError) {
      expect(result.result).toStrictEqual(JSON.parse(pkgJson));
    }
    P.everyCharUntil;
  });

  it('Parse a nested array', () => {
    const result = P.whitespaceSurrounded(parser).run(`
      [r,[2,d,
      [2,a,4]
      ],f]
      `); //?
    let message = '';
    if (result.isError) {
      message = result.error ?? '';
    }
    expect(result.isError, message).toBeFalsy();
  });

  it('Emoji parser', () => {
    const result = P.many1(P.choice([P.letters, P.char('😀')])).run('asdas😀dasd');
    let message = '';
    if (result.isError) {
      message = result.error ?? '';
    }
    expect(result.isError, message).toBeFalsy();
  });
});
