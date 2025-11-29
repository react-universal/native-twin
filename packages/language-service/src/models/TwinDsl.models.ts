import type * as Effect from 'effect/Effect';
import type * as Graph from 'effect/Graph';
import type ts from 'ts-morph';

export namespace TwinDslModels {
  export interface TwinSourceFile {
    readonly _tag: 'TwinSourceFile';
    jsxDeclarators: NodeJSXDeclarator[];
    node: ts.SourceFile;
  }

  export interface NodeStyledProp {
    readonly _tag: 'NodeStyledProp';
    node: ts.JsxAttribute;
    valueTextNode: ts.Node | null;
    classProp: string;
    styleProp: string;
    originalText: string;
    twinCX: string;
    expression: ts.Expression | null;
  }

  export interface NodeJSXDeclarator {
    readonly _tag: 'NodeJSXDeclarator';
    node: ts.Node;
    identifier: string;
    binding: ts.BindingName;
    filename: string;
  }

  export type TwinNode = NodeStyledProp | NodeJSXDeclarator;

  export type AnyJSXElement = ts.JsxElement | ts.JsxSelfClosingElement;
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
    state: {
      nodeToVisit: ts.Node[];
      jsxExpressions: {
        jsxElement: TwinDslModels.AnyJSXElement;
        declarator: ts.BindingName;
      }[];
      mutableGraph: MutableGraph;
    };
    buildGraph: () => TwinFileGraph;
    getNextNode: () => Effect.Effect<ts.Node, never, never>;
    getDepthBudgetFor: (node: ts.Node) => number;
    processJSXElementNode: (
      currentNode: ts.Node,
      currentDepthBudget: number,
    ) => Effect.Effect<void, never, never>;
    createJSXExpressionStacks: () => Map<ts.Node, JSXExpressionStack>;
    processIdentifierNode: (
      currentNode: ts.Node,
      currentDepthBudget: number,
      jsxStacks: Map<ts.Node, JSXExpressionStack>,
    ) => Effect.Effect<void, never, never>;
  }

  export interface NodeInfo {
    node: ts.Node;
    identifier: string;
    isRoot: boolean;
    index: number;
    mappedProps: TwinDslModels.NodeStyledProp[];
  }

  export type EdgeInfo =
    | { relationship: 'jsx'; index: number; isRoot: boolean }
    | { relationship: 'declarator' };

  export type TwinFileGraph = Graph.Graph<NodeInfo, EdgeInfo, 'directed'>;
  export type MutableGraph = Graph.MutableGraph<NodeInfo, EdgeInfo, 'directed'>;
}
