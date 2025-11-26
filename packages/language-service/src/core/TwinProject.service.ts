import { inspect } from 'node:util';
import * as Effect from 'effect/Effect';
import * as Graph from 'effect/Graph';
import * as Predicate from 'effect/Predicate';
import type t from 'vscode-languageserver-types';
import type { JsxNodeRegion } from '../internal/LSPAdapterSpec';
import type { TwinLSPDocument } from './TwinLSPDocument.model';

export const make = Effect.gen(function* () {
  // const jsxParser = yield* JSXParser;
  // const store = yield* Ref.make(new Map<string, TwinLSPDocument>());

  const createSourceGraph = (document: TwinLSPDocument, element: JsxNodeRegion) =>
    Effect.gen(function* () {
      const context = yield* createTraversalContext(element, document);
      yield* Effect.void;

      while (context.state.nodeToVisit.length > 0) {
        const currentNode = yield* context.getNextNode();
        const currentDepthBudget = context.getDepthBudgetFor(currentNode)!;
        context.processJSXElementNode(currentNode, currentDepthBudget);
      }

      const sourceGraph = context.buildGraph();
      return sourceGraph;
    });

  return {
    createSourceGraph,
  };
});

interface SourceNodeInfo {
  id: string;
  location: t.Location;
}
interface SourceEdgeInfo {
  relationship: 'jsx-child';
  index: number;
  isRoot: boolean;
}

const createTraversalContext = Effect.fn(function* (
  source: JsxNodeRegion,
  document: TwinLSPDocument,
) {
  yield* Effect.void;
  const mutableGraph = Graph.beginMutation(Graph.directed<SourceNodeInfo, SourceEdgeInfo>());

  // ==================== State Tracking ====================
  // Track which nodes have been visited to avoid reprocessing
  const visitedNodes = new WeakSet<JsxNodeRegion>();
  // Map nodes to their position in the JSX tree hierarchy
  const nodeInJSXTree = new WeakMap<JsxNodeRegion, Graph.NodeIndex>();
  // Map nodes to their corresponding graph indices
  const nodeToGraph = new WeakMap<JsxNodeRegion, Graph.NodeIndex>();
  // Track remaining depth budget for symbol following
  const depthBudget = new WeakMap<JsxNodeRegion, number>();
  // Queue of nodes pending visitation
  const nodeToVisit: JsxNodeRegion[] = [source];

  const getNodeDetails = (node: JsxNodeRegion) => {
    return { id: node._tag };
  };

  const debugStep = (stepName: string, node: JsxNodeRegion | undefined, data?: any) =>
    Effect.logDebug(
      stepName,
      inspect(node ? getNodeDetails(node) : { step: stepName, data }, {
        colors: true,
        depth: null,
        showHidden: false,
        getters: true,
        sorted: true,
      }),
    );

  // const getNodeInfo = (node: JsxNodeRegion): SourceNodeInfo => {
  //   return { id: node.id };
  // };

  // ==================== Node Enqueueing ====================
  /**
   * Adds a node to the visitation queue with the given depth budget
   */
  const appendNodeToVisit = (node: JsxNodeRegion, nodeDepthBudget: number) => {
    depthBudget.set(node, nodeDepthBudget);
    nodeToVisit.push(node);
    return undefined;
  };

  // ==================== Node Information Extraction ====================
  /**
   * Extracts metadata from a node for graph representation
   * Determines the display name based on parent context
   */
  const extractNodeInfo = (node: JsxNodeRegion): SourceNodeInfo => {
    // const parent = node.getParent();
    // const isRoot = (parent && !tsUtils.isJSXElementLike(parent)) ?? false;
    // const { name, index } = tsUtils.getNodeDebugDetails(node);
    // let mappedProps: TwinDslModels.NodeStyledProp[] = [];
    // if (tsUtils.isJSXElementLike(node)) {
    //   mappedProps = jsxParser.getJSXMappedProps(node);
    // }
    // return { node, isRoot, identifier: name, mappedProps, index };
    return {
      id: node.tagName._tag,
      location: document.getLocation(node.range),
    };
  };

  // ==================== Graph Operations ====================
  /**
   * Adds a node to the graph and tracks its mapping
   */
  const addNode = Effect.fn(function* (
    node: JsxNodeRegion,
    nodeInfo: SourceNodeInfo | null = null,
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
  const markNodeAsVisited = Effect.fn(function* (node: JsxNodeRegion) {
    yield* Effect.sync(() => visitedNodes.add(node));
  });

  const hasBeenVisited = (node: JsxNodeRegion) => visitedNodes.has(node);

  /**
   * Registers a node in the JSX hierarchy with its depth position
   */
  const addNodeInJSXRegistry = (node: JsxNodeRegion, currentDepthBudget: number) =>
    nodeInJSXTree.set(node, currentDepthBudget);

  // ==================== Queue Management ====================
  /**
   * Retrieves the depth budget allocated for a given node
   */
  const getDepthBudgetFor = (node: JsxNodeRegion) => depthBudget.get(node)!;

  /**
   * Retrieves the graph index for a given node, if it exists
   */
  const getNodeGraph = (node: JsxNodeRegion) => nodeToGraph.get(node);

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

  // ==================== Edge Creation ====================
  /**
   * Adds an edge between two graph nodes with relationship metadata
   */
  const addEdge = Effect.fn(function* (from: number, to: number, data: SourceEdgeInfo) {
    yield* debugStep('Adding Edge:', undefined, { from, to, data });
    return Graph.addEdge(mutableGraph, from, to, data);
  });

  /**
   * Connects a JSX element to its child nodes in the graph
   * Validates that all expected children are present before creating connections
   */
  const connectJSXElementToChildren = Effect.fn(function* (
    elementNode: JsxNodeRegion,
    jsxChilds: JsxNodeRegion[],
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
          relationship: 'jsx-child',
          index: graphNode,
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
    currentNode: JsxNodeRegion,
    currentDepthBudget: number,
  ) {
    const jsxChilds = [] as any;

    // First visit: mark as visited and queue child elements
    if (!hasBeenVisited(currentNode)) {
      appendNodeToVisit(currentNode, currentDepthBudget);
      jsxChilds.forEach(
        (child: JsxNodeRegion) => void appendNodeToVisit(child, currentDepthBudget),
      );
      jsxChilds.forEach(
        (child: JsxNodeRegion) => void addNodeInJSXRegistry(child, currentDepthBudget),
      );
      yield* markNodeAsVisited(currentNode);
      return;
    }

    // Second visit: connect the element to its children in the graph
    yield* connectJSXElementToChildren(currentNode, jsxChilds);
  });

  // const createJSXExpressionStacks = (): Map<JsxNodeRegion, TwinGraphModel.JSXExpressionStack> => {
  //   const stackMap = new Map<JsxNodeRegion, TwinGraphModel.JSXExpressionStack>();

  //   for (const expression of jsxExpressions) {
  //     const binding = expression.declarator!;
  //     const declarator = binding && tsUtils.getVariableNameExpression(binding);
  //     const childNodes = getNodeChildren(expression.jsxElement);

  //     const stack: TwinGraphModel.JSXExpressionStack = {
  //       binding,
  //       declarator,
  //       root: expression.jsxElement,
  //       childs: childNodes,
  //     };

  //     if (binding) {
  //       stackMap.set(binding, stack);
  //     }
  //   }

  //   return stackMap;
  // };

  /**
   * Processes an identifier node that may reference a JSX expression
   * Handles both initial discovery and connection of graph nodes
   */
  const processIdentifierNode = Effect.fn(function* (
    currentNode: JsxNodeRegion,
    currentDepthBudget: number,
    jsxStacks: Map<JsxNodeRegion, any>,
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
    identifierNode: JsxNodeRegion,
    stack: any,
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
          addEdge(graphNode, childIndex, {
            relationship: 'jsx-child',
            index: graphNode,
            isRoot: false,
          }),
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
        yield* addEdge(nodeGraph, registeredIdent, {
          relationship: 'jsx-child',
          index: nodeGraph,
          isRoot: false,
        });
      }
    }
  });

  const buildGraph = () => Graph.endMutation(mutableGraph);

  // ==================== Context Export ====================
  // Return public API for node processing operations
  return {
    state: { nodeToVisit, mutableGraph },
    buildGraph,
    getNextNode,
    // getNodeGraph,
    getDepthBudgetFor,
    // addNodeInJSXRegistry,
    // hasBeenVisited,
    // markNodeAsVisited,
    // extractNodeInfo,
    // getJSXBinding,
    // appendNodeToVisit,
    // addNode,
    processJSXElementNode,
    processIdentifierNode,
  };
});
