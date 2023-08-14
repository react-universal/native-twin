import type { BaseTheme, TwindConfig } from '@twind/core';
import type { AnyStyle, FinalSheet } from '@universal-labs/css';
import type { TailwindTheme } from '@universal-labs/twind-adapter';

export type CurrentTheme = BaseTheme & TailwindTheme;
export type TailwindConfig = TwindConfig<CurrentTheme>;

export interface CompletionCacheItem {
  className: string;
  canBeNegative: boolean;
  isColor: boolean;
}
export interface FinalCompletion extends CompletionCacheItem {
  css: string;
  sheet: AnyStyle;
}

export interface GetCssResult {
  className: string;
  css: string;
  sheet: FinalSheet;
}
