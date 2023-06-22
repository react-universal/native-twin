import * as parser from '../';

const emUnitToken = parser.token(parser.literal('em'));
const remUnitToken = parser.token(parser.literal('rem'));
const pxUnitToken = parser.token(parser.literal('px'));
const percentageUnitToken = parser.token(parser.literal('%'));
const cnUnitToken = parser.token(parser.literal('cn'));
const vhUnitToken = parser.token(parser.literal('vh'));
const vwUnitToken = parser.token(parser.literal('vw'));
const degUnitToken = parser.token(parser.literal('deg'));
const exUnitToken = parser.token(parser.literal('ex'));
const inUnitToken = parser.token(parser.literal('in'));

const parseDimensionsUnit = parser.choice([
  emUnitToken,
  remUnitToken,
  pxUnitToken,
  percentageUnitToken,
  cnUnitToken,
  vhUnitToken,
  vwUnitToken,
  degUnitToken,
  exUnitToken,
  inUnitToken,
]);

export const DimensionsToken = parser
  .token(parser.sequence(parser.validNumber, parseDimensionsUnit))
  .map((x) => ({
    type: 'dimensions',
    unit: x[1],
    value: parseFloat(x[0]),
  }));
