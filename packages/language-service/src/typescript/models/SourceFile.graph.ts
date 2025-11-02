import * as Effect from 'effect/Effect';
import * as Graph from 'effect/Graph';
import type * as ts from 'ts-morph';
import * as TypescriptApi from '../TypescriptApi';

export namespace TwinGraph {
  export interface ImportInfo {
    from: string;
    node: ts.Node;
  }
  export interface NodeInfo {
    node: ts.Node;
    displayNode: ts.Node;
    kindName: string;
    type: ts.Type;
    imported:
      | undefined
      | {
          from: string;
          node: ts.Node;
        };
  }

  export type EdgeInfo =
    | { relationship: 'jsx'; index: number; isRoot: boolean }
    | { relationship: 'import' }
    | { relationship: 'export' };

  export type Graph = Graph.Graph<NodeInfo, EdgeInfo, 'directed'>;
}

export const extractSourceFileGraph = Effect.fn(function* (
  source: ts.SourceFile,
  followSymbolsDepth: number,
) {
  const tsApi = yield* TypescriptApi.TypescriptApi;
  const fileInfo = tsApi.extractSourceInfo(source);

  const visitedNodes = new WeakSet<ts.Node>();
  const nodeWithJSXTree = new WeakSet<ts.Node>();
  const nodeToGraph = new WeakMap<ts.Node, Graph.NodeIndex>();
  const depthBudget = new WeakMap<ts.Node, number>();

  const nodeToVisit: Array<ts.Node> = [];
  const appendNodeToVisit = (node: ts.Node, nodeDepthBudget: number) => {
    depthBudget.set(node, nodeDepthBudget);
    nodeToVisit.push(node);
    return undefined;
  };

  appendNodeToVisit(source, followSymbolsDepth);

  const mutableGraph = Graph.beginMutation(
    Graph.directed<TwinGraph.NodeInfo, TwinGraph.EdgeInfo>(),
  );

  

  return yield* Effect.succeed({
    fileInfo,
  });
});

