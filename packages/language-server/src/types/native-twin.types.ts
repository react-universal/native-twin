import { Rule, RuleMeta } from '@native-twin/core';
import { CompleteStyle } from '@native-twin/css';
import { InternalTwinConfig } from '../native-twin/native-twin.models';

export type InternalNativeTwinRule = Rule<InternalTwinConfig['theme']>;

interface CommonCompletion {
  name: string;
  position: number;
  index: number;
}
export interface TwinClassCompletion extends CommonCompletion {
  kind: 'class';
  property: string;
  themeSection: string;
  canBeNegative: boolean;
  isColor: boolean;
  themeValue: string | null;
}

export interface TwinVariantCompletion extends CommonCompletion {
  kind: 'variant';
}

export interface TwinVariantParts {
  readonly name: string;
}

export interface TwinRuleParts {
  readonly pattern: string;
  readonly property: InternalNativeTwinRule[1] | keyof CompleteStyle | (string & {});
  readonly themeSection: InternalNativeTwinRule[1] | (string & {});
  readonly resolver: InternalNativeTwinRule[2];
  readonly meta: RuleMeta;
}

export interface TwinRuleWithCompletion {
  kind: 'rule';
  readonly order: number;
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
