import type { Parser, ParsedRule, RuleHandlerToken } from '@universal-labs/css/tailwind';
import type { CssFeature } from '@universal-labs/css/tailwind';
import type { CompleteStyle } from './rn.types';
import type { ThemeConfig, __Theme__ } from './theme.types';
import type { Falsey } from './util.types';

export interface TailwindConfig<Theme extends __Theme__ = __Theme__> {
  theme: ThemeConfig<Theme>;

  rules: Rule<Theme>[];

  ignorelist: string[];
}

export interface TailwindUserConfig<Theme = __Theme__, UserTheme extends object = {}> {
  theme?: ThemeConfig<Theme & UserTheme>;
  rules?: Rule<__Theme__>[];
  ignorelist: string[];
}

export type RuleResult = CompleteStyle | Falsey | Record<string, string>;

export type PlatformSupport = 'native' | 'web';

export type RuleResolver<Theme extends __Theme__ = {}> = (
  match: RuleHandlerToken,
  context: ThemeContext<Theme>,
  parsed: ParsedRule,
) => RuleResult | Falsey;

export type Rule<Theme extends object = {}> =
  | [pattern: string, resolver: RuleResolver<Theme>, meta?: RuleMeta]
  | [
      pattern: string,
      section: keyof Theme | (string & {}),
      resolver: RuleResolver<Theme>,
      meta?: RuleMeta,
    ];
// | [pattern: string, section: keyof Theme | (string & {})]
// | [pattern: string, style: CSSProperties];

export type PatternParserResolver<T extends string> = Parser<T>;

export interface RuleMeta {
  canBeNegative?: boolean;
  feature?: CssFeature;
  prefix?: string | undefined;
  suffix?: string | undefined;
  // customValues?: Record<string, string>;
}

export interface ThemeContext<Theme extends __Theme__ = {}> {
  theme: ThemeFunction<Theme>;
  /** Allows to resolve theme values */
  colors: Record<string, string>;
  breakpoints: string[];
  /**
   * resolves a rule
   *
   */
  r: (value: ParsedRule, isDark?: boolean) => RuleResult;

  isSupported: (support: PlatformSupport[]) => boolean;
  mode: PlatformSupport[number];
}

export interface ThemeFunction<Theme extends __Theme__ = {}> {
  (section: keyof ThemeConfig<Theme> | (string & {}), segment: string): string | undefined;
}
