import { TemplateTokenWithText } from '../template/template.types';
import { TwinRuleWithCompletion } from './nativeTwin.rules';

interface CommonCompletionToken {
  name: string;
  position: number;
  index: number;
}
export interface ClassCompletionToken extends CommonCompletionToken {
  kind: 'class';
  property: string;
  themeSection: string;
  canBeNegative: boolean;
  isColor: boolean;
  themeValue: string | null;
}

export interface VariantCompletionToken extends CommonCompletionToken {
  kind: 'variant';
}

export type CompletionToken = ClassCompletionToken | VariantCompletionToken;

export interface CompletionItemLocation {
  position: number;
  index: number;
}

export interface CompletionRuleWithToken {
  ruleInfo: TwinRuleWithCompletion;
  token: TemplateTokenWithText;
}
