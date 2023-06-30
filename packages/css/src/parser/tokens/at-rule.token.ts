import * as S from '../Strings';
import * as C from './Common.tokens';
import { ParseDeclarationToken } from './Declaration.token';
import { CssRuleToken } from './Rule.token';

export const GetAtRuleConditionToken = C.betweenParens(ParseDeclarationToken);
export const GetMediaRuleIdentToken = S.literal('@media ');
export const GetAtRuleRules = C.betweenBrackets(CssRuleToken);
