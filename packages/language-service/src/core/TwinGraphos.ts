import * as Tree from '@native-twin/helpers/tree';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Graph from 'effect/Graph';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import { type JsxNodeRegion, SourceEdgeInfo, SourceNodeInfo } from '../models/LSP.models';
import { annotatedLayer } from '../utils/effect.utils';

const make = Effect.gen(function* () {
  return {
    lspRegionsToTree,
    lspTreeToGraph,
  };

  function lspTreeToGraph(tree: Tree.Tree<JsxNodeRegion>) {
    const mutableGraph = Graph.beginMutation(Graph.directed<SourceNodeInfo, SourceEdgeInfo>());
    const registeredNodes = new WeakMap<JsxNodeRegion, number>();
    tree.traverse((node) => {
      const { parent, value } = node;
      const info = new SourceNodeInfo({
        id: value.id,
        nodeRegion: value,
        tagName: value.tagName.rawText,
      });

      if (!parent) {
        const registeredChilds = node.children
          .map((x) => registeredNodes.get(x.value))
          .filter(Predicate.isNumber)
          .filter((_) => Graph.hasNode(mutableGraph, _));
        const graphNode = Graph.addNode(mutableGraph, info);

        for (const childGraph of registeredChilds) {
          const childNode = Graph.getNode(mutableGraph, childGraph).pipe(Option.getOrThrow);
          Graph.addEdge(
            mutableGraph,
            graphNode,
            childGraph,
            new SourceEdgeInfo({
              relationship: 'jsx-child',
              index: registeredChilds.indexOf(childGraph),
              isRoot: childNode.nodeRegion.parent === null,
              nodeText: `${graphNode}:${value.tagName.rawText} -> ${childGraph}:${childNode.tagName}`,
            }),
          );
        }
        registeredNodes.set(value, graphNode);
        return;
      }

      const registeredChilds = node.children
        .map((x) => registeredNodes.get(x.value))
        .filter(Predicate.isNumber)
        .filter((_) => Graph.hasNode(mutableGraph, _));
      const graphNode = Graph.addNode(mutableGraph, info);

      registeredNodes.set(value, graphNode);
      for (const childGraph of registeredChilds) {
        const childNode = Graph.getNode(mutableGraph, childGraph).pipe(Option.getOrThrow);
        Graph.addEdge(
          mutableGraph,
          graphNode,
          childGraph,
          new SourceEdgeInfo({
            relationship: 'jsx-child',
            index: registeredChilds.indexOf(childGraph),
            isRoot: childNode.nodeRegion.parent === null,
            nodeText: `${graphNode}:${value.tagName.rawText} -> ${childGraph}:${childNode.tagName}`,
          }),
        );
      }
    }, 'postOrder');

    return Graph.endMutation(mutableGraph);
  }

  function lspRegionsToTree(regions: JsxNodeRegion[]) {
    return Tree.makeTreeFrom({
      input: regions.find((x) => x.parent === null)!,
      getChilds: (item) => regions.filter((region) => region.parent?.id === item.id),
      transform: (item) => item,
    });
  }
});

export interface TwinGraphosContext extends Effect.Effect.Success<typeof make> {}
export const TwinGraphosContext = Context.GenericTag<TwinGraphosContext>('TwinGraphosContext');
export const TwinGraphosContextLive = Layer.effect(TwinGraphosContext, make).pipe(
  annotatedLayer('TwinGraphos'),
);
