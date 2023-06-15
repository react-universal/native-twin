import * as parser from '../lib';

export const parseRule: parser.Parser<parser.CssAstNode<'rule'>> = parser.makeParser((cs) => {
  // TODO: throw proper error
  if (cs[0] != '{') return parser.absurd();

  const indexOfOpenBracket = cs.indexOf('}');
  // TODO: throw proper error
  if (indexOfOpenBracket < 0) return parser.absurd();

  const sliced = cs.slice(1, indexOfOpenBracket);
  return [[parser.mapResultToNode('rule', sliced), cs.slice(indexOfOpenBracket + 1)]];
});
