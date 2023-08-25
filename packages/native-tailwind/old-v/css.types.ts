import type * as CSS from 'csstype';
import { Falsey, MaybeArray, StringLike } from './util.types';

export interface ClassObject {
  [key: string]: boolean | number | unknown;
}

export type Preflight = CSSBase | string;

export type TypedAtRulesKeys =
  | `@layer ${'defaults' | 'base' | 'components' | 'shortcuts' | 'utilities' | 'overrides'}`
  | `@media screen(${string})`
  | `@media ${string}`
  | `@keyframes ${string}`;

export type TypedAtRules = {
  [key in TypedAtRulesKeys]?: key extends `@layer ${string}` ? MaybeArray<CSSBase> : CSSBase;
};

export type Class = string | number | boolean | Falsey | ClassObject | Class[];

export type CSSFontFace = CSS.AtRule.FontFaceFallback & CSS.AtRule.FontFaceHyphenFallback;

export interface BaseProperties extends TypedAtRules {
  '@import'?: MaybeArray<string | Falsey>;
  '@font-face'?: MaybeArray<CSSFontFace>;
}

export interface CSSNested
  extends Record<string, CSSProperties | MaybeArray<CSSObject | string> | Falsey> {}

export type CSSBase = BaseProperties & CSSNested;

export type CSSObject = CSSProperties & CSSBase;

export type CSSValue = string | number | bigint | Falsey | StringLike;

export interface CustomProperties {
  label?: string;
  '@apply'?: MaybeArray<string> | Falsey;
}

export type CSSProperties = CSS.PropertiesFallback<string | Falsey, string | Falsey> &
  CSS.PropertiesHyphenFallback<string | Falsey, string | Falsey> &
  Partial<CustomProperties>;
