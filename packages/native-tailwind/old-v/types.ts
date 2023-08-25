import { CSSObject, CSSProperties } from './css.types';
import { BaseTheme, ThemeConfig, ThemeFunction, ThemeSectionResolver } from './theme.types';
import { Falsey, MaybeArray, UnionToIntersection } from './util.types';

export type Rule<Theme extends BaseTheme = BaseTheme> =
  | string
  | RegExp
  | [pattern: MaybeArray<string | RegExp>, alias: string & {}]
  | [pattern: MaybeArray<string | RegExp>, css: CSSObject]
  | [pattern: MaybeArray<string | RegExp>, resolve: RuleResolver<Theme>]
  | [pattern: MaybeArray<string | RegExp>, property: keyof CSSProperties]
  | [
      pattern: MaybeArray<string | RegExp>,
      property: keyof CSSProperties,
      // Default to first matched group
      convert: MatchConverter<Theme>,
    ];

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/n
export type MatchResult = RegExpExecArray & {
  /** The substring following the most recent match */
  $$: string;
  /** Can be used to propagate a value like a theme value */
  // _: Value

  dark?: boolean;
};

export interface Context<Theme extends BaseTheme = BaseTheme> {
  /** Allows to resolve theme values. */
  theme: ThemeFunction<Theme>;

  /**
   * resolves a rule
   *
   * @private
   */
  r: (value: string, isDark?: boolean) => RuleResult;
}

export type RuleResult = string | CSSObject | Falsey;

export type RuleResolver<
  Theme extends BaseTheme = BaseTheme,
  Match extends MatchResult = MatchResult,
> = (match: Match, context: Context<Theme>) => RuleResult;

export type MatchConverter<
  Theme extends BaseTheme = BaseTheme,
  Match extends MatchResult = MatchResult,
> = (match: Match, context: Context<Theme>) => string;

export type ThemeMatchResult<Value> = MatchResult & {
  /** The found theme value */
  _: Value;
};

export interface TailwindConfig<Theme extends BaseTheme = BaseTheme> {
  theme: ThemeConfig<Theme>;

  rules: Rule<Theme>[];

  ignorelist: (string | RegExp)[];
}

export type ExtractUserTheme<T> = {
  [key in keyof T]: key extends 'extend'
    ? never
    : T[key] extends ThemeSectionResolver<infer Value, T & BaseTheme>
    ? Value
    : T[key];
} & BaseTheme;

export type ExtractThemes<Theme> = UnionToIntersection<ExtractUserTheme<Theme> | BaseTheme>;

export interface RootConfig {
  rem: number;
  vh: number;
  vw: number;
  fontScale: number;
  scale: number;
}

export interface TailwindUserConfig<Theme = BaseTheme> {
  theme?: ThemeConfig<BaseTheme & ExtractThemes<Theme>>;
  rules?: Rule<BaseTheme & ExtractThemes<Theme>>[];
  ignorelist: (string | RegExp)[];
}
