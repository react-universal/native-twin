import type { CSSObject, CSSProperties } from './css.types';
import type { ParsedRule } from './parser.types';
import type {
  BaseTheme,
  MaybeColorValue,
  ThemeConfig,
  ThemeFunction,
  ThemeSectionResolver,
} from './theme.types';
import type { Falsey, UnionToIntersection } from './util.types';

export interface TailwindConfig<Theme extends BaseTheme = BaseTheme> {
  theme: ThemeConfig<Theme>;

  rules: Rule<Theme>[];

  ignorelist: string[];

  root?: {
    /** Default `16px` */
    rem: number;
  };
}

export type ExtractUserTheme<T> = {
  [key in keyof T]: key extends 'extend'
    ? never
    : T[key] extends ThemeSectionResolver<infer Value, T & BaseTheme>
    ? Value
    : T[key];
} & BaseTheme;

export type ExtractThemes<Theme> = UnionToIntersection<ExtractUserTheme<Theme> | BaseTheme>;

export interface TailwindUserConfig<Theme = BaseTheme> {
  theme?: ThemeConfig<BaseTheme & ExtractThemes<Theme>>;
  rules?: Rule<BaseTheme>[];
  ignorelist: string[];
}

export type RuleResult = string | CSSObject | Falsey | Record<string, string>;

export type ExpArrayMatchResult = RegExpExecArray & {
  $$: string;
};

export type RuleResolver<Theme extends BaseTheme = BaseTheme> = (
  match: ExpArrayMatchResult,
  context: Context<Theme>,
) => RuleResult;

export type PlatformSupport = 'native' | 'web';

type RuleExpansions = 'edges';
export type RuleExpansionProperties = {
  kind: RuleExpansions;
  prefix: string;
  suffix: string;
};

export type RuleConfig<Theme extends BaseTheme = BaseTheme> = {
  themeAlias: keyof Theme;
  propertyAlias?: keyof CSSProperties;
  expansion?: RuleExpansionProperties;
  canBeNegative?: boolean | undefined;
  resolver?: RuleResolver<Theme> | undefined;
  support?: PlatformSupport[];
};
export type Rule<Theme extends BaseTheme = BaseTheme> =
  | [pattern: string | RegExp, config: RuleConfig<Theme>]
  | [pattern: string | RegExp, resolver: RuleResolver<Theme>];

export interface TailwindConfig<Theme extends BaseTheme = BaseTheme> {
  theme: ThemeConfig<Theme>;

  rules: Rule<Theme>[];

  ignorelist: string[];
}

export interface Context<Theme extends BaseTheme = BaseTheme> {
  /** Allows to resolve theme values */
  colors: Record<string, MaybeColorValue>;
  theme: ThemeFunction<Theme>;

  /**
   * resolves a rule
   *
   */
  r: (value: ParsedRule, isDark?: boolean) => RuleResult;

  isSupported: (support: PlatformSupport[]) => boolean;
  mode: PlatformSupport[number];
}
