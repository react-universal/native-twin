import { CSSObject, CSSProperties } from './css.types';
import { BaseTheme, ThemeConfig, ThemeFunction, ThemeSectionResolver } from './theme.types';
import { Falsey, MaybeArray, UnionToIntersection } from './util.types';

export interface TailwindConfig<Theme extends BaseTheme = BaseTheme> {
  theme: ThemeConfig<Theme>;

  rules: Rule<Theme>[];

  ignorelist: string[];
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
export type RuleResolver<Theme extends BaseTheme = BaseTheme> = (
  match: any,
  context: Context<Theme>,
) => RuleResult;

export interface RuleConfig<Theme extends BaseTheme = BaseTheme> {
  themeAlias: keyof Theme;
  propertyAlias?: keyof CSSProperties;
  canBeNegative?: boolean | undefined;
  isColor?: boolean | undefined;
  resolver?: RuleResolver<Theme> | undefined;
}
export type Rule<Theme extends BaseTheme = BaseTheme> = [
  pattern: MaybeArray<string>,
  config: RuleConfig<Theme>,
];

export interface TailwindConfig<Theme extends BaseTheme = BaseTheme> {
  theme: ThemeConfig<Theme>;

  rules: Rule<Theme>[];

  ignorelist: string[];
}

export interface Context<Theme extends BaseTheme = BaseTheme> {
  /** Allows to resolve theme values. */
  theme: ThemeFunction<Theme>;

  /**
   * resolves a rule
   *
   * @private
   */
  /** TODO: bring back Rule result (maybe parsed?) */
  r: (value: string, isDark?: boolean) => any;
}
