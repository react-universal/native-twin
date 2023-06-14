import * as parser from '../lib';

export const parseSelector: parser.Parser<parser.CssAstNode<'selector'>> = parser.makeParser(
  (cs) => {
    if (cs[0] != '.') return [];

    const indexOfOpenBracket = cs.indexOf('{');
    if (indexOfOpenBracket < 0) return [];

    const sliced = cs.slice(0, indexOfOpenBracket);
    return [[parser.mapResultToNode('selector', sliced), cs.slice(indexOfOpenBracket)]];
  },
);
