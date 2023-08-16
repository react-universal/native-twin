import type { BaseTheme, RuleResult, TwindConfig } from '@twind/core';
import type { FinalSheet } from '@universal-labs/css';
import type { TailwindTheme } from '@universal-labs/twind-adapter';

export type CurrentTheme = BaseTheme & TailwindTheme;
export type TailwindConfig = TwindConfig<CurrentTheme>;

export interface CompletionCacheItem {
  name: string;
  position: number;
  index: number;
}
export interface ClassCompletionItem extends CompletionCacheItem {
  canBeNegative: boolean;
  kind: 'class';
  isColor: boolean;
  theme: RuleResult;
}

export interface VariantCompletionItem extends CompletionCacheItem {
  kind: 'variant';
}

export interface GetCssResult {
  className: string;
  css: string;
  sheet: FinalSheet;
}
