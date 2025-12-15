import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Graph from 'effect/Graph';
import * as Iterable from 'effect/Iterable';
import * as Option from 'effect/Option';
import * as Order from 'effect/Order';
import * as Predicate from 'effect/Predicate';
import { inspect } from 'util';
import { LSPAdapterUtils } from '../internal/LSPAdapterSpec';
import {
  GraphState,
  type JsxNodeRegion,
  SourceEdgeInfo,
  SourceNodeInfo,
} from '../models/LSP.models';

const JSXRegionOrd = Order.mapInput(Order.number, (_: JsxNodeRegion) => _.range.start.character);

export const makeTwinGraph = Effect.gen(function* () {
  const traverseGraph = (graph: Graph.Graph<SourceNodeInfo, SourceEdgeInfo>) => {
    const handler = new GraphState(graph);

    const data = handler.dfs.visit((nodeIndex, _sourceInfo) => handler.visitNodeIndex(nodeIndex));
    const final = Iterable.reduce(data, '', (acc, current) => {
      let body = '';
      if (current.endText.length > 0) {
        body = body
          .concat(current.padStart)
          .concat(current.startText)
          .concat('\n')
          .concat(current.padStart)
          .concat(acc)
          .concat('\n')
          .concat(current.padStart)
          .concat(current.endText);
      } else {
        body = body.concat(current.startText).concat(acc);
      }
      return body;
    });
    return final;
  };

  const createSourceGraph = Effect.fn(function* (elements: JsxNodeRegion[]) {
    const context = yield* createTraversalContext(elements);

    while (context.state.nodeToVisit.length > 0) {
      const currentNode = yield* context.getNextNode();
      const currentDepthBudget = yield* context.getDepthBudgetFor(currentNode)!;
      yield* context.processJSXElementNode(currentNode, currentDepthBudget);
    }

    yield* Effect.sync(() => Graph.reverse(context.state.mutableGraph));
    return Graph.endMutation(context.state.mutableGraph);
  });

  return { createSourceGraph, traverseGraph };
}).pipe(Effect.provide(LSPAdapterUtils.Default));

const createTraversalContext = Effect.fn(function* (source: JsxNodeRegion[]) {
  // const lspUtils = yield* LSPAdapterUtils;
  const mutableGraph = Graph.beginMutation(Graph.directed<SourceNodeInfo, SourceEdgeInfo>());

  // ==================== State Tracking ====================
  // Track which nodes have been visited to avoid reprocessing
  const visitedNodes = new WeakSet<JsxNodeRegion>();
  // // Map nodes to their position in the JSX tree hierarchy
  const nodeInJSXTree = new WeakMap<JsxNodeRegion, Graph.NodeIndex>();
  // Map nodes to their corresponding graph indices
  const nodeGraphIndex = new WeakMap<JsxNodeRegion, Graph.NodeIndex>();
  // Track remaining depth budget for symbol following
  const depthBudget = new WeakMap<JsxNodeRegion, number>();
  // Queue of nodes pending visitation
  const nodeToVisit: JsxNodeRegion[] = [];

  const createStacked = (source: JsxNodeRegion[]) => {
    const lookup = new Map<string, { id: string; childs: JsxNodeRegion[]; isRoot: boolean }>();
    for (const nextRegion of source.filter((x) => x.parent === null)) {
      const childs = RA.sort(
        source.filter((x) => x.parent?.id === nextRegion.id),
        JSXRegionOrd,
      );

      lookup.set(nextRegion.id, { id: nextRegion.id, childs, isRoot: nextRegion.parent === null });
    }
    return lookup;
  };

  const regionsLookup = createStacked(source);

  // ==================== Node Enqueueing ====================
  /**
   * Adds a node to the visitation queue with the given depth budget
   */
  const appendNodeToVisit = (node: JsxNodeRegion, nodeDepthBudget: number) => {
    depthBudget.set(node, nodeDepthBudget);
    nodeToVisit.push(node);
    return undefined;
  };

  // ==================== Initialization ====================
  // Initialize the visitation queue with all JSX expression declarators
  const cached = yield* Effect.cached(
    Effect.sync(() =>
      source.forEach((_) => {
        if (_.parent === null) appendNodeToVisit(_, 0);
      }),
    ),
  );
  yield* cached;

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
      nodeInfo ? nodeInfo : yield* Effect.succeed(createSourceInfo(node)),
    );
    nodeGraphIndex.set(node, graphNode);
    yield* Effect.void.pipe(debugStepTapped('ADDED_NODE: ', node));
    return graphNode;
  });

  /**
   * Marks a node as visited to prevent reprocessing
   */
  const markNodeAsVisited = (node: JsxNodeRegion) =>
    Effect.succeed(visitedNodes.add(node)).pipe(debugStepTapped('MARK_VISITED: ', node));

  const hasBeenVisited = (node: JsxNodeRegion) => visitedNodes.has(node);

  const getNodeChilds = (node: JsxNodeRegion) => {
    const region = regionsLookup.get(node.id);
    if (!region) {
      return RA.sort(
        source.filter((region) => region.parent?.id === node.id),
        JSXRegionOrd,
      );
    }
    return region.childs;
  };
  /**
   * Registers a node in the JSX hierarchy with its depth position
   */
  const addNodeInJSXRegistry = (node: JsxNodeRegion, currentDepthBudget: number) =>
    nodeInJSXTree.set(node, currentDepthBudget);

  // ==================== Queue Management ====================
  /**
   * Retrieves the depth budget allocated for a given node
   */
  const getDepthBudgetFor = (node: JsxNodeRegion) => Effect.sync(() => depthBudget.get(node)!);

  /**
   * Retrieves the graph index for a given node, if it exists
   */
  const getNodeGraph = (node: JsxNodeRegion) => nodeGraphIndex.get(node);

  /**
   * Dequeues and returns the next node to process
   * Logs the visitation event for debugging
   */
  const getNextNode = Effect.fn(function* () {
    const nextNode = nodeToVisit.pop()!;

    if (visitedNodes.has(nextNode)) {
      yield* Effect.void.pipe(
        debugStepTapped('LEAVING_VISITOR: ', nextNode),
        debugStepTapped('QUEUE', undefined, { size: nodeToVisit.length }),
      );
    } else {
      yield* Effect.void.pipe(debugStepTapped('ENTER_VISITING:', nextNode));
    }
    return nextNode;
  });

  /**
   * Connects a JSX element to its child nodes in the graph
   * Validates that all expected children are present before creating connections
   */
  const connectJSXElementToChildren = Effect.fn(function* (
    elementNode: JsxNodeRegion,
    jsxChilds: JsxNodeRegion[],
  ) {
    const graphNodes = jsxChilds
      .map((_) => getNodeGraph(_))
      .filter(Predicate.isNumber)
      .filter((_) => Graph.hasNode(mutableGraph, _));

    if (jsxChilds.length === graphNodes.length) {
      const parentIndex = yield* addNode(elementNode);

      for (const childGraph of graphNodes) {
        const childNode = Graph.getNode(mutableGraph, childGraph).pipe(Option.getOrNull);
        if (!childNode) {
          yield* Effect.void.pipe(
            debugStepTapped(
              'ABSURD: childs must be defined at this point (concurrency issue ?)',
              undefined,
              childNode,
            ),
          );
          return;
        }
        Graph.addEdge(
          mutableGraph,
          parentIndex,
          childGraph,
          new SourceEdgeInfo({
            relationship: 'jsx-child',
            index: graphNodes.indexOf(childGraph),
            isRoot: childNode.nodeRegion.parent === null,
            nodeText: `${parentIndex}:${elementNode.tagName.rawText} -> ${childGraph}:${childNode.tagName}`,
          }),
        );
      }
      return;
    }

    graphNodes.forEach((child) => void Graph.removeNode(mutableGraph, child));
    yield* addNode(elementNode, createSourceInfo(elementNode));
  });

  /**
   * Processes a JSX element node, handling both initial discovery and connection
   */
  const processJSXElementNode = Effect.fn(function* (
    currentNode: JsxNodeRegion,
    currentDepthBudget: number,
  ) {
    const stack = regionsLookup.get(currentNode.id);

    const jsxChilds = stack?.childs ?? getNodeChilds(currentNode);

    if (!hasBeenVisited(currentNode)) {
      appendNodeToVisit(currentNode, currentDepthBudget);
      // addNodeInJSXRegistry(currentNode, currentDepthBudget);
      if (jsxChilds.length > 0) {
        jsxChilds.forEach((child) => void appendNodeToVisit(child, currentDepthBudget + 1));
        jsxChilds.forEach((child) => void addNodeInJSXRegistry(child, currentDepthBudget + 1));
        yield* Effect.void.pipe(
          debugStepTapped('ADDED_CHILDS FOR: ', currentNode),
          debugStepTapped(
            'CHILDS: ',
            undefined,
            jsxChilds.map((x) => getNodeDetails(x)),
          ),
        );
      }
      yield* markNodeAsVisited(currentNode);
      return;
    } else {
      yield* connectJSXElementToChildren(currentNode, jsxChilds);
    }
  });

  const getNodeDetails = (node: JsxNodeRegion) => ({
    id: node.id,
    tagName: node.tagName.rawText,
    props: node.styledProps.map((x) => x.rawText),
    nodeInJSXTree: nodeInJSXTree.get(node),
    nodeToGraph: nodeGraphIndex.get(node),
    visited: visitedNodes.has(node),
    depthBudget: depthBudget.get(node),
  });

  const debugStepTapped =
    (stepName: string, node: JsxNodeRegion | undefined, data?: any) =>
    <A, E = never>(effect: Effect.Effect<A, E>) =>
      Effect.tap(effect, () =>
        Effect.logDebug(
          stepName,
          inspect(node ? getNodeDetails(node) : { step: stepName, data }, false, null, true),
        ),
      );

  const createSourceInfo = (nodeRegion: JsxNodeRegion) =>
    new SourceNodeInfo({
      id: nodeRegion.id,
      tagName: nodeRegion.tagName.rawText,
      nodeRegion,
    });

  // ==================== Context Export ====================
  // Return public API for node processing operations
  return {
    state: { nodeToVisit, mutableGraph },
    getNextNode,
    getDepthBudgetFor,
    processJSXElementNode,
  };
});
 