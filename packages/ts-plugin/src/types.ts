import type { BaseTheme, RuleResult, TwindConfig } from '@twind/core';
import type { FinalSheet } from '@universal-labs/css';
import type { TailwindTheme } from '@universal-labs/twind-adapter';

export type CurrentTheme = BaseTheme & TailwindTheme;
export type TailwindConfig = TwindConfig<CurrentTheme>;

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
