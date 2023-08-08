import type {
  TailwindTheme,
  BaseTheme,
  Preset,
  TwindUserConfig,
  ParsedRule,
} from '@universal-labs/twind-native';

export type CustomConfig = TwindUserConfig<
  BaseTheme,
  (Preset<TailwindTheme> | Preset<BaseTheme>)[]
>;
export type TwindRules = Exclude<CustomConfig['rules'], undefined>;
export type { ParsedRule };
