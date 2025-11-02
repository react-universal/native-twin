import { Predicate } from 'effect';
import * as Effect from 'effect/Effect';
import * as Graph from 'effect/Graph';
import * as ts from 'ts-morph';
import * as TypescriptApi from '../TypescriptApi';

export interface TwinGraphNodeInfo {
  node: ts.Node;
  displayNode: ts.Node;
  childs: ts.JsxElement[];
}

export type TwinGraphEdgeInfo =
  | {
      relationship: 'call';
      argumentIndex: number;
    }
  | {
      relationship: 'pipe';
    }
  | {
      relationship: 'arrayLiteral';
      index: number;
    }
  | {
      relationship: 'symbol';
    };

export type LayerGraph = Graph.Graph<TwinGraphNodeInfo, TwinGraphEdgeInfo, 'directed'>;

export const makeTwinGraph = Effect.fn('twinSourceGraph')(function* (
  node: ts.Node,
  opts: { followSymbolsDepth: number },
) {
  const tsApi = yield* TypescriptApi.TypescriptApi;

  const visitedNodes = new WeakSet<ts.Node>();
  const nodeWithJSXParent = new WeakSet<ts.Node>();
  const nodeToGraph = new WeakMap<ts.Node, Graph.NodeIndex>();
  const depthBudget = new WeakMap<ts.Node, number>();

  // const sourceFile = node.getSourceFile();
  // const nodePosition = tsApi.getNodeOffset(node);
  // const { character, line } = ts.ts.getLineAndCharacterOfPosition(sourceFile as any, nodePosition);

  // do a DFS search to find all the token nodes and wire them up properly
  const nodeToVisit: Array<ts.Node> = [];
  const appendNodeToVisit = (node: ts.Node, nodeDepthBudget: number) => {
    depthBudget.set(node, nodeDepthBudget);
    nodeToVisit.push(node);
    return undefined;
  };
  appendNodeToVisit(node, opts.followSymbolsDepth);

  const mutableGraph = Graph.beginMutation(Graph.directed<TwinGraphNodeInfo, TwinGraphEdgeInfo>());

  const extractNodeInfo = Effect.fn('extractNodeInfo')(function* (node: ts.Node) {
    const childs: Array<ts.JsxElement> = [];

    // for the display node, we want to use the name of the variable declaration if the node is the initializer
    let displayNode: ts.Node = node;
    const parent = node.getParent();
    if (parent && parent.isKind(ts.SyntaxKind.VariableDeclaration)) {
      const initializer = parent.getInitializer();
      if (initializer && initializer !== node) {
        displayNode = parent.getNameNode();
      }
    }
    if (node.isKind(ts.SyntaxKind.JsxElement)) {
      childs.concat(node.getJsxChildren().filter((x) => x.isKind(ts.SyntaxKind.JsxElement)));
    }

    return yield* Effect.succeed<TwinGraphNodeInfo>({ childs, displayNode, node });
  });

  const addNode = Effect.fn('addNode')(function* (node: ts.Node, nodeInfo?: TwinGraphNodeInfo) {
    const graphNode = Graph.addNode(
      mutableGraph,
      nodeInfo ? nodeInfo : yield* extractNodeInfo(node),
    );
    nodeToGraph.set(node, graphNode);
    return graphNode;
  });

  const isSimpleIdentifier = (
    node: ts.Node,
  ): node is ts.Identifier | ts.PropertyAccessExpression => {
    return (
      node.isKind(ts.SyntaxKind.Identifier) ||
      (node.isKind(ts.SyntaxKind.PropertyAccessExpression) &&
        node.getNameNode().isKind(ts.SyntaxKind.Identifier) &&
        isSimpleIdentifier(node.getExpression()))
    );
  };

  const getAdjustedNode = (node: ts.Node) =>
    node.isKind(ts.SyntaxKind.PropertyDeclaration) || node.isKind(ts.SyntaxKind.VariableDeclaration)
      ? node.getInitializer()
      : ts.ts.isExpression(node.compilerNode)
        ? node
        : undefined;

  while (nodeToVisit.length > 0) {
    const node = nodeToVisit.pop()!;
    const currentDepthBudget = depthBudget.get(node)!;
    if (!node.isKind(ts.SyntaxKind.JsxElement)) {
      if (visitedNodes.has(node)) continue;

      appendNodeToVisit(node, currentDepthBudget);
      const childs = node.getChildren();
      childs.forEach((_) => void appendNodeToVisit(_, currentDepthBudget));
      childs.forEach((_) => void nodeWithJSXParent.add(_));
      visitedNodes.add(node);
      continue;
    }

    const childs = node.getJsxChildren();

    if (!visitedNodes.has(node)) {
      unvisitedJSXElement(node, childs, currentDepthBudget);
    } else {
      yield* visitedJSXElement(node, childs);
    }
  }

  return Graph.endMutation(mutableGraph);

  function unvisitedJSXElement(
    node: ts.JsxElement,
    childs: ts.JsxChild[],
    currentDepthBudget: number,
  ) {
    appendNodeToVisit(node, currentDepthBudget);
    childs.forEach((_) => void appendNodeToVisit(_, currentDepthBudget));
    childs.forEach((_) => void nodeWithJSXParent.add(_));
    visitedNodes.add(node);
  }
  function visitedJSXElement(node: ts.JsxElement, childs: ts.JsxChild[]) {
    return Effect.gen(function* () {
      const childNodes = childs
        .map((_) => nodeToGraph.get(_))
        .filter(Predicate.isNumber)
        .filter((_) => Graph.hasNode(mutableGraph, _));
      if (childNodes.length === childs.length + 1) {
        // every member are just graph nodes, so we can link them up (always in reverse order!!)
        let lastNode: number | null = null;
        for (const childNode of childNodes) {
          if (lastNode !== null) {
            Graph.addEdge(mutableGraph, childNode, lastNode, { relationship: 'pipe' });
          }
          lastNode = childNode;
          if (lastNode !== null) {
            // now we have the last link which conform the pipe graph
            const graphNode = yield* addNode(node);
            Graph.addEdge(mutableGraph, graphNode, lastNode, { relationship: 'pipe' });
          }
        }
      } else {
        // nor every member is a graph node, remove nodes
        childNodes.forEach((_) => void Graph.removeNode(mutableGraph, _));
        const nodeInfo = yield* extractNodeInfo(node);
        if (nodeInfo.childs.length > 0) yield* addNode(node, nodeInfo);
      }
    });
  }
});

