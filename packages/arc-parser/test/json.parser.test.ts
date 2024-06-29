import { inspect } from 'util';
import * as P from '../src';

const objectParser = P.between(P.char('{'))(P.char('}'));
const commaParser = P.char(',');
const stringParser = P.between(P.char('"'))(P.char('"'))(
  P.many(P.choice([P.letters, P.digits])),
).map((x) => x.join(''));
const JSONIdent = P.choice([stringParser, P.char('-')]);
const colonParser = P.char(':');

// "ads":
const JSONKeyParser = P.sequenceOf([stringParser, colonParser]);

const JSONValue = P.sequenceOf([
  P.whitespace,
  stringParser,
  colonParser,
  P.whitespace,
  stringParser,
  P.maybe(commaParser),
]).map((x) => ({
  key: x[1],
  value: x[4],
}));

const JSONParser = P.sequenceOf([
  P.char('\n'),
  P.char('{'),
  P.many(JSONValue),
  P.whitespace,
  P.char('}'),
]).map((x) => x[2]);

describe('Parser', () => {
  it('JSON parser', () => {
    const data = `
{
  "rod-rigo": "23234sadasd",
  "rodrigo1": "23234sadasd",
  "rodrigo2": "23234sadasd"
}
`;
    const result = JSONParser.run(data);
    if (result.isError) {
      console.log(inspect(result, false, null, true));
    } else {
      console.log('RESULT:');
      console.log(inspect(result, false, null, true));
    }
    console.log
    expect(result.isError).toBeFalsy();
  });
});

const a = {
  "rod-rigo": '23234sadasd',
  rodrigo1: '23234sadasd',
  rodrigo2: '23234sadasd',
};

