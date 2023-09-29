import type { PlatformOSType } from 'react-native';
import type {
  CssFeature,
  CompleteStyle,
  ParsedRule,
  RuleHandlerToken,
} from '@universal-labs/css';
import type { SheetEntry } from './css.types';
import type { ThemeConfig, __Theme__ } from './theme.types';
import type { Falsey } from './util.types';

export interface TailwindConfig<Theme extends __Theme__ = __Theme__> {
  theme: ThemeConfig<Theme>;

  rules: Rule<Theme>[];

  ignorelist: string[];
  root?: {
    rem: number;
  };
}

export interface TailwindUserConfig<Theme = __Theme__, UserTheme extends object = {}> {
  theme?: ThemeConfig<Theme & UserTheme>;
  rules?: Rule<__Theme__>[];
  ignorelist?: string[];
  root?: {
    rem: number;
  };
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
  v: (variants: string[]) => boolean;

  // isSupported: (support: PlatformSupport[]) => boolean;
  // mode: PlatformSupport[number];
}

export interface ThemeFunction<Theme extends __Theme__ = {}> {
  (section: keyof ThemeConfig<Theme> | (string & {}), segment: string): string | undefined;
}
