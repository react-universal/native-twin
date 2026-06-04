import { TinyColor } from '@ctrl/tinycolor';
import type * as P from '@native-twin/arc-parser';
import type {
  __Theme__,
  RuleMeta,
  RuleResolver,
  Variant,
  VariantResolver,
} from '@native-twin/core';
import {
  type ArbitraryToken,
  type ClassNameToken,
  type GroupToken,
  sheetEntriesToCss,
  type TWParsedRule,
  type VariantClassToken,
  type VariantToken,
} from '@native-twin/css';
import type { TailwindPresetTheme } from '@native-twin/preset-tailwind';
import * as Data from 'effect/Data';
import type * as Option from 'effect/Option';
import type { PlatformOSType } from 'react-native';
import { CompletionItemKind } from 'vscode-languageserver-types';
import type { TwinRuleComposer } from './TwinRuleHandler';

export const TwinVariantNode = Data.taggedEnum<TwinVariantNode>();

export class TwinRuleRegistry {
  readonly styleObject: Record<string, string>;
  readonly className: string;
  readonly declarations: string[];
  readonly declarationValue: string;
  readonly composition: TwinRuleComposition;
  readonly info: TwinRuleComposer['info'];
  readonly pattern: string;
  constructor(
    data: {
      readonly className: string;
      readonly declarations: string[];
      readonly declarationValue: string;
    },
    composition: TwinRuleComposition,
    composer: TwinRuleComposer,
  ) {
    this.className = data.className;
    this.declarationValue = data.declarationValue;
    this.declarations = data.declarations;
    this.composition = composition;
    this.info = composer.info;
    this.pattern = composer.pattern;
    this.styleObject = Object.fromEntries(
      data.declarations.map((decl) => [decl, data.declarationValue] as const),
    );
  }

  get isColor() {
    return this.info.styleProperty === 'color' || this.info.themeSection === 'colors';
  }

  get displayParts() {
    if (this.info.meta.feature === 'colors' || this.info.themeSection === 'colors') {
      const hex = new TinyColor(this.declarationValue);
      if (hex.isValid) {
        return {
          kind: 'color',
          text: hex.toHexString(),
        };
      }
      return {
        kind: 'color',
        text: this.declarationValue,
      };
    }
    return undefined;
  }

  get completionKind() {
    return this.info.themeSection === 'colors'
      ? CompletionItemKind.Color
      : CompletionItemKind.Constant;
  }

  toCSS(parsedRule: TWParsedRule) {
    return sheetEntriesToCss([
      {
        animations: [],
        className: parsedRule.n,
        important: parsedRule.i,
        precedence: parsedRule.p,
        preflight: false,
        selectors: parsedRule.v,
        declarations: this.declarations.map((decl) => ({
          prop: decl,
          value: this.declarationValue,
        })),
      },
    ]);
  }
}

export interface ResolvedTwinResult {
  entry: Option.Option<TwinRuleRegistry>;
  parsedRegion: ParsedRuleWithLocation;
}

export interface TwinSyntaxError extends WithLocation {
  type: 'SyntaxError';
  reason: string;
}

export interface TwinParserInput {
  text: string;
  startOffset: number;
}

export type AnyRawClassToken =
  | TwinClassNameToken
  | TwinClassNameVariantToken
  | TwinClassVariantToken
  | AnyTwinClassToken;

export interface ParsedRuleWithLocation extends WithLocation {
  type: 'ParsedRuleWithLocation';
  parsed: TWParsedRule;
  fullText: string;
  raw: AnyRawClassToken;
}

export type ParserWithData<A> = P.Parser<A, TwinParserData>;

export interface TwinParserOutput extends WithLocation {
  type: 'TwinParserOutput';
  result: ParsedRuleWithLocation[];
}

export interface TwinParserData {
  input: TwinParserInput;
  finalOffset: number;
  syntaxError: TwinSyntaxError[];
}

export interface WithLocation {
  startOffset: number;
  endOffset: number;
}

export interface TwinClassNameToken extends WithLocation, ClassNameToken {}
export interface TwinClassVariantToken extends VariantToken, WithLocation {}

export interface TwinClassGroupToken extends WithLocation, Omit<GroupToken, 'value'> {
  base: TwinClassNameToken | TwinClassVariantToken;
  composes: AnyTwinClassToken[];
}

export interface TwinArbitraryToken extends WithLocation, ArbitraryToken {}

export interface TwinClassNameVariantToken extends WithLocation, VariantClassToken {}

export type AnyTwinClassToken =
  | TwinClassNameToken
  | TwinClassVariantToken
  | TwinClassGroupToken
  | TwinArbitraryToken
  | TwinClassNameVariantToken;

export type AnyTwinParseResultToken =
  | TwinClassVariantToken
  | TwinClassNameToken
  | TwinClassNameVariantToken
  | TwinClassGroupToken;

export type TwinParser = P.Parser<AnyTwinParseResultToken[]>;

// ----- DSL ------
export interface ExpandedRule {
  className: string;
  meta: RuleMeta;
  key: string;
  value: any;
  resolver: RuleResolver<__Theme__ & TailwindPresetTheme>;
}

export type TwinVariantNode = Data.TaggedEnum<{
  Literal: { pattern: Variant[0]; value: string };
  Resolver: { pattern: Variant[0]; value: VariantResolver };
}>;

export interface ComposedClassInfo {
  text: string;
  classNameText: string;
  variants: string[];
  startOffset: number;
  endOffset: number;
  parentStarts: number;
}

/** @description Describes an the way to compose this className and get its value */
export interface TwinRuleComposition {
  composed: string;
  classNameExpansion: string;
  classNameSuffix: string;
  declarationSuffixes: string[];
}

export type Units = {
  '%'?: number;
  vw?: number;
  vh?: number;
  vmin?: number;
  vmax?: number;
  em: number;
  rem: number;
  px: number;
  pt: number;
  pc: number;
  in: number;
  cm: number;
  mm: number;
};

export type StyledContext = {
  orientation: 'portrait' | 'landscape';
  resolution: number;
  fontScale: number;
  deviceWidth: number;
  deviceHeight: number;
  deviceAspectRatio: number;
  platform: PlatformOSType;
  colorScheme: 'dark' | 'light';
  units: Units;
};
