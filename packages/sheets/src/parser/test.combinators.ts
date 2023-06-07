import { choice } from './lib/choice';
import { many } from './lib/many';
import { digit } from './lib/numbers';
import { sequenceOf } from './lib/sequenceOf';
import { char, everyCharUntil, letters } from './lib/string';

const selectorParser = sequenceOf([
  char('.'),
  many(choice([letters, char('-'), digit])).map((x) => x.join('')),
]).map((x) => x[0] + x[1]);

const declarationsParser = sequenceOf([
  many(choice([letters, char('-')])),
  char(':'),
  everyCharUntil(choice([char(';')])),
  choice([char(';')]),
]);

const parser = sequenceOf([
  selectorParser,
  char('{'),
  many(choice([declarationsParser, char('}')])),
]);
parser.run('.text-2xl{font-size:1.5rem;line-height:2rem}'); //?
