import type * as CSS from 'csstype';
import type { Falsey, MaybeArray, StringLike } from './util.types';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

export type CSSValue = string | number | bigint | Falsey | StringLike;

export type AnyReactNativeStyle = TextStyle & ViewStyle & ImageStyle;

export type TypedAtRulesKeys =
  | `@layer ${'defaults' | 'base' | 'components' | 'shortcuts' | 'utilities' | 'overrides'}`
  | `@media screen(${string})`
  | `@media ${string}`
  | `@keyframes ${string}`;

export type TypedAtRules = {
  [key in TypedAtRulesKeys]?: key extends `@layer ${string}` ? MaybeArray<CSSBase> : CSSBase;
};

export type CSSFontFace = CSS.AtRule.FontFaceFallback & CSS.AtRule.FontFaceHyphenFallback;

export interface BaseProperties extends TypedAtRules {
  '@import'?: MaybeArray<string | Falsey>;
  '@font-face'?: MaybeArray<CSSFontFace>;
}

export interface CSSNested
  extends Record<string, CSSProperties | MaybeArray<CSSObject | string> | Falsey> {}

export type CSSBase = BaseProperties & CSSNested;

export type CSSObject = CSSProperties & CSSBase;

export interface CustomProperties {
  label?: string;
  '@apply'?: MaybeArray<string> | Falsey;
}

export type CSSProperties = CSS.PropertiesFallback<string | Falsey, string | Falsey> &
  CSS.PropertiesHyphenFallback<string | Falsey, string | Falsey> &
  Partial<CustomProperties>;

export interface Sheet<Target = unknown> {
  readonly target: Target;
  insert(cssText: string, index: number): void;
  snapshot(): () => void;
  /** Clears all CSS rules from the sheet. */
  clear(): void;
  destroy(): void;
  resume(addClassName: (className: string) => void, insert: (cssText: string) => void): void;
}
