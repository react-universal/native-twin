import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Graph from 'effect/Graph';
import * as Layer from 'effect/Layer';
import * as Predicate from 'effect/Predicate';
import ts from 'ts-morph';
import type { TwinDslModels, TwinGraphModel } from '../models/TwinDsl.models';
import { JSXParser } from './JSXParser.service';
import { TypescriptUtils } from './TypescriptUtils.service';

const make = Effect.gen(function* () {
  const tsUtils = yield* TypescriptUtils;
  const jsxParser = yield* JSXParser;

  const extractSourceFileGraph = Effect.fn(function* (
    source: ts.SourceFile,
    followSymbolsDepth: number,
  ) {
    const context = yield* createTraversalContext(source, followSymbolsDepth, tsUtils, jsxParser);
    // const cached = cache.get(source);
    // if (cached) return { sourceGraph: cached };

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
    return { sourceGraph };
  });

  return { extractSourceFileGraph };
});

export interface TwinGraph extends Effect.Effect.Success<typeof make> {}
export const TwinGraph = Context.GenericTag<TwinGraph>('TwinGraph');

export const TwinGraphLive = Layer.effect(TwinGraph, make);

/**
 * Creates a traversal context that maintains state during graph visitation
 * Encapsulates node tracking, visitation queue, and graph mutations
 */
const createTraversalContext = Effect.fn(function* (
  source: ts.SourceFile,
  followSymbolsDepth: number,
  tsUtils: TypescriptUtils,
  jsxParser: JSXParser,
) {
  const mutableGraph = Graph.beginMutation(
    Graph.directed<TwinGraphModel.NodeInfo, TwinGraphModel.EdgeInfo>(),
  );
  // const tsUtils = yield* TypescriptUtils;

  // ==================== State Tracking ====================
  // Track which nodes have been visited to avoid reprocessing
  const visitedNodes = new WeakSet<ts.Node>();
  // Map nodes to their position in the JSX tree hierarchy
  const nodeInJSXTree = new WeakMap<ts.Node, Graph.NodeIndex>();
  // Map nodes to their corresponding graph indices
  const nodeToGraph = new WeakMap<ts.Node, Graph.NodeIndex>();
  // Track remaining depth budget for symbol following
  const depthBudget = new WeakMap<ts.Node, number>();
  // Queue of nodes pending visitation
  const nodeToVisit: Array<ts.Node> = [];

  // ==================== JSX Expression Discovery ====================
  // Extract all JSX expressions from source statements
  const statements = source.getStatements();
  const jsxExpressions = statements
    .map((_) => jsxParser.getJSXElementStatement(_))
    .filter((x) => !!x);

  // ==================== Debug & Introspection ====================
  const getNodeDetails = (node: ts.Node) => ({
    ...tsUtils.getNodeDebugDetails(node),
    nodeInJSXTree: nodeInJSXTree.get(node),
    nodeToGraph: nodeToGraph.get(node),
    visited: visitedNodes.has(node),
    depthBudget: depthBudget.get(node),
  });

  const debugStep = (stepName: string, node: ts.Node | undefined, data?: any) =>
    Effect.logDebug(
      stepName,
      JSON.stringify(node ? getNodeDetails(node) : { step: stepName, data }),
    );

  // ==================== Node Enqueueing ====================
  /**
   * Adds a node to the visitation queue with the given depth budget
   */
  const appendNodeToVisit = (node: ts.Node, nodeDepthBudget: number) => {
    depthBudget.set(node, nodeDepthBudget);
    nodeToVisit.push(node);
    return undefined;
  };

  // ==================== JSX Expression Lookup ====================
  /**
   * Finds the JSX binding information for a given declarator node
   */
  const getJSXBinding = (node: ts.Node) => jsxExpressions.find((x) => x.declarator === node);

  // ==================== Node Information Extraction ====================
  /**
   * Extracts metadata from a node for graph representation
   * Determines the display name based on parent context
   */
  const extractNodeInfo = (node: ts.Node): TwinGraphModel.NodeInfo => {
    const parent = node.getParent();
    const isRoot = (parent && !tsUtils.isJSXElementLike(parent)) ?? false;
    const { name, index } = tsUtils.getNodeDebugDetails(node);
    let mappedProps: TwinDslModels.NodeStyledProp[] = [];
    if (tsUtils.isJSXElementLike(node)) {
      mappedProps = jsxParser.getJSXMappedProps(node);
    }
    return { node, isRoot, identifier: name, mappedProps, index };
  };

  // ==================== Graph Operations ====================
  /**
   * Adds a node to the graph and tracks its mapping
   */
  const addNode = Effect.fn(function* (
    node: ts.Node,
    nodeInfo: TwinGraphModel.NodeInfo | null = null,
  ) {
    const graphNode = Graph.addNode(
      mutableGraph,
      nodeInfo ? nodeInfo : yield* Effect.succeed(extractNodeInfo(node)),
    );
    nodeToGraph.set(node, graphNode);
    yield* debugStep('ADDING_NODE: ', node);
    return graphNode;
  });

  /**
   * Marks a node as visited to prevent reprocessing
   */
  const markNodeAsVisited = Effect.fn(function* (node: ts.Node) {
    yield* Effect.sync(() => visitedNodes.add(node));
  });

  /**
   * Checks if a node has already been visited
   */
  const hasBeenVisited = (node: ts.Node) => visitedNodes.has(node);

  /**
   * Registers a node in the JSX hierarchy with its depth position
   */
  const addNodeInJSXRegistry = (node: ts.Node, currentDepthBudget: number) =>
    nodeInJSXTree.set(node, currentDepthBudget);

  // ==================== Initialization ====================
  // Initialize the visitation queue with all JSX expression declarators
  const cached = yield* Effect.cached(
    Effect.sync(() =>
      jsxExpressions.forEach((_) => {
        if (_.declarator) appendNodeToVisit(_.declarator, followSymbolsDepth);
      }),
    ),
  );
  yield* cached;

  // ==================== Queue Management ====================
  /**
   * Retrieves the depth budget allocated for a given node
   */
  const getDepthBudgetFor = (node: ts.Node) => depthBudget.get(node)!;

  /**
   * Retrieves the graph index for a given node, if it exists
   */
  const getNodeGraph = (node: ts.Node) => nodeToGraph.get(node);

  /**
   * Dequeues and returns the next node to process
   * Logs the visitation event for debugging
   */
  const getNextNode = Effect.fn(function* () {
    const nextNode = nodeToVisit.pop()!;

    if (visitedNodes.has(nextNode)) {
      yield* debugStep('LEAVING_VISITOR: ', nextNode);
      yield* debugStep('QUEUE', undefined, { size: nodeToVisit.length });
    } else {
      yield* debugStep('ENTER_VISITING:', nextNode);
    }
    return nextNode;
  });

  /**
   * Gets the child nodes of a given node, handling both JSX elements and bindings
   */
  const getNodeChildren = (node: ts.Node): ts.Node[] => {
    if (ts.Node.isJsxElement(node)) {
      return jsxParser.getJSXElementChilds(node);
    }
    const binding = getJSXBinding(node);
    if (binding) return [binding.jsxElement];
    return [];
  };

  // ==================== Edge Creation ====================
  /**
   * Adds an edge between two graph nodes with relationship metadata
   */
  const addEdge = Effect.fn(function* (from: number, to: number, data: TwinGraphModel.EdgeInfo) {
    yield* debugStep('Adding Edge:', undefined, { from, to, data });
    return Graph.addEdge(mutableGraph, from, to, data);
  });

  /**
   * Connects a JSX element to its child nodes in the graph
   * Validates that all expected children are present before creating connections
   */
  const connectJSXElementToChildren = Effect.fn(function* (
    elementNode: ts.Node,
    jsxChilds: ts.Node[],
  ) {
    // Get all JSX children that have been added to the graph
    const graphChildNodes = jsxChilds
      .map((_) => getNodeGraph(_))
      .filter(Predicate.isNumber)
      .filter((_) => Graph.hasNode(mutableGraph, _));

    // If all children are in the graph, create edges from element to children
    if (graphChildNodes.length === jsxChilds.length) {
      const graphNode = yield* addNode(elementNode);
      const childs = graphChildNodes.map((childIndex) =>
        addEdge(graphNode, childIndex, {
          relationship: 'jsx',
          index: elementNode.getChildIndex(),
          isRoot: false,
        }),
      );
      yield* Effect.all(childs);
    } else {
      // Not all children were added - clean up partial graph and create isolated node
      graphChildNodes.forEach((_) => void Graph.removeNode(mutableGraph, _));
      // yield* Effect.log('DELETING_GRAPH_NODES: ', graphChildNodes);

      const nodeInfo = extractNodeInfo(elementNode);
      yield* addNode(elementNode, nodeInfo);
    }
  });

  /**
   * Processes a JSX element node, handling both initial discovery and connection
   */
  const processJSXElementNode = Effect.fn(function* (
    currentNode: ts.Node,
    currentDepthBudget: number,
  ) {
    const jsxChilds = jsxParser.getJSXElementChilds(currentNode);

    // First visit: mark as visited and queue child elements
    if (!hasBeenVisited(currentNode)) {
      appendNodeToVisit(currentNode, currentDepthBudget);
      jsxChilds.forEach((child: ts.Node) => void appendNodeToVisit(child, currentDepthBudget));
      jsxChilds.forEach((child: ts.Node) => void addNodeInJSXRegistry(child, currentDepthBudget));
      yield* markNodeAsVisited(currentNode);
      return;
    }

    // Second visit: connect the element to its children in the graph
    yield* connectJSXElementToChildren(currentNode, jsxChilds);
  });

  /**
   * Creates a lookup of JSX expressions keyed by their binding identifier
   * This avoids repeated array searches during node visitation
   */
  const createJSXExpressionStacks = (): Map<ts.Node, TwinGraphModel.JSXExpressionStack> => {
    const stackMap = new Map<ts.Node, TwinGraphModel.JSXExpressionStack>();

    for (const expression of jsxExpressions) {
      const binding = expression.declarator!;
      const declarator = binding && tsUtils.getVariableNameExpression(binding);
      const childNodes = getNodeChildren(expression.jsxElement);

      const stack: TwinGraphModel.JSXExpressionStack = {
        binding,
        declarator,
        root: expression.jsxElement,
        childs: childNodes,
      };

      if (binding) {
        stackMap.set(binding, stack);
      }
    }

    return stackMap;
  };

  /**
   * Processes an identifier node that may reference a JSX expression
   * Handles both initial discovery and connection of graph nodes
   */
  const processIdentifierNode = Effect.fn(function* (
    currentNode: ts.Node,
    currentDepthBudget: number,
    jsxStacks: Map<ts.Node, TwinGraphModel.JSXExpressionStack>,
  ) {
    const stack = jsxStacks.get(currentNode);
    if (!stack) return;

    // First visit: mark as visited and queue the root element
    if (!hasBeenVisited(currentNode)) {
      appendNodeToVisit(currentNode, currentDepthBudget);
      appendNodeToVisit(stack.root, currentDepthBudget);
      addNodeInJSXRegistry(stack.root, currentDepthBudget + 1);
      yield* markNodeAsVisited(currentNode);
      return;
    }

    // Second visit: connect the identifier to its JSX element in the graph
    yield* connectIdentifierToJSXElement(currentNode, stack);
  });

  /**
   * Connects an identifier node to its JSX element children in the graph
   * Validates that all expected children are present before creating connections
   */
  const connectIdentifierToJSXElement = Effect.fn(function* (
    identifierNode: ts.Node,
    stack: TwinGraphModel.JSXExpressionStack,
  ) {
    const registeredIdent = getNodeGraph(identifierNode);

    // Get all JSX children that have been added to the graph
    const graphChildNodes = [stack.root]
      .map((_) => getNodeGraph(_))
      .filter(Predicate.isNumber)
      .filter((_) => Graph.hasNode(mutableGraph, _));

    // If all children are in the graph, create edges from identifier to children
    if (graphChildNodes.length + 1 === stack.childs.length) {
      const graphNode = yield* addNode(identifierNode);
      yield* Effect.all(
        graphChildNodes.map((childIndex) =>
          addEdge(graphNode, childIndex, { relationship: 'declarator' }),
        ),
        { concurrency: 'inherit', mode: 'default', batching: 'inherit' },
      );
    } else {
      // Not all children were added - clean up partial graph and create isolated node
      graphChildNodes.forEach((_) => void Graph.removeNode(mutableGraph, _));
      yield* Effect.log('DELETING_GRAPH_NODES: ', graphChildNodes);

      const nodeInfo = extractNodeInfo(identifierNode);
      const nodeGraph = yield* addNode(identifierNode, nodeInfo);
      if (registeredIdent) {
        yield* addEdge(nodeGraph, registeredIdent, { relationship: 'declarator' });
      }
    }
  });

  const buildGraph = () => Graph.endMutation(mutableGraph);

  // ==================== Context Export ====================
  // Return public API for node processing operations
  return {
    state: { nodeToVisit, jsxExpressions, mutableGraph },
    buildGraph,
    getNextNode,
    getDepthBudgetFor,
    processJSXElementNode,
    createJSXExpressionStacks,
    processIdentifierNode,
  };
});

const convertToTwinGraph = (_graph: TwinGraphModel.TwinFileGraph) => {
  // const dfs = Graph.dfs(graph, { startNodes: [graph.nodes.size - 1] });
  // // console.log('EDGES: ', graph.edges);
  // const ddd = dfs.visit((index, data) => {
  //   // console.log('iter', data)
  //   const outEdges = Graph.findEdges(graph, (_, source, target) => source === index);
  //   // const outEdges = Graph.neighborsDirected(graph, edge?.source ?? index, 'outgoing');
  //   console.log('OUT_EDGES____: ', outEdges, '___');
  //   return { index, outEdges: outEdges };
  // });
  // console.log('components: ', Graph.stronglyConnectedComponents(graph));
  // console.log('adjacency', graph.adjacency);
  // console.log(Array.from(ddd));
};
