import * as Effect from 'effect/Effect';
import * as Graph from 'effect/Graph';
import * as Predicate from 'effect/Predicate';
import ts from 'ts-morph';
import type { TwinDslModels } from './models/TwinDsl.models';
import { TypescriptUtils } from './TypescriptUtils.service';

export const extractSourceFileGraph = Effect.fn(function* (
  source: ts.SourceFile,
  followSymbolsDepth: number,
) {
  const tsUtils = yield* TypescriptUtils;
  const mutableGraph = Graph.beginMutation(
    Graph.directed<TwinDslModels.NodeInfo, TwinDslModels.EdgeInfo>(),
  );
  const context = yield* createTraversalContext(source, mutableGraph, followSymbolsDepth);

  const getCurrentNodeChilds = (node: ts.Node) => {
    if (ts.Node.isJsxElement(node)) {
      return tsUtils.getJSXElementChilds(node);
    }
    const binding = context.getJSXBinding(node);
    if (binding) return [binding.jsxElement];
    return [];
  };

  const stacks = context.state.jsxExpressions.flatMap((expression) => {
    const binding = expression.declarator;
    const declarator = binding && tsUtils.getVariableNameExpression(binding);
    return [
      {
        binding,
        declarator,
        root: expression.jsxElement,
        childs: getCurrentNodeChilds(expression.jsxElement),
      },
    ];
  });

  while (context.state.nodeToVisit.length > 0) {
    const currentNode = yield* context.getNextNode();
    const currentDepthBudget = context.getDepthBudgetFor(currentNode)!;

    if (ts.Node.isIdentifier(currentNode)) {
      const stack = stacks.find((x) => x.binding === currentNode);

      if (stack) {
        if (!context.hasBeenVisited(currentNode)) {
          context.appendNodeToVisit(currentNode, currentDepthBudget);
          context.appendNodeToVisit(stack.root, currentDepthBudget);
          context.addNodeInJSXRegistry(stack.root, currentDepthBudget + 1);
          yield* context.markNodeAsVisited(currentNode);
        } else {
          const registeredIdent = context.getNodeGraph(currentNode);
          const childNodes = [stack.root]
            .map((_) => context.getNodeGraph(_))
            .filter(Predicate.isNumber)
            .filter((_) => Graph.hasNode(mutableGraph, _));

          if (childNodes.length + 1 === stack.childs.length) {
            // const lastNodeEdge = yield* addEdgesForJSXElement(currentNode, childNodes);
            const graphNode = yield* context.addNode(currentNode);
            yield* Effect.all(
              childNodes.map((x) => context.addEdge(graphNode, x, { relationship: 'declarator' })),
              { concurrency: 'inherit', mode: 'default', batching: 'inherit' },
            );
          } else {
            // not every member is a graph node, remove the nodes
            childNodes.forEach((_) => void Graph.removeNode(mutableGraph, _));
            yield* Effect.log('DELETING_GRAPH_NODES: ', childNodes);
            // and if I return a layer, add a node for it
            const nodeInfo = context.extractNodeInfo(currentNode);
            const nodeGraph = yield* context.addNode(currentNode, nodeInfo);
            if (registeredIdent) {
              yield* context.addEdge(nodeGraph, registeredIdent, {
                relationship: 'declarator',
              });
            }
          }
        }
      }
      continue;
    }

    if (ts.Node.isJsxElement(currentNode) || ts.Node.isJsxSelfClosingElement(currentNode)) {
      // yield* Effect.log('DEPS: ', inspect(debugable, false, null, true));
      // yield* Effect.log('DEPS222: ', inspect(debugable2, false, null, true), '\n\n');
      // const stacked = stacks.find((x) => x.root === currentNode);
      // const backedNode = stacked?.root ?? currentNode;
      const jsxChilds = getCurrentNodeChilds(currentNode);
      if (!context.hasBeenVisited(currentNode)) {
        context.appendNodeToVisit(currentNode, currentDepthBudget);
        // context.addNodeInJSXRegistry(currentNode, currentDepthBudget);
        jsxChilds.forEach((_) => void context.appendNodeToVisit(_, currentDepthBudget));
        jsxChilds.forEach((_) => void context.addNodeInJSXRegistry(_, currentDepthBudget));
        yield* context.markNodeAsVisited(currentNode);
      } else {
        const childNodes = jsxChilds
          .map((_) => context.getNodeGraph(_))
          .filter(Predicate.isNumber)
          .filter((_) => Graph.hasNode(mutableGraph, _));

        if (childNodes.length === jsxChilds.length) {
          // All members candidates to edges
          const graphNode = yield* context.addNode(currentNode);
          yield* Effect.all(
            childNodes.map((x) =>
              context.addEdge(graphNode, x, {
                relationship: 'jsx',
                index: currentNode.getChildIndex(),
                isRoot: false,
              }),
            ),
            { concurrency: 'inherit', mode: 'default', batching: 'inherit' },
          );
          // const lastNodeEdge = yield* addEdgesForJSXElement(currentNode, childNodes);
          // yield* Effect.log('LAST_EDGE_ADDED: ', lastNodeEdge);
        } else {
          // not every member is a graph node, remove the nodes
          childNodes.forEach((_) => void Graph.removeNode(mutableGraph, _));
          yield* Effect.log('DELETING_GRAPH_NODES: ', childNodes);
          // // and if I return a layer, add a node for it
          const nodeInfo = context.extractNodeInfo(currentNode);
          yield* context.addNode(currentNode, nodeInfo);
        }
        // not every member is a graph node, remove the nodes
        // jsxChilds.forEach((_) => void Graph.removeNode(mutableGraph, _));
        // yield* Effect.log('DELETING_GRAPH_NODES: ', childNodes);
        // and if I return a layer, add a node for it
        // const nodeInfo = context.extractNodeInfo(currentNode);
        // yield* context.addNode(currentNode, nodeInfo);
      }
    }
  }
  const sourceGraph = Graph.endMutation(mutableGraph);

  return { sourceGraph };
});

const createTraversalContext = Effect.fn(function* (
  source: ts.SourceFile,
  mutableGraph: TwinDslModels.MutableGraph,
  followSymbolsDepth: number,
) {
  const tsUtils = yield* TypescriptUtils;
  const visitedNodes = new WeakSet<ts.Node>();
  const nodeInJSXTree = new WeakMap<ts.Node, Graph.NodeIndex>();
  const nodeToGraph = new WeakMap<ts.Node, Graph.NodeIndex>();
  const depthBudget = new WeakMap<ts.Node, number>();
  const nodeToVisit: Array<ts.Node> = [];

  const statements = source.getStatements();
  const jsxExpressions = statements
    .map((_) => tsUtils.getJSXElementStatement(_))
    .filter((x) => !!x);

  const getNodeDetails = (node: ts.Node) => ({
    ...tsUtils.getNodeDebugDetails(node),
    nodeInJSXTree: nodeInJSXTree.get(node),
    nodeToGraph: nodeToGraph.get(node),
    visited: visitedNodes.has(node),
    depthBudget: depthBudget.get(node),
  });

  const debugStep = (stepName: string, node: ts.Node | undefined, data?: any) =>
    Effect.logDebug(stepName, JSON.stringify(node ? getNodeDetails(node) : { step: stepName, data }));

  const appendNodeToVisit = (node: ts.Node, nodeDepthBudget: number) => {
    depthBudget.set(node, nodeDepthBudget);
    nodeToVisit.push(node);
    return undefined;
  };

  const getJSXBinding = (node: ts.Node) => jsxExpressions.find((x) => x.declarator === node);

  const extractNodeInfo = (node: ts.Node) => {
    let displayNode: ts.Node = node;

    const parent = node.getParent();
    if (parent && ts.Node.isVariableDeclaration(parent)) {
      displayNode = parent.getNameNode();
    }

    const nodeGraph: TwinDslModels.NodeInfo = {
      node,
      displayNode: displayNode,
      declarator: displayNode,
    };

    return nodeGraph;
  };

  const addNode = Effect.fn(function* (
    node: ts.Node,
    nodeInfo: TwinDslModels.NodeInfo | null = null,
  ) {
    const graphNode = Graph.addNode(
      mutableGraph,
      nodeInfo ? nodeInfo : yield* Effect.succeed(extractNodeInfo(node)),
    );
    nodeToGraph.set(node, graphNode);
    yield* debugStep('ADDING_NODE: ', node);
    return graphNode;
  });

  const markNodeAsVisited = (node: ts.Node) => {
    visitedNodes.add(node);
    return Effect.void;
  };
  const hasBeenVisited = (node: ts.Node) => visitedNodes.has(node);
  const addNodeInJSXRegistry = (node: ts.Node, currentDepthBudget: number) =>
    nodeInJSXTree.set(node, currentDepthBudget);

  const cached = yield* Effect.cached(
    Effect.sync(() =>
      jsxExpressions.forEach((_) => {
        if (_.declarator) appendNodeToVisit(_.declarator, followSymbolsDepth);
      }),
    ),
  );
  yield* cached;

  const getDepthBudgetFor = (node: ts.Node) => depthBudget.get(node)!;
  const getNodeGraph = (node: ts.Node) => nodeToGraph.get(node);
  const getNextNode = () =>
    Effect.gen(function* () {
      const nextNode = nodeToVisit.pop()!;

      if (visitedNodes.has(nextNode)) {
        yield* debugStep('LEAVING_VISITOR: ', nextNode);
        yield* debugStep('QUEUE', undefined, { size: nodeToVisit.length });
      } else {
        yield* debugStep('ENTER_VISITING:', nextNode);
      }
      return nextNode;
    });

  const addEdge = Effect.fn(function* (from: number, to: number, data: TwinDslModels.EdgeInfo) {
    yield* debugStep('Adding Edge:', undefined, { from, to, data });
    return Graph.addEdge(mutableGraph, from, to, data);
  });

  yield* Effect.log(
    'IMPORT_DECLS',
    source.getImportDeclarations().map((x) => x.getText()),
  );

  return {
    state: { nodeToVisit, jsxExpressions },
    addEdge,
    getNextNode,
    getNodeGraph,
    getDepthBudgetFor,
    addNodeInJSXRegistry,
    hasBeenVisited,
    markNodeAsVisited,
    extractNodeInfo,
    getJSXBinding,
    appendNodeToVisit,
    addNode,
  };
});
