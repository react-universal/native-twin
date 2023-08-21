import type * as CSS from 'csstype';
import type {
  ColorValue,
  DarkColor,
  FinalRule,
  Finalize,
  MaybeColorValue,
  MaybeThunk,
  ScreenValue,
  ThemeConfig,
  ThemeFunction,
} from './theme/theme.types';
import type { ParsedRule } from './parsers/types';

export type Falsey = false | null | undefined | void | '';
export type MaybeArray<T> = T | T[];

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

export type Class = string | number | boolean | Falsey | ClassObject | Class[];

export type CSSFontFace = CSS.AtRule.FontFaceFallback & CSS.AtRule.FontFaceHyphenFallback;

export interface CSSNested
  extends Record<string, CSSProperties | MaybeArray<CSSObject | string> | Falsey> {}

export type CSSBase = BaseProperties & CSSNested;

export type CSSObject = CSSProperties & CSSBase;

export type CSSValue = string | number | bigint | Falsey | StringLike;

export type StringLike = { toString(): string } & string;

export type Preflight = CSSBase | string;

export interface CustomProperties {
  label?: string;
  '@apply'?: MaybeArray<string> | Falsey;
}

export type VariantResult = MaybeArray<string> | Falsey;

export type MatchResult = RegExpExecArray;

export type VariantResolver<Theme extends BaseTheme = BaseTheme> = (
  match: MatchResult,
  context: Context<Theme>,
) => VariantResult;

export type Variant<Theme extends BaseTheme = BaseTheme> = [
  condition: MaybeArray<string | RegExp>,
  resolve: string | VariantResolver<Theme>,
];

export type CSSProperties = CSS.PropertiesFallback<string | Falsey, string | Falsey> &
  CSS.PropertiesHyphenFallback<string | Falsey, string | Falsey> &
  Partial<CustomProperties>;

export type KebabCase<S> = S extends `${infer C}${infer T}`
  ? KebabCase<T> extends infer U
    ? U extends string
      ? T extends Uncapitalize<T>
        ? `${Uncapitalize<C>}${U}`
        : `${Uncapitalize<C>}-${U}`
      : never
    : never
  : S;

export type RuleResolver<
  Theme extends BaseTheme = BaseTheme,
  Match extends MatchResult = MatchResult,
> = (match: Match, context: Context<Theme>) => RuleResult;

export type RuleResult = string | CSSObject | Falsey | Partial<FinalRule>[];

export type Rule<Theme extends BaseTheme = BaseTheme> =
  | string
  | RegExp
  | [pattern: MaybeArray<string | RegExp>, alias: string & {}]
  | [pattern: MaybeArray<string | RegExp>, css: CSSObject]
  | [pattern: MaybeArray<string | RegExp>, resolve: RuleResolver<Theme>]
  | [pattern: MaybeArray<string | RegExp>, property: keyof CSSProperties];

export interface BaseTheme {
  screens: Record<string, MaybeArray<ScreenValue>>;
  colors: Record<string, MaybeColorValue>;
}

export interface Context<Theme extends BaseTheme = BaseTheme> {
  /** @description Allows to resolve theme values. */
  theme: ThemeFunction<Theme>;

  /** @description escapes given string for use in a CSS selector or variable */
  e: (value: string) => string;

  /** @description create hash of given string — may be no-op eg returning the same input */
  h: (value: string) => string;

  /** @description returns the dark color */
  d: (section: string, key: string, color: ColorValue) => ColorValue | Falsey;

  /** @description resolves a variant */
  v: (value: string) => MaybeArray<string>;

  /** @description resolves a rule */
  r: (value: string, isDark?: boolean) => any;

  /** @description stringifies a CSS property and value to a declaration */
  s: (property: string, value: string) => string;

  /** @description called right before the rule is stringified and inserted into the sheet */
  f: (rule: ParsedRule) => ParsedRule;
}

export type HashFunction = (value: string, defaultHash: (value: string) => string) => string;

export type DarkModeConfig =
  | 'media'
  | 'class'
  | (string & {})
  | boolean
  | undefined
  | [mode: 'class', selector: string];

export interface RuntimeConfig<Theme extends BaseTheme = BaseTheme> {
  /** Allows to change how the `dark` variant is used (default: `"media"`) */
  darkMode?: DarkModeConfig;
  darkColor?: DarkColor<Theme>;

  theme: ThemeConfig<Theme>;

  preflight: false | MaybeThunk<Preflight | Falsey, Theme>[];
  variants: Variant<Theme>[];
  rules: Rule<Theme>[];

  hash?: boolean | undefined | HashFunction;
  // stringify: StringifyDeclaration<Theme>;
  ignorelist: (string | RegExp)[];

  finalize: Finalize<Theme>[];
}
