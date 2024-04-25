import { Rule, RuleMeta } from '@native-twin/core';
import { CompleteStyle } from '@native-twin/css';
import { InternalTwinConfig } from './nativeTwin.config';
import { TemplateTokenWithText } from '../template/template.types';

export type InternalNativeTwinRule = Rule<InternalTwinConfig['theme']>;

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

export interface TwinRuleCompletionWithToken {
  value: TwinRuleWithCompletion;
  token: TemplateTokenWithText;
}

export interface TwinRuleParts {
  readonly pattern: string;
  readonly property: InternalNativeTwinRule[1] | keyof CompleteStyle | (string & {});
  readonly themeSection: InternalNativeTwinRule[1] | (string & {});
  readonly resolver: InternalNativeTwinRule[2];
  readonly meta: RuleMeta;
}

export interface TwinRuleWithCompletion {
  readonly rule: TwinRuleParts;
  readonly completion: {
    className: string;
    declarations: string[];
    declarationValue: string;
  };
  readonly composition: {
    composed: string;
    classNameExpansion: string;
    classNameSuffix: string;
    declarationSuffixes: string[];
  };
}

export interface TwinVariantParts {
  readonly name: string;
}