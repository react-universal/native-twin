import * as parser from '../lib';
import { parseRawRuleDeclarations } from './declaration.tokenizer';

export const parseRule = parser.makeParser((cs) => {
  // TODO: throw proper error
  // if (cs[0] != '{') return parser.absurd();

  const indexOfOpenBracket = cs.indexOf('}');
  // TODO: throw proper error
  // if (indexOfOpenBracket < 0) return parser.absurd();

  const sliced = cs.slice(1, indexOfOpenBracket);
  const result = parser.apply(parseRawRuleDeclarations, sliced)[0];
  if (!result) throw new Error('Not able to parse rule: ' + sliced);
  return [[result[0], cs.slice(indexOfOpenBracket + 1)]];
});
