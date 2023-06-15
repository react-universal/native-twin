import * as parser from '../lib';

export const parseDeclarationProperty: parser.Parser<string> = parser.makeParser((p) => {
  const indexOfSeparator = p.indexOf(':');
  // TODO: throw proper error
  if (indexOfSeparator < 0) return [];
  const property = p.slice(0, indexOfSeparator);
  const rest = p.slice(indexOfSeparator + 1);
  return [[property, rest]];
});

export const parseDeclarationValue: parser.Parser<string> = parser.makeParser((p) => {
  const indexOfSeparator = p.indexOf(';');
  if (indexOfSeparator < 0) {
    return [[p.slice(0), '']];
  }
  const value = p.slice(0, indexOfSeparator);
  const rest = p.slice(indexOfSeparator + 1);
  return [[value, rest]];
});
