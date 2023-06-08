import { selectorParser } from './css.combinators';
import { Parser, updateResult } from './lib/Parser';
import { parseChoice } from './lib/choice';
import { parseMany } from './lib/many';
import { parseDigit } from './lib/numbers';
import { parseSequenceOf } from './lib/sequenceOf';
import { parseChar, parseEveryCharUntil, parseLiteral } from './lib/string';

const calcParser = parseChoice([
  parseSequenceOf([
    parseLiteral('calc'),
    parseChar('('),
    parseEveryCharUntil(parseChar(')')),
    parseChar(')'),
  ]),
]);

const translateParser = parseSequenceOf([
  parseLiteral('translate'),
  parseChar('('),
  parseEveryCharUntil(parseChar(')')),
  parseChar(')'),
]);

const unitParser = parseSequenceOf([
  parseMany(parseChoice([parseDigit, parseChar('.')])),
  parseLiteral('rem'),
]).map((x) => ({
  value: x[0].join(''),
  unit: x[1],
}));

const declarationsParser = parseSequenceOf([
  parseEveryCharUntil(parseChar(':')),
  parseChar(':'),
  parseChoice([calcParser, unitParser, translateParser]),
  parseMany(parseChoice([parseChar(';')])),
]).map((x) => ({
  property: x[0],
  value: x[2],
}));

const declarationValueParser = (x: string) => {
  return new Parser((state) => {
    const nextState = parseMany(declarationsParser).run(x);
    if (nextState.isError) return state;
    return updateResult(state, nextState.result);
  });
};

const ruleParser = parseSequenceOf([
  parseChar('{'),
  parseEveryCharUntil(parseChar('}')).chain(declarationValueParser),
  parseChar('}'),
]).map((x) => x[1]);

export const cssParser = parseMany(
  parseSequenceOf([selectorParser, ruleParser]).map((x) => {
    return {
      selector: x[0],
      declarations: x[1],
    };
  }),
);
