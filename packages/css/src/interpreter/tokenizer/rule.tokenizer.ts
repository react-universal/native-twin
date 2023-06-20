import * as parser from '../lib';
import { parseRawRuleDeclarations } from './declaration.tokenizer';

export const parseRule = parser.makeParser((cs) => {
  const indexOfOpenBracket = cs.indexOf('}');
  const sliced = cs.slice(1, indexOfOpenBracket);
  const result = parser.apply(parseRawRuleDeclarations, sliced)[0];

  if (!result) throw parser.absurd();

  return [[result[0], cs.slice(indexOfOpenBracket + 1)]];
});
