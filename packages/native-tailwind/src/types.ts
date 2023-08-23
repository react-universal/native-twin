import type * as CSS from 'csstype';
import type {
  MaybeColorValue,
  ScreenValue,
  ThemeConfig,
  ThemeFunction,
} from './theme/theme.types';

export interface BaseTheme {
  screens: Record<string, MaybeArray<ScreenValue>>;
  colors: Record<string, MaybeColorValue>;
}

export type Falsey = false | null | undefined | void | '';
export type MaybeArray<T> = T | T[];

export type Class = string | number | boolean | Falsey | ClassObject | Class[];

export type CSSFontFace = CSS.AtRule.FontFaceFallback & CSS.AtRule.FontFaceHyphenFallback;

export interface CSSNested
  extends Record<string, CSSProperties | MaybeArray<CSSObject | string> | Falsey> {}

export type CSSBase = BaseProperties & CSSNested;

export type CSSObject = CSSProperties & CSSBase;

export type CSSValue = string | number | bigint | Falsey | StringLike;

export type StringLike = { toString(): string } & string;

export type Preflight = CSSBase | string;

export type TypedAtRulesKeys =
  | `@layer ${'defaults' | 'base' | 'components' | 'shortcuts' | 'utilities' | 'overrides'}`
  | `@media screen(${string})`
  | `@media ${string}`
  | `@keyframes ${string}`;

export type TypedAtRules = {
  [key in TypedAtRulesKeys]?: key extends `@layer ${string}` ? MaybeArray<CSSBase> : CSSBase;
};

export interface BaseProperties extends TypedAtRules {
  '@import'?: MaybeArray<string | Falsey>;
  '@font-face'?: MaybeArray<CSSFontFace>;
}

export interface ClassObject {
  [key: string]: boolean | number | unknown;
}

export interface CustomProperties {
  label?: string;
  '@apply'?: MaybeArray<string> | Falsey;
}

export type CSSProperties = CSS.PropertiesFallback<string | Falsey, string | Falsey> &
  CSS.PropertiesHyphenFallback<string | Falsey, string | Falsey> &
  Partial<CustomProperties>;

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

export type KebabCase<S> = S extends `${infer C}${infer T}`
  ? KebabCase<T> extends infer U
    ? U extends string
      ? T extends Uncapitalize<T>
        ? `${Uncapitalize<C>}${U}`
        : `${Uncapitalize<C>}-${U}`
      : never
    : never
  : S;

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

export type RuleResult = string | CSSObject | Falsey | Partial<TailwindRule>[];

export interface TailwindRule {
  /** The calculated precedence taking all variants into account. */
  p: number;

  /* The precedence of the properties within {@link d}. */
  o: number;

  /** Additional classNames to propagate, does not include name */
  c?: string;

  /** The rulesets (selectors and at-rules). expanded variants `@media ...`, `@supports ...`, `&:focus`, `.dark &` */
  r: string[];

  /** The name to use for `&` expansion in selectors. Maybe empty for at-rules like `@import`, `@font-face`, `@media`, ... */
  n?: string;

  /** The stringified declarations. */
  d?: string;
}

export type RuleResolver<
  Theme extends BaseTheme = BaseTheme,
  Match extends MatchResult = MatchResult,
> = (match: Match, context: Context<Theme>) => RuleResult;

export type MatchConverter<
  Theme extends BaseTheme = BaseTheme,
  Match extends MatchResult = MatchResult,
> = (match: Match, context: Context<Theme>) => string;

export interface TailwindConfig<Theme extends BaseTheme = BaseTheme> {
  theme: ThemeConfig<Theme>;

  rules: Rule<Theme>[];

  ignorelist: (string | RegExp)[];
}

export type ThemeMatchResult<Value> = MatchResult & {
  /** The found theme value */
  _: Value;
};
