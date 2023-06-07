import { getSelectorGroup } from '../utils/helpers';
import { Parser } from './Parser';
import { between } from './lib/between';
import { choice } from './lib/choice';
import { many, many1, recursiveParser } from './lib/many';
import { digit } from './lib/numbers';
import { sequenceOf } from './lib/sequenceOf';
import { char, everyCharUntil, literal } from './lib/string';

const unitParser = sequenceOf([many(choice([digit, char('.')])), literal('rem')]).map((x) => ({
  value: x[0].join(''),
  unit: x[1],
}));

const ruleParser2 = recursiveParser(() =>
  many(choice([selectorParser, parseCssDeclarations])),
);

const test = ruleParser
  .chain((x) => char('!'))
  .run('.text-2xl{font-size:1.5rem;line-height:2rem}.-top-2{top:calc(0.5rem * -1)}');

// sequenceOf([selectorParser, between(char('{'))(char('}'))(many(parseCssDeclarations))])
//   .errorMap((x) => {
//     console.log('X', x);
//     return new Parser((state) => state);
//   })
//   .map((x) => ({
//     selector: x[0],
//     declarations: x[1],
//   }));

const calcParser = choice([
  sequenceOf([literal('calc'), char('('), everyCharUntil(char(')')), char(')')]),
]);

const translateParser = sequenceOf([
  literal('translate'),
  char('('),
  everyCharUntil(char(')')),
  char(')'),
]);

const parseDeclarationProperty = everyCharUntil(char(':'));

export const parseCssDeclarations = sequenceOf([
  parseDeclarationProperty,
  char(':'),
  choice([calcParser, unitParser, translateParser]),
  many(choice([char(';')])),
]).map((x) => {
  return {
    property: x[0],
    value: x[2],
  };
});

const selectorParser = everyCharUntil(char('{'));

//  many(
//   sequenceOf([
//     char('.'),
//     everyCharUntil(char('{')),
//     char('{'),
//     everyCharUntil(many(parseCssDeclarations)),
//     char('}'),
//   ]).map((x) => ({
//     selector: x[1],
//     declarations: x[3],
//   })),
// );

const ruleParser = sequenceOf([char('{'), everyCharUntil(char('}')), char('}')]).map(
  (x) => x[1],
);

export const parseCssRule = many1(
  sequenceOf([selectorParser, ruleParser]).map((x) => {
    return {
      selector: x[0],
      group: getSelectorGroup(x[0]),
      declarations: x[1],
    };
  }),
);

// const test2 = parseCssRule.run(
//   '.text-2xl{font-size:1.5rem;line-height:2rem}.-top-2{top:calc(0.5rem * -1)}',
// );
