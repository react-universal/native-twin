import type { BaseTheme, Preset, TwindUserConfig, ParsedRule } from '@universal-labs/tailwind';
import type { TailwindTheme } from '@twind/preset-tailwind';

export type CustomConfig = TwindUserConfig<
  BaseTheme,
  (Preset<TailwindTheme> | Preset<BaseTheme>)[]
>;
export type TwindRules = Exclude<CustomConfig['rules'], undefined>;
export type { ParsedRule };
