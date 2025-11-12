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
import type { InternalTwinConfig } from '../models/twin/native-twin.types';
import * as Utils from './TwinParser.utils';

export namespace TwinParserModel {
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
    loc: TwinParserModel.WithLocation;
    documentLoc: TwinParserModel.WithLocation;
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

  export const TwinVariantNode = Data.taggedEnum<TwinParserModel.TwinVariantNode>();

  export const TwinRuleNode = Data.taggedEnum<TwinParserModel.TwinRuleNode>();
}

export class TwinParseResultHandler {
  nodes: TwinParserModel.AnyTwinComposedClass[];
  parserInput: { text: string; position: number };
  range: { start: number; end: number };

  constructor(
    parseResult: P.ResultType<TwinParserModel.AnyTwinParseResultToken[], any>,
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

  findNodeAt(offset: number): TwinParserModel.LocatedTokenResult | null {
    for (const node of this.nodes) {
      if (!Utils.isComposedNodeAtOffset(node, offset)) continue;

      if (Utils.isComposedNodeAtOffset(node, offset)) {
        return {
          node,
          fullLoc: node.documentLoc,
          group: null,
          lookupText: node.text.slice(node.loc.start, node.loc.start + offset),
        };
      }

      if (Utils.isComposedClassGroup(node)) {
        const targetComposition = node.token.composes.find((_) =>
          Utils.isComposedNodeAtOffset(_, offset),
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

const composedClassInfo = (
  token: TwinParserModel.AnyTwinClassToken,
  fullClass: { text: string; start: number },
) => {
  const tokenText = fullClass.text.slice(token.start, token.end);
  const loc: TwinParserModel.WithLocation = { start: token.start, end: token.end };
  const documentLoc: TwinParserModel.WithLocation = {
    start: token.start + fullClass.start,
    end: token.end + fullClass.start,
  };
  return { text: tokenText, documentLoc, loc, parentStarts: fullClass.start };
};

type ComposedClassInfo = ReturnType<typeof composedClassInfo>;

const createComposedClass = (
  token:
    | TwinParserModel.TwinClassNameToken
    | TwinParserModel.TwinClassNameVariantToken
    | TwinParserModel.TwinClassVariantToken
    | TwinParserModel.AnyTwinClassToken,
  info: ComposedClassInfo,
): TwinParserModel.TwinComposedClassName => ({ type: 'ComposedClass', token, ...info });

function createComposedClasses(
  groupContent: TwinParserModel.AnyTwinClassToken[],
  text: string,
  parentStarts: number,
  results: TwinParserModel.AnyTwinComposedClass[] = [],
): TwinParserModel.AnyTwinComposedClass[] {
  const nextToken = groupContent.shift();
  if (!nextToken) return results;

  if (Utils.isAnyTokenExceptGroup(nextToken)) {
    results.push(
      createComposedClass(nextToken, composedClassInfo(nextToken, { text, start: parentStarts })),
    );
    return createComposedClasses(groupContent, text, parentStarts, results);
  }

  if (Utils.isGroupToken(nextToken)) {
    const newContent = createComposedClasses(
      nextToken.composes,
      text.slice(nextToken.base.start, nextToken.base.end),
      parentStarts,
    ).map((x) => {
      x.text = text.slice(x.loc.start, x.loc.end);
      return x;
    });

    const base = createComposedClass(
      nextToken.base,
      composedClassInfo(nextToken.base, { text, start: parentStarts }),
    );

    results.push({
      type: 'ComposedGroup',
      ...composedClassInfo(nextToken, { start: parentStarts, text }),
      token: {
        base,
        composes: newContent,
      },
    });
  }
  return createComposedClasses(groupContent, text, parentStarts, results);
}
