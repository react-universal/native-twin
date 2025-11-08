import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Graph from 'effect/Graph';
import * as Layer from 'effect/Layer';
import ts from 'ts-morph';
import type { TwinGraphModel } from './TwinDsl.models';
import { TypescriptUtils } from './TypescriptUtils.service';
import { createTraversalContext } from './utils/graph.context';

const cache = new WeakMap<ts.SourceFile, TwinGraphModel.TwinFileGraph>();

const make = Effect.gen(function* () {
  const tsUtils = yield* TypescriptUtils;

  const convertToTwinGraph = (graph: TwinGraphModel.TwinFileGraph) => {
    // const dfs = Graph.dfs(graph, { startNodes: [graph.nodes.size - 1] });
    // // console.log('EDGES: ', graph.edges);
    // const ddd = dfs.visit((index, data) => {
    //   // console.log('iter', data)
    //   const outEdges = Graph.findEdges(graph, (_, source, target) => source === index);
    //   // const outEdges = Graph.neighborsDirected(graph, edge?.source ?? index, 'outgoing');
    //   console.log('OUT_EDGES____: ', outEdges, '___');
    //   return { index, outEdges: outEdges };
    // });
    console.log('components: ', Graph.stronglyConnectedComponents(graph));
    console.log('adjacency', graph.adjacency);
    // console.log(Array.from(ddd));
  };

  const extractSourceFileGraph = Effect.fn(function* (
    source: ts.SourceFile,
    followSymbolsDepth: number,
  ) {
    const context = yield* createTraversalContext(source, followSymbolsDepth, tsUtils);
    const cached = cache.get(source);
    if (cached) return { sourceGraph: cached };

    // Build lookup of JSX expressions with their children for quick reference
    const jsxExpressionStacks = context.createJSXExpressionStacks();

    // Process all nodes in the visitation queue
    while (context.state.nodeToVisit.length > 0) {
      const currentNode = yield* context.getNextNode();
      const currentDepthBudget = context.getDepthBudgetFor(currentNode)!;

      // Handle identifier nodes that may reference JSX expressions
      if (ts.Node.isIdentifier(currentNode)) {
        yield* context.processIdentifierNode(currentNode, currentDepthBudget, jsxExpressionStacks);
        continue;
      }

      // Handle JSX element and self-closing element nodes
      if (tsUtils.isJSXElementLike(currentNode)) {
        yield* context.processJSXElementNode(currentNode, currentDepthBudget);
      }
    }

    const sourceGraph = context.buildGraph();
    convertToTwinGraph(sourceGraph);
    cache.set(source, sourceGraph);
    return { sourceGraph };
  });

  return { extractSourceFileGraph };
});

export interface TwinGraph extends Effect.Effect.Success<typeof make> {}
export const TwinGraph = Context.GenericTag<TwinGraph>('TwinGraph');

export const TwinGraphLive = Layer.effect(TwinGraph, make);
