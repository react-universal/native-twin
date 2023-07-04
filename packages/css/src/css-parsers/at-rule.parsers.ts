import { string, composed, parser } from '../lib';
import { ParseDeclarationProperty } from './declaration.parsers';
import { CssDimensionsParser } from './dimensions.parser';
import { CssRuleToken } from './rule.parsers';

export const GetAtRuleConditionToken = parser.sequenceOf([
  ParseDeclarationProperty,
  CssDimensionsParser,
]);
export const GetMediaRuleIdentToken = string.literal('@media ');
export const GetAtRuleRules = composed.betweenBrackets(CssRuleToken);
