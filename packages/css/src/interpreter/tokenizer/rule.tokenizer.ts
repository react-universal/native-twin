import * as parser from '../lib';

export const parseRule = parser.makeParser((cs) => {
  // TODO: throw proper error
  // if (cs[0] != '{') return parser.absurd();

  const indexOfOpenBracket = cs.indexOf('}');
  // TODO: throw proper error
  // if (indexOfOpenBracket < 0) return parser.absurd();

  const sliced = cs.slice(1, indexOfOpenBracket);
  return [[sliced, cs.slice(indexOfOpenBracket + 1)]];
});
