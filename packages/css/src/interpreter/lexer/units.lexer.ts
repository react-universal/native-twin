/* eslint-disable prettier/prettier */
import * as parse from '../lib';

const numberParser = parse
  .many(parse.plus1(parse.digit, parse.char('.')))
  .chain((x) => parse.unit(x.join('')));

const lengthUnitsParser = parse.sequence(
  numberParser,
  parse.many(parse.letter).chain((x) => parse.unit(x.join(''))),
);

const decimalOrInt = parse.token(parse.plus1(parse.digit, parse.char('.')));
const parseUnitChain = parse.chainLeft(
  decimalOrInt.chain((x) => parse.unit(x)),
  parse.unit((a) => (b) => a + b),
);


lengthUnitsParser('1.5px'); //?
parseUnitChain('1.5px'); //?
