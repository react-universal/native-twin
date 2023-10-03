import type { PlatformOSType } from 'react-native';
import type { CompleteStyle } from '@universal-labs/css';
import type { SheetEntry } from './css.types';
import type { CssFeature, ParsedRule, RuleHandlerToken } from './tailwind.types';
import type { ThemeConfig, __Theme__ } from './theme.types';
import type { Falsey, MaybeArray } from './util.types';

export interface TailwindConfig<Theme extends __Theme__ = __Theme__> {
  theme: ThemeConfig<Theme>;

  rules: Rule<Theme>[];
  variants?: Variant<Theme & __Theme__>[];

  ignorelist: string[];
  root?: {
    rem: number;
  };
}

export interface TailwindUserConfig<
  Theme = __Theme__,
  UserTheme extends object = {},
  Presets extends Preset<any>[] = Preset[],
> {
  theme?: ThemeConfig<Theme & UserTheme>;
  rules?: Rule<__Theme__>[];
  variants?: Variant<Theme & __Theme__>[];
  ignorelist?: string[];
  root?: {
    rem: number;
  };
  presets?: Presets;
}

export type RuleResult = SheetEntry | Falsey;

export type PlatformSupport = 'native' | 'web';

export type RuleResolver<Theme extends __Theme__ = {}> = (
  match: RuleHandlerToken,
  context: ThemeContext<Theme>,
  parsed: ParsedRule,
) => RuleResult | Falsey;

export type Rule<Theme extends __Theme__ = __Theme__> = [
  pattern: string,
  section: keyof Theme | null,
  resolver: RuleResolver<Theme>,
  meta?: RuleMeta,
];

export interface RuleMeta {
  canBeNegative?: boolean;
  feature?: CssFeature;
  prefix?: string | undefined;
  suffix?: string | undefined;
  styleProperty?: keyof CompleteStyle;
  support?: PlatformOSType[];
}

export type VariantResult = MaybeArray<string> | Falsey;

export type VariantResolver<Theme extends __Theme__ = __Theme__> = (
  match: RuleHandlerToken,
  context: ThemeContext<Theme>,
) => VariantResult;

export type Variant<Theme extends __Theme__ = __Theme__> = [
  condition: MaybeArray<string>,
  resolve: string | VariantResolver<Theme>,
];

export interface ThemeContext<Theme extends __Theme__ = {}> {
  theme: ThemeFunction<Theme>;
  /** Allows to resolve theme values */
  colors: Record<string, string>;
  breakpoints: Exclude<__Theme__['screens'], undefined>;
  /**
   * resolves a rule
   *
   */
  r: (value: ParsedRule) => RuleResult;
  v: (value: string) => MaybeArray<string>;

  // isSupported: (support: PlatformSupport[]) => boolean;
  // mode: PlatformSupport[number];
}

export interface ThemeFunction<Theme extends __Theme__ = {}> {
  (section: keyof ThemeConfig<Theme> | (string & {}), segment: string): string | undefined;
}

export interface PresetThunk<Theme = __Theme__> {
  (config: TailwindConfig<Theme & __Theme__>): TailwindPresetConfig<Theme>;
}

export type Preset<Theme = __Theme__> = TailwindPresetConfig<Theme> | PresetThunk<Theme>;

export interface TailwindPresetConfig<Theme = __Theme__> {
  /** Allows to change how the `dark` variant is used (default: `"media"`) */
  // darkMode?: DarkModeConfig;
  // darkColor?: DarkColor<Theme & __Theme__>;

  theme?: ThemeConfig<Theme & __Theme__>;

  preflight?: false;
  // variants?: Variant<Theme & BaseTheme>[];
  rules?: Rule<Theme & __Theme__>[];

  variants?: Variant<Theme & __Theme__>[];

  // hash?: boolean | undefined | HashFunction;
  // stringify?: StringifyDeclaration<Theme & BaseTheme>;
  ignorelist?: MaybeArray<string | RegExp>;

  // finalize?: MaybeArray<Finalize<Theme & BaseTheme>>;
}
