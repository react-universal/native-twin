import * as parser from '..';
import { CalcToken } from './calc.token';
import { DimensionsToken } from './dimensions.token';
import { RawValueToken } from './raw-value.token';
import { TranslateValueToken } from './translate.token';

export const parseDeclarationProperty = parser
  .sequence(
    parser.many(parser.plus1(parser.letters, parser.char('-'))).map((x) => x.join('')),
    parser.char(':'),
  )
  .map((x) => x[0]);

export const parseRawDeclarationValue = parser.choice([
  DimensionsToken,
  TranslateValueToken,
  CalcToken,
  RawValueToken,
]);

export const parseRule = parser.betweenBrackets(
  parser.parseSemiColonSeparated(
    parser.sequence(parseDeclarationProperty, parseRawDeclarationValue),
  ),
);

export const parseRawRuleDeclarations = parser.many(
  parser.sequence(parseDeclarationProperty, parseRawDeclarationValue).map((x) => ({
    type: 'declaration',
    property: x[0],
    value: x[1],
  })),
);
