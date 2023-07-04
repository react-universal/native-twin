import { string, composed } from '../lib';
import { CssRuleToken } from './rule.parsers';

export const GetAtRuleConditionToken = composed.betweenParens(ParseDeclarationToken);
export const GetMediaRuleIdentToken = string.literal('@media ');
export const GetAtRuleRules = composed.betweenBrackets(CssRuleToken);
