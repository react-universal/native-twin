import type * as P from '@native-twin/arc-parser';
import type {
  __Theme__,
  RuleMeta,
  RuleResolver,
  Variant,
  VariantResolver,
} from '@native-twin/core';
import type {
  ArbitraryToken,
  ClassNameToken,
  GroupToken,
  VariantClassToken,
  VariantToken,
} from '@native-twin/css';
import type { TailwindPresetTheme } from '@native-twin/preset-tailwind';
import * as Data from 'effect/Data';
import type ts from 'typescript';
import { Range } from 'vscode-languageserver-types';
import type { BaseTwinTextDocument } from '../documents/common/BaseTwinDocument';
import type * as LSPTypes from '../internal/LSPAdapterSpec';
import type { TwinRuleCompletion } from '../internal/TwinTypes.internal';
import { VscodeCompletionItem } from './completion.model';
import type { TwinRuleComposer } from './TwinRuleHandler';

export interface WithLocation {
  range: ts.TextRange;
  originalRange: ts.TextRange;
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

export interface TwinComposedClassName {
  type: 'ComposedClass';
  token: AnyTwinClassToken;
  classNameText: string;
  variants: string[];
  text: string;
  parentStarts: number;
  loc: WithLocation;
  documentLoc: WithLocation;
}
export interface TwinComposedClassGroup extends Omit<TwinComposedClassName, 'token' | 'type'> {
  type: 'ComposedGroup';
  token: {
    base: TwinComposedClassName;
    composes: AnyTwinComposedClass[];
  };
}

export type AnyTwinComposedClass = TwinComposedClassName | TwinComposedClassGroup;

export interface LocatedTokenResult {
  fullLoc: WithLocation;
  group: TwinComposedClassName | null;
  node: AnyTwinComposedClass;
  lookupText: string;
}

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
  documentLoc: WithLocation;
  loc: WithLocation;
  parentStarts: number;
}

/** @description Describes an the way to compose this className and get its value */
export interface TwinRuleComposition {
  composed: string;
  classNameExpansion: string;
  classNameSuffix: string;
  declarationSuffixes: string[];
}

export const TwinVariantNode = Data.taggedEnum<TwinVariantNode>();

export class TwinRuleRegistry {
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
  }

  toVscode(document: BaseTwinTextDocument, range: LSPTypes.LSPRange): VscodeCompletionItem {
    const ruleCompletion = this.toRuleCompletion();
    const fixRange = Range.create(
      document.positionAt(range.start.character),
      document.positionAt(range.end.character),
    );
    return new VscodeCompletionItem(ruleCompletion, fixRange, this.className);
  }

  toRuleCompletion(): TwinRuleCompletion {
    return {
      completion: {
        className: this.className,
        declarations: this.declarations,
        declarationValue: this.declarationValue,
      },
      composition: this.composition,
      kind: 'rule',
      order: 0,
      rule: {
        meta: this.info.meta,
        pattern: this.pattern,
        property: this.info.styleProperty,
        resolver: (): any => null,
        themeSection: this.info.themeSection,
      },
    };
  }
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
