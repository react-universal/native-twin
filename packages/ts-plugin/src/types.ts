import type { BaseTheme, TwindConfig } from '@twind/core';
import type { AnyStyle } from '@universal-labs/css';
import type { TailwindTheme } from '@universal-labs/twind-adapter';

export type CurrentTheme = BaseTheme & TailwindTheme;
export type TailwindConfig = TwindConfig<CurrentTheme>;
export type Suggestion = {
  className: string;
  css: string;
  sheet: AnyStyle;
  canBeNegative: boolean;
};
