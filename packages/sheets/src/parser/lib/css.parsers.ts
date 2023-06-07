import { getSelectorGroup } from '../../utils/helpers';
import { Parser, updateResult } from '../Parser';
import { choice } from './choice';
import { many } from './many';
import { digit } from './numbers';
import { sequenceOf } from './sequenceOf';
import { char, everyCharUntil, literal } from './string';

const selectorParser = sequenceOf([char('.'), everyCharUntil(char('{'))]).map(
  (x) => x[0] + x[1],
);

const calcParser = choice([
  sequenceOf([literal('calc'), char('('), everyCharUntil(char(')')), char(')')]),
]);

const translateParser = sequenceOf([
  literal('translate'),
  char('('),
  everyCharUntil(char(')')),
  char(')'),
]);

const unitParser = sequenceOf([many(choice([digit, char('.')])), literal('rem')]).map((x) => ({
  value: x[0].join(''),
  unit: x[1],
}));

const declarationsParser = sequenceOf([
  everyCharUntil(char(':')),
  char(':'),
  choice([calcParser, unitParser, translateParser]),
  many(choice([char(';')])),
]).map((x) => ({
  property: x[0],
  value: x[2],
}));
// coroutine((run) => {
//   const property = run(everyCharUntil(char(':')));
//   run(char(':'));
//   const value = run(choice([calcParser, unitParser, translateParser]));
//   return {
//     property,
//     value,
//   };
// });

const declarationValueParser = (x: string) => {
  return new Parser((state) => {
    const nextState = many(declarationsParser).run(x);
    if (nextState.isError) return state;
    return updateResult(state, nextState.result);
  });
};

const ruleParser = sequenceOf([
  char('{'),
  everyCharUntil(char('}')).chain(declarationValueParser),
  char('}'),
]).map((x) => x[1]);

export const cssParser = many(
  sequenceOf([selectorParser, ruleParser]).map((x) => {
    return {
      selector: x[0],
      group: getSelectorGroup(x[0]),
      declarations: x[1],
    };
  }),
);
