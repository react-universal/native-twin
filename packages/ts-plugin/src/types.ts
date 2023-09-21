import type { FinalSheet } from '@universal-labs/css';
import {
  __Theme__,
  TailwindConfig as InternalTWConfig,
  RuleResult,
} from '@universal-labs/native-tailwind';

export type CurrentTheme = __Theme__;
export type TailwindConfig = InternalTWConfig<CurrentTheme>;

interface CommonCompletionItem {
  name: string;
  position: number;
  index: number;
}
export interface ClassCompletionItem extends CommonCompletionItem {
  canBeNegative: boolean;
  kind: 'class';
  isColor: boolean;
  theme: RuleResult;
}

export interface VariantCompletionItem extends CommonCompletionItem {
  kind: 'variant';
}

export type CompletionItem = ClassCompletionItem | VariantCompletionItem;

export interface GetCssResult {
  className: string;
  css: string;
  sheet: FinalSheet;
}

export interface CompletionItemLocation {
  position: number;
  index: number;
}
