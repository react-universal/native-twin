import type { BaseTheme, Context, Falsey, KebabCase, MaybeArray } from '../types';

export type ScreenValue =
  | string
  | { raw: string }
  | { min: string; max?: string }
  | { min?: string; max: string };

export type DarkColor<Theme extends BaseTheme> = (
  section: string,
  key: string,
  context: Context<Theme>,
  color: ColorValue,
) => ColorValue | Falsey;

export interface ColorFunctionOptions {
  opacityVariable?: string | undefined;
  opacityValue?: string | undefined;
}

export type ColorFunction = (options: ColorFunctionOptions) => string;

export interface ColorRecord extends Record<string, MaybeColorValue> {
  /* empty */
}

export interface FinalRule {
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

export type ColorValue = string | ColorFunction;

export type MaybeColorValue = ColorValue | ColorRecord;

export type MaybeThunk<T, Theme extends BaseTheme = BaseTheme> =
  | T
  | ((context: Context<Theme>) => T);

export interface ThemeSectionResolver<Value, Theme extends BaseTheme = BaseTheme> {
  (context: ThemeSectionResolverContext<Theme>): Value;
}

export type ThemeSection<Value, Theme extends BaseTheme = BaseTheme> =
  | Value
  | ThemeSectionResolver<Value, Theme>;

export interface ThemeSectionResolverContext<Theme extends BaseTheme = BaseTheme> {
  readonly colors: Theme['colors'];

  readonly theme: ThemeFunction<Theme>;
  /**
   * No-op function as negated values are automatically inferred and do _not_ need to be in the theme.
   */
  readonly negative: (scale: Record<string, string>) => Record<string, string>;
  readonly breakpoints: (
    screens: Record<string, MaybeArray<ScreenValue>>,
  ) => Record<string, string>;
}

export type ThemeConfig<Theme extends BaseTheme = BaseTheme> = PartialTheme<Theme> & {
  extend?: PartialTheme<Theme>;
};

export type PartialTheme<Theme extends BaseTheme = BaseTheme> = {
  [Section in keyof Theme]?: ThemeSection<Theme[Section], Theme>;
};

export type Finalize<Theme extends BaseTheme = BaseTheme> = (
  rule: FinalRule,
  context: Context<Theme>,
) => FinalRule;

// Get the leaf theme value and omit nested records like for colors
export type ThemeValue<T> = T extends Record<string, infer V>
  ? Exclude<V, Record<string, V>>
  : T;

export interface ThemeFunction<Theme extends BaseTheme = BaseTheme> {
  (): Theme;

  <Section extends keyof Theme & string>(
    section: Section | KebabCase<Section>,
  ): Theme[Section];

  <Section extends keyof Theme & string, Key extends keyof Theme[Section]>(
    section: Section | KebabCase<Section>,
    key: Key,
  ): ThemeValue<Theme[Section]> | undefined;

  <Section extends keyof Theme & string>(section: Section | KebabCase<Section>, key: string):
    | ThemeValue<Theme[Section]>
    | undefined;

  <Section extends keyof Theme & string, Key extends keyof Theme[Section]>(
    section: Section | KebabCase<Section>,
    key: Key,
    defaultValue: ThemeValue<Theme[Section]>,
  ): ThemeValue<Theme[Section]>;

  <Section extends keyof Theme & string>(
    section: Section | KebabCase<Section>,
    key: string,
    defaultValue: ThemeValue<Theme[Section]>,
  ): ThemeValue<Theme[Section]>;

  // TODO deep path from theme: https://github.com/ghoullier/awesome-template-literal-types#dot-notation-string-type-safe
  <Section extends keyof Theme & string>(key: `${Section}.${string}`): ThemeValue<
    Theme[Section]
  >;

  <Section extends keyof Theme & string>(
    key: `${Section}.${string}`,
    defaultValue: ThemeValue<Theme[Section]>,
  ): ThemeValue<Theme[Section]>;

  (section: string): unknown | undefined;
  (section: string, key: string): unknown | string | undefined;
  <T>(section: string, key: string, defaultValue: T): T | string;
  <T>(key: string, defaultValue: T): T | string;
}
