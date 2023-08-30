import type { CSSObject, CSSProperties } from './css.types';
import type {
  BaseTheme,
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

export type RuleResult = string | CSSObject | Falsey;

export type ExpArrayMatchResult = RegExpExecArray & {
  $$: string;
};

export type RuleResolver<Theme extends BaseTheme = BaseTheme> = (
  match: ExpArrayMatchResult,
  context: Context<Theme>,
) => RuleResult;

export type PlatformSupport = 'native' | 'web';

export interface RuleConfig<Theme extends BaseTheme = BaseTheme> {
  themeAlias: keyof Theme;
  propertyAlias?: keyof CSSProperties;
  canBeNegative?: boolean | undefined;
  resolver?: RuleResolver<Theme> | undefined;
  support?: PlatformSupport[];
}
export type Rule<Theme extends BaseTheme = BaseTheme> =
  | [pattern: string | RegExp, config: RuleConfig<Theme>];

export interface TailwindConfig<Theme extends BaseTheme = BaseTheme> {
  theme: ThemeConfig<Theme>;

  rules: Rule<Theme>[];

  ignorelist: string[];
}

export interface Context<Theme extends BaseTheme = BaseTheme> {
  /** Allows to resolve theme values */
  theme: ThemeFunction<Theme>;

  /**
   * resolves a rule
   *
   */
  r: (value: string, isDark?: boolean) => RuleResult;

  isSupported: (support: PlatformSupport[]) => boolean;
}
