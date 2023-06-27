import * as parser from '../Parser';

export const parseSelector: parser.Parser<string> = parser.makeParser((cs) => {
  if (cs[0] != '.') return [];

  const indexOfOpenBracket = cs.indexOf('{');
  if (indexOfOpenBracket < 0) return [];

  const sliced = cs.slice(0, indexOfOpenBracket);

  return [[sliced, cs.slice(indexOfOpenBracket)]];
});
