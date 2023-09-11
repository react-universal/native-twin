import type { Parser } from '@universal-labs/css/parser';
import type { CSSObject, CSSProperties } from './css.types';
import type { ParsedRule } from './parser.types';
import type { ThemeConfig, __Theme__ } from './theme.types';
import type { Falsey } from './util.types';

export interface TailwindConfig<Theme extends __Theme__ = __Theme__> {
  theme: ThemeConfig<Theme>;

  rules: Rule<Theme>[];

  ignorelist: string[];

  root?: {
    /** Default `16px` */
    rem: number;
  };
}

export interface TailwindUserConfig<Theme = __Theme__, UserTheme extends object = {}> {
  theme?: ThemeConfig<Theme & UserTheme>;
  rules?: Rule<__Theme__>[];
  ignorelist: string[];
}

export type RuleResult = string | CSSObject | Falsey | Record<string, string>;

export type ExpArrayMatchResult = RegExpExecArray & {
  $$: string;
};

export type PlatformSupport = 'native' | 'web';

type RuleExpansions = 'edges';
export type RuleExpansionProperties = {
  kind: RuleExpansions;
  prefix: string;
  suffix: string;
};

export type RuleResolver<Theme extends __Theme__ = {}> = (
  token: string,
  theme: ThemeConfig<Theme>,
  parsed: ParsedRule,
) => RuleResult | Falsey;

export type Rule<Theme extends object = {}> =
  | [string, keyof Theme | (string & {}), keyof CSSProperties]
  | [string, CSSProperties]
  | [string, RuleResolver<Theme>]
  | TailwindRuleResolver<Theme>;

export type PatternParserResolver = Parser<string>;

export interface RuleMeta {
  canBeNegative: boolean;
  feature: 'edges' | 'corners' | 'colors' | 'default';
  baseProperty?: string | undefined;
}
export interface TailwindRuleResolver<Theme extends __Theme__ = __Theme__>
  extends RuleResolver<Theme> {
  test: (token: string) => boolean;
  pattern: string;
}

export interface ThemeContext {
  /** Allows to resolve theme values */
  colors: Record<string, string>;
  /**
   * resolves a rule
   *
   */
  r: (value: ParsedRule, isDark?: boolean) => RuleResult;

  isSupported: (support: PlatformSupport[]) => boolean;
  mode: PlatformSupport[number];
}
