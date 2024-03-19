import { __Theme__, TailwindConfig as InternalTWConfig } from '@native-twin/native-twin';

export type CurrentTheme = __Theme__;
export type TailwindConfig = InternalTWConfig<CurrentTheme>;

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
