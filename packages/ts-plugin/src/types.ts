import type { BaseTheme, TwindConfig } from '@twind/core';
import type { TailwindTheme } from '@universal-labs/twind-adapter';

export type CurrentTheme = BaseTheme & TailwindTheme;
export type TailwindConfig = TwindConfig<CurrentTheme>;
