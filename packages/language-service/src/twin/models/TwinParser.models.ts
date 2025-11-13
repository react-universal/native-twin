import type * as P from '@native-twin/arc-parser';
import type { Rule, RuleMeta, RuleResolver, Variant, VariantResolver } from '@native-twin/core';
import type {
  ArbitraryToken,
  ClassNameToken,
  GroupToken,
  VariantClassToken,
  VariantToken,
} from '@native-twin/css';
import * as Data from 'effect/Data';
import type { InternalTwinConfig } from '../../models/twin/native-twin.types';
import * as Predicates from '../TwinParser.predicates';
import { createComposedClasses } from '../TwinParser.utils';

export interface WithLocation {
  start: number;
  end: number;
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
}

export type TwinVariantNode = Data.TaggedEnum<{
  Literal: { pattern: Variant[0]; value: string };
  Resolver: { pattern: Variant[0]; value: VariantResolver };
}>;

export type TwinRuleNode = Data.TaggedEnum<{
  ThemedKey: {
    pattern: string;
    themeSection: keyof Omit<
      InternalTwinConfig['theme'] & InternalTwinConfig['theme']['extend'],
      'screens'
    >;
    resolver: RuleResolver;
    meta: NonNullable<Rule[3]>;
  };
  UnKeyed: {
    pattern: string;
    resolver: RuleResolver;
    meta: NonNullable<Rule[3]>;
  };
}>;

export interface ComposedClassInfo {
  text: string;
  documentLoc: WithLocation;
  loc: WithLocation;
  parentStarts: number;
}

export const TwinVariantNode = Data.taggedEnum<TwinVariantNode>();

export const TwinRuleNode = Data.taggedEnum<TwinRuleNode>();

export class TwinParseResultHandler {
  nodes: AnyTwinComposedClass[];
  parserInput: { text: string; position: number };
  range: { start: number; end: number };

  constructor(
    parseResult: P.ResultType<AnyTwinParseResultToken[], any>,
    { position, text }: { text: string; position: number },
  ) {
    this.parserInput = { position, text };
    this.range = { start: position, end: position + text.length };

    if (parseResult.isError) this.nodes = [];
    else this.nodes = createComposedClasses(parseResult.result, text, position);
  }

  get size() {
    return this.nodes.length;
  }

  findNodeAt(offset: number): LocatedTokenResult | null {
    for (const node of this.nodes) {
      if (!Predicates.isComposedNodeAtOffset(node, offset)) continue;

      if (Predicates.isComposedNodeAtOffset(node, offset)) {
        return {
          node,
          fullLoc: node.documentLoc,
          group: null,
          lookupText: node.text.slice(node.loc.start, node.loc.start + offset),
        };
      }

      if (Predicates.isComposedClassGroup(node)) {
        const targetComposition = node.token.composes.find((_) =>
          Predicates.isComposedNodeAtOffset(_, offset),
        );
        if (!targetComposition) return null;

        const lookupText = targetComposition.text.slice(
          targetComposition.loc.start,
          targetComposition.loc.start + offset,
        );
        return {
          fullLoc: node.documentLoc,
          group: node.token.base,
          node: targetComposition,
          lookupText,
        };
      }
    }
    return null;
  }
}
