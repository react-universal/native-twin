import * as P from '@universal-labs/arc-parser';
import { CSSUnits } from '../types/css.types';
import { Token } from '../types/parser.types';
import { parseFloatToken } from './common.parser';
import { cssUnitToken } from './tokens';

export const declarationUnitParser = P.choice([
  P.literal('px'),
  P.literal('%'),
  P.literal('em'),
  P.literal('rem'),
  P.literal('deg'),
  P.literal('vh'),
  P.literal('vw'),
  P.literal('rad'),
  P.literal('turn'),
  P.literal('pc'),
  P.literal('cn'),
  P.literal('ex'),
  P.literal('in'),
  P.literal('pt'),
  P.literal('cm'),
  P.literal('mm'),
  P.literal('Q'),
]).map((x): Token<'UNIT', CSSUnits> => cssUnitToken(x));

export const dimensionUnitParser = P.sequenceOf([parseFloatToken]);

export const declarationValueWithUnitParser = P.sequenceOf([
  P.float,
  P.maybe(declarationUnitParser),
]);
