import * as parser from '../Parser';

export const RawValueToken = parser.makeParser((cs) => {
  const colonIndex = cs.indexOf(';');
  if (colonIndex > 0) {
    const sliced = cs.slice(0, colonIndex);
    return [[{ type: 'raw', value: sliced }, cs.slice(colonIndex + 1)]];
  }
  const endRuleIndex = cs.indexOf('}');
  const sliced = cs.slice(0, endRuleIndex);
  return [[{ type: 'raw', value: sliced }, cs.slice(endRuleIndex)]];
});
