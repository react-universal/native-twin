import * as P from '@native-twin/arc-parser';
import { getTWFeatureParser, type TWParsedRule } from '@native-twin/css';
import type { Rule, ThemeContext } from '../types/config.types';
import type { __Theme__ } from '../types/theme.types';

export const createRuleResolver = <Theme extends __Theme__ = __Theme__>(rule: Rule<Theme>) => {
  const [_, __, resolver] = rule;
  const parser = createRuleMatcher(rule);
  return (token: TWParsedRule, context: ThemeContext) => {
    const parserResult = parser.run(token.n);
    if (parserResult.isError) return null;
    const nextToken = resolver(parserResult.result, context, token);
    if (!nextToken) return null;
    return nextToken;
  };
};

export const createRuleMatcher = <Theme extends __Theme__ = __Theme__>(rule: Rule<Theme>) => {
  const [rawPattern, _, __, meta] = rule;
  let patternParser = P.literal(rawPattern);
  return getTWFeatureParser(rawPattern, patternParser, meta?.feature);
};
