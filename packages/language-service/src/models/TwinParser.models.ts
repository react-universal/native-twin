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
  TWParsedRule,
  VariantClassToken,
  VariantToken,
} from '@native-twin/css';
import type { TailwindPresetTheme } from '@native-twin/preset-tailwind';
import * as Data from 'effect/Data';
import type { TwinLSPDocument } from '../core/TwinLSPDocument.model';
import * as Predicates from '../internal/TwinParser.internals';
import type { TwinRuleComposer } from './TwinRuleHandler';

function parsedRuleToClassName(rule: TWParsedRule): string {
  let modifier = '';
  if (rule.m) {
    modifier = `/${rule.m.value}`;
  }
  return `${[...rule.v, (rule.i ? '!' : '') + rule.n + modifier].join(':')}`;
}

function parsedRuleSetToClassNames(rules: TWParsedRule[]): string {
  return rules.map(parsedRuleToClassName).join(' ');
}

export const createCompositionsComposer = (
  parserResult: TwinParsedClasses,
  document: TwinLSPDocument,
) => {
  const getCompositionRange = (composition: AnyTwinComposedClass) =>
    document.getRangeFor(
      composition.startOffset + composition.parentStarts,
      composition.endOffset + composition.parentStarts,
    );

  const getClassCompositionText = (composition: TwinClassNameToken) => {
    return parsedRuleToClassName({ ...composition.value, p: 0, v: [] });
  };

  const getVariantCompositionText = (composition: TwinClassVariantToken) => {
    return parsedRuleSetToClassNames(
      composition.value.map((x) => ({ i: x.i, n: x.n, m: null, p: 0, v: [] })),
    );
  };

  const getClassNameVariantCompositionText = (composition: TwinClassNameVariantToken) => {
    return parsedRuleToClassName({
      v: composition.value[0].value.map((x) => x.n),
      i: composition.value[1].value.i || composition.value[0].value.some((x) => x.i),
      m: composition.value[1].value.m,
      n: composition.value[1].value.n,
      p: 0,
    });
  };

  const getGroupCompositionText = (composition: AnyTwinComposedClass) => {
    return composition.text;
  };

  const getCompositionText = (composition: AnyTwinComposedClass) => {
    if (composition.type === 'ComposedClass') {
      if (composition.token.type === 'CLASS_NAME') {
        return getClassCompositionText(composition.token);
      }
      if (composition.token.type === 'VARIANT') {
        return getVariantCompositionText(composition.token);
      }
      if (composition.token.type === 'VARIANT_CLASS') {
        return getClassNameVariantCompositionText(composition.token);
      }
      if (composition.token.type === 'ARBITRARY') {
        return composition.text;
      }
      if (composition.token.type === 'GROUP') {
        return getGroupCompositionText(composition);
      }
    }
    return composition.text;
  };

  const findComposedClassAtPosition = (offset: number): LocatedTokenResult | null => {
    for (const node of parserResult.composedClasses) {
      if (!Predicates.isComposedNodeAtOffset(node, offset)) continue;

      if (Predicates.isComposedNodeAtOffset(node, offset) && node.type === 'ComposedClass') {
        return {
          endOffset: node.endOffset,
          startOffset: node.startOffset,
          fullLoc: {
            startOffset: node.startOffset + node.parentStarts,
            endOffset: node.parentStarts + node.endOffset,
          },
          group: null,
          lookupText: node.classNameText,
          node: node,
        };
      }

      if (Predicates.isComposedClassGroup(node)) {
        const targetComposition = node.token.composes.find((_) =>
          Predicates.isComposedNodeAtOffset(_, offset),
        );
        if (!targetComposition) return null;

        const base = node.token.base.classNameText;

        let lookupText = '';
        if (node.token.base.token.type === 'CLASS_NAME') {
          lookupText += base;
          if (!base.endsWith('-')) {
            lookupText += '-';
          }
        }
        if (targetComposition.type === 'ComposedClass') {
          lookupText += targetComposition.text;
        }
        return {
          startOffset: node.startOffset,
          endOffset: node.endOffset,
          group: null,
          fullLoc: {
            startOffset: node.startOffset + node.parentStarts,
            endOffset: node.endOffset + node.parentStarts,
          },
          lookupText,
          node: node,
        };
      }
    }
    return null;
  };

  return {
    parserResult,
    getCompositionRange,
    getCompositionText,
    findComposedClassAtPosition,
  };
};

export interface TwinParserInput {
  text: string;
  startOffset: number;
}

export interface TwinParsedClasses {
  startOffset: number;
  endOffset: number;
  originalInput: TwinParserInput;
  composedClasses: AnyTwinComposedClass[];
}

export interface TwinParserData {
  input: TwinParserInput;
  finalOffset: string;
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

export interface TwinComposedClassName {
  type: 'ComposedClass';
  token: AnyTwinClassToken;
  classNameText: string;
  variants: string[];
  text: string;
  parentStarts: number;
  startOffset: number;
  endOffset: number;
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
  startOffset: number;
  endOffset: number;
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
