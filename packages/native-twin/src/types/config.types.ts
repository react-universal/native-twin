import type { PlatformOSType } from 'react-native';
import type {
  CompleteStyle,
  CssFeature,
  TWParsedRule,
  RuleHandlerToken,
  Preflight,
  SheetEntry,
} from '@native-twin/css';
import type { Falsey, MaybeArray } from '@native-twin/helpers';
import type { ExtractThemes, ThemeConfig, __Theme__ } from './theme.types';

// CONFIGURATION TYPES

export interface TailwindConfig<Theme extends __Theme__ = __Theme__> {
  content: string[];
  darkMode: DarkModeConfig;
  theme: ThemeConfig<Theme>;
  mode: 'web' | 'native';
  rules: Rule<Theme>[];
  variants: Variant<Theme>[];
  preflight: Preflight;
  ignorelist: string[];
  root: {
    rem: number;
  };
}

export interface TailwindUserConfig<
  Theme = __Theme__,
  Presets extends Preset<any>[] = Preset[],
> {
  content: string[];
  darkMode?: DarkModeConfig;
  theme?: Theme | ThemeConfig<__Theme__ & ExtractThemes<Theme, Presets>>;
  rules?: Rule<__Theme__ & ExtractThemes<Theme, Presets>>[];
  mode?: 'web' | 'native';
  variants?: Variant<__Theme__ & ExtractThemes<Theme, Presets>>[];
  preflight?: Preflight;
  ignorelist?: string[];
  root?: {
    rem: number;
  };
  presets?: Presets;
}

/** PRESETS CONFIG */

export interface PresetThunk<Theme = __Theme__> {
  (config: TailwindConfig<Theme & __Theme__>): TailwindPresetConfig<Theme>;
}

export type Preset<Theme = __Theme__> = TailwindPresetConfig<Theme> | PresetThunk<Theme>;

export interface TailwindPresetConfig<Theme = __Theme__> {
  /** Allows to change how the `dark` variant is used (default: `"media"`) */
  darkMode?: DarkModeConfig;

  theme?: ThemeConfig<Theme & __Theme__>;
  mode?: 'web' | 'native';

  preflight?: Preflight;
  rules?: Rule<Theme & __Theme__>[];

  variants?: Variant<Theme & __Theme__>[];
  ignorelist?: MaybeArray<string | RegExp>;

  // darkColor?: DarkColor<Theme & __Theme__>;
  // hash?: boolean | undefined | HashFunction;
  // stringify?: StringifyDeclaration<Theme & BaseTheme>;

  // finalize?: MaybeArray<Finalize<Theme & BaseTheme>>;
}

/**
 * RULES CONFIG
 */

export type RuleResult = SheetEntry | Falsey;

export type PlatformSupport = 'native' | 'web';

export interface RuleResolver<Theme extends __Theme__ = {}> {
  (
    match: RuleHandlerToken,
    context: ThemeContext<Theme>,
    parsed: TWParsedRule,
  ): RuleResult | Falsey;
}

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

// VARIANTS CONFIG TYPES

export interface ReMatchResult extends RegExpExecArray {
  $$: string;
}

export type VariantResult = MaybeArray<string> | Falsey;

export interface VariantResolver<Theme extends __Theme__ = __Theme__> {
  (match: ReMatchResult, context: ThemeContext<Theme>): VariantResult;
}

export type Variant<Theme extends __Theme__ = __Theme__> = [
  condition: string | RegExp,
  resolve: string | VariantResolver<Theme>,
];

/** CONTEXT */
export interface ThemeContext<Theme extends __Theme__ = __Theme__> {
  theme: ThemeFunction<Theme>;
  /** Allows to resolve theme values */
  colors: Record<string, string>;
  breakpoints: Exclude<__Theme__['screens'], undefined>;
  mode: TailwindConfig['mode'];
  /** resolves a rule */
  r: (value: TWParsedRule) => RuleResult;
  v: (value: string) => VariantResult;

  // isSupported: (support: PlatformSupport[]) => boolean;
  // mode: PlatformSupport[number];
}

export interface ThemeFunction<Theme extends __Theme__ = __Theme__> {
  <Section extends keyof Theme>(section: Section): ThemeConfig<Theme>[Section] | undefined;
  (section: keyof Theme | (string & {}), segment: string): string | undefined;
}

export type DarkModeConfig =
  | 'media'
  | 'class'
  | (string & {})
  | boolean
  | undefined
  | [mode: 'class', selector: string];
