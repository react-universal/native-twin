import {
  type __Theme__,
  type Rule,
  type RuleMeta,
  type RuleResolver,
  type RuntimeTW,
  StyleSheetAdapter,
  type TwinRuntimeContext,
  tw,
  type Variant,
  type VariantResolver,
} from '@native-twin/core';
import type { CompleteStyle, SheetEntry } from '@native-twin/css';
import type { RuntimeSheetDeclaration } from '@native-twin/css/jsx';
import type { MaybeArray } from '@native-twin/helpers';
import * as Data from 'effect/Data';
import type * as Graph from 'effect/Graph';
import type ts from 'ts-morph';
import type { InternalTwinConfig } from '../models/twin/native-twin.types';

export namespace TwinDslModels {
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

  export interface ExpandedRule {
    className: string;
    meta: RuleMeta;
    value: any;
  }

  export const TwinVariantNode = Data.taggedEnum<TwinDslModels.TwinVariantNode>();

  export const TwinRuleNode = Data.taggedEnum<TwinDslModels.TwinRuleNode>();
}

export namespace TwinGraphModel {
  /**
   * Represents a JSX expression in the source with its declarator and root element
   */
  export interface JSXExpressionStack {
    binding: ts.Node | null;
    declarator: ts.Node | undefined;
    root: ts.Node;
    childs: ts.Node[];
  }

  export interface TraversalContext {
    visitedNodes: WeakSet<ts.Node>;
    nodeNestedInJSXTree: WeakSet<ts.Node>;
    nodeToGraph: WeakMap<ts.Node, Graph.NodeIndex>;
    depthBudget: WeakMap<ts.Node, number>;
  }

  export interface ImportInfo {
    from: string;
    node: ts.Structures;
  }
  export interface NodeInfo {
    node: ts.Node;
    identifier: string;
    isRoot: boolean;
    index: number;
    mappedProps: {
      classProp: string;
      styleProp: string;
      node: ts.JsxAttribute;
      value: { literal: string; expressions: ts.Expression[] } | null;
    }[];
  }

  export type EdgeInfo =
    | { relationship: 'jsx'; index: number; isRoot: boolean }
    | { relationship: 'declarator' };

  export type TwinFileGraph = Graph.Graph<NodeInfo, EdgeInfo, 'directed'>;
  export type MutableGraph = Graph.MutableGraph<NodeInfo, EdgeInfo, 'directed'>;
}

export class TwinTSAdapter extends StyleSheetAdapter {
  twinFn: RuntimeTW<__Theme__, unknown> = tw;
  runtimeContext: TwinRuntimeContext = {} as TwinRuntimeContext;
  toRuntimeDecls(_entries: SheetEntry[]): RuntimeSheetDeclaration[] {
    return [];
  }
  toNativeStyles(_entries: SheetEntry[]): MaybeArray<CompleteStyle> {
    return [];
  }
}
