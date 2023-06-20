import type { CssDeclarationNode } from '../../types';
import * as parser from '../lib';
import { parseRawDeclarationValue } from './rule.tokenizer';

export const parseDeclarationProperty: parser.Parser<string> = parser.makeParser((p) => {
  const indexOfSeparator = p.indexOf(':');
  if (indexOfSeparator < 0) return [];
  const property = p.slice(0, indexOfSeparator);
  const rest = p.slice(indexOfSeparator + 1);
  return [[property, rest]];
});

export const parseRawRuleDeclarations = parser.many(
  parser.sequence(parseDeclarationProperty, parseRawDeclarationValue).map(
    (x): CssDeclarationNode => ({
      type: 'declaration',
      property: x[0],
      value: x[1],
    }),
  ),
);
