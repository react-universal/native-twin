import { string } from '../lib';
import { betweenBrackets, betweenParens } from './common.parsers';
import { ParseDeclarationToken } from './declaration.parsers';
import { CssRuleToken } from './rule.parsers';

export const GetAtRuleConditionToken = betweenParens(ParseDeclarationToken);
export const GetMediaRuleIdentToken = string.literal('@media ');
export const GetAtRuleRules = betweenBrackets(CssRuleToken);
