import { CSSObject, CSSProperties } from './css.types';
import { BaseTheme, ThemeConfig, ThemeFunction, ThemeSectionResolver } from './theme.types';
import { UnionToIntersection } from './util.types';

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

export interface TailwindUserConfig<Theme = BaseTheme> {
  theme?: ThemeConfig<BaseTheme & ExtractThemes<Theme>>;
  rules?: Rule<BaseTheme>[];
  ignorelist: (string | RegExp)[];
}

interface RuleConfig<Theme extends BaseTheme = BaseTheme> {
  propertyAlias: keyof Theme | keyof CSSProperties;
  canBeNegative: boolean;
}
export type Rule<Theme extends BaseTheme = BaseTheme> =
  | [pattern: string, alias: string & {}]
  | [pattern: string, alias: (string & {})[]]
  | [pattern: string, alias: keyof Theme]
  | [pattern: string, property: keyof CSSProperties]
  | [pattern: string, css: CSSObject]
  | [pattern: string, config: RuleConfig<Theme>];

export interface TailwindConfig<Theme extends BaseTheme = BaseTheme> {
  theme: ThemeConfig<Theme>;

  rules: Rule<Theme>[];

  ignorelist: (string | RegExp)[];
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
