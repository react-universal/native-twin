import { parseBetween } from './lib/between';
import { parseChoice } from './lib/choice';
import { parseMany } from './lib/many';
import { parseSequenceOf } from './lib/sequenceOf';
import { parseEveryCharUntil, parseChar, parseLiteral, parseRegex } from './lib/string';

const makePrimitiveType = <Type extends string>(type: Type) => {
  return <Value extends string>(value: Value) =>
    ({
      value: value as Value,
      type: type as Type,
      toString: (): `${Type}::${Value}` => `${type}::${value}`,
    } as const);
};

const selectorType = makePrimitiveType('Selector');
const ruleType = makePrimitiveType('Rule');
const atRuleType = makePrimitiveType('AtRule');
const declarationType = makePrimitiveType('Declaration');

const comment = parseBetween(parseLiteral('/*'))(parseLiteral('*/'))(
  parseEveryCharUntil(parseLiteral('*/')),
);

const newLine = parseChoice([
  parseChar('\n'),
  parseChar('\r'),
  parseChar('\r'),
  parseChar('\f'),
]);

const whiteSpace = parseChoice([parseChar(' '), parseChar('\t'), newLine]);

const hexadecimalDigit = parseMany(
  parseChoice([parseRegex(/^[0-9]/), parseRegex(/^[a-fA-F]/)]),
);

export const selectorParser = parseSequenceOf([
  parseChar('.'),
  parseEveryCharUntil(parseChar('{')),
]).map((x) => x[0] + x[1]);
