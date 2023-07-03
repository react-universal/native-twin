import { string } from '../lib';
import * as C from './common.parsers';
import { ParseDeclarationToken } from './declaration.parsers';
import { CssRuleToken } from './rule.parsers';

export const GetAtRuleConditionToken = C.betweenParens(ParseDeclarationToken);
export const GetMediaRuleIdentToken = string.literal('@media ');
export const GetAtRuleRules = C.betweenBrackets(CssRuleToken);
