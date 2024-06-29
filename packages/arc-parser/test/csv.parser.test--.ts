import { inspect } from 'util';
import * as P from '../src';

const csvString = P.between(P.char('"'))(P.char('"'))(
  P.many(
    P.choice([
      P.sequenceOf([P.char('\\'), P.char('"')]).map((x) => x.join('')),
      P.anythingExcept(P.regex(/^["\n]/)),
    ]),
  ).map((x) => x.join('')),
);

const cell = P.many(P.choice([csvString, P.anythingExcept(P.regex(/^[,\n]/))])).map((x) =>
  x.join(''),
);

const cells = P.separatedBy(P.char(','))(cell);
const parser = P.separatedBy(P.char('\n'))(cells);

describe('Parser', () => {
  it('CSV parser', () => {
    const data = `
1,React JS,"A declarative, efficient, and flexible JavaScript library for building user interfaces"
2,Vue.js,"Vue.js is a progressive incrementally-adoptable JavaScript framework for building UI on the web."
3,Angular,"One framework. Mobile & desktop."
4,ember.js,"Ember.js - A JavaScript framework for creating ambitious web applications"
`;
    const result = parser.run(data);
    if (!result.isError) {
      console.log(inspect(result.result, false, null, true));
    }
    expect(result.isError).toBeFalsy();
  });
});
