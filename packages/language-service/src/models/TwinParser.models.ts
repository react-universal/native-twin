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
import { CompletionItemKind } from 'vscode-languageserver-types';
import { getCompletionEntryDetailsDisplayParts } from '../utils/language/language.utils';
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

  get displayParts() {
    return getCompletionEntryDetailsDisplayParts({
      declarationValue: this.declarationValue,
      feature: this.info.meta.feature,
      themeSection: this.info.themeSection,
    });
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
  entry: TwinRuleRegistry | null;
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

// export class TwinParseResultHandler {
//   nodes: AnyTwinComposedClass[];
//   parserInput: { text: string; position: number };
//   range: { start: number; end: number };

//   constructor(
//     parseResult: P.ResultType<AnyTwinParseResultToken[], any>,
//     { position, text }: { text: string; position: number },
//   ) {
//     this.parserInput = { position, text };
//     this.range = { start: position, end: position + text.length };

//     if (parseResult.isError) this.nodes = [];
//     else this.nodes = createComposedClasses(parseResult.result, text, position);
//   }

//   get size() {
//     return this.nodes.length;
//   }

//   findNodeAt(offset: number): LocatedTokenResult | null {
//     for (const node of this.nodes) {
//       if (!Predicates.isComposedNodeAtOffset(node, offset)) continue;

//       if (Predicates.isComposedNodeAtOffset(node, offset) && node.type === 'ComposedClass') {
//         return {
//           node,
//           fullLoc: node.documentLoc,
//           group: null,
//           lookupText: node.classNameText,
//         };
//       }

//       if (Predicates.isComposedClassGroup(node)) {
//         const targetComposition = node.token.composes.find((_) =>
//           Predicates.isComposedNodeAtOffset(_, offset),
//         );
//         if (!targetComposition) return null;

//         const base = node.token.base.classNameText;

//         let lookupText = '';
//         if (node.token.base.token.type === 'CLASS_NAME') {
//           lookupText += base;
//           if (!base.endsWith('-')) {
//             lookupText += '-';
//           }
//         }
//         if (targetComposition.type === 'ComposedClass') {
//           lookupText += targetComposition.text;
//         }
//         return {
//           fullLoc: node.documentLoc,
//           group: node.token.base,
//           node: targetComposition,
//           lookupText,
//         };
//       }
//     }
//     return null;
//   }
// }
// }
