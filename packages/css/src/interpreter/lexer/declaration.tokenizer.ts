import * as parser from '../lib';
import { parseRawDeclarationValue } from './units.lexer';

export const parseDeclarationProperty: parser.Parser<string> = parser.makeParser((p) => {
  const indexOfSeparator = p.indexOf(':');
  if (indexOfSeparator < 0) return [];
  const property = p.slice(0, indexOfSeparator);
  const rest = p.slice(indexOfSeparator + 1);
  return [[property, rest]];
});

export const parseDeclarationValue = parser.makeParser((cs) => {
  const indexOfSeparator = cs.indexOf(';');

  if (indexOfSeparator < 0) {
    return parser.apply(parseRawDeclarationValue, cs.slice(0));
  } else {
    const nextState = parser.apply(parseRawDeclarationValue, cs.slice(0, indexOfSeparator));
    const rest = cs.slice(indexOfSeparator + 1);
    return nextState.map((i) => [i[0], rest]);
  }
});

export const parseRuleDeclarations = parser.many(
  parser.sequence(parseDeclarationProperty, parseDeclarationValue).map((x) => ({
    type: 'declaration',
    property: x[0],
    value: x[1],
  })),
);
