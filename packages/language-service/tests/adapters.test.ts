/** @effect-diagnostics multipleEffectProvide:skip-file */
import path from 'node:path';
import { inspect } from 'node:util';
import { describe, expect, it } from '@effect/vitest';
import { Effect, Graph, Layer } from 'effect';
import {
  LSPAdapterSpec,
  LSPConfig,
  LSPDocumentsCtx,
  TwinGraphosContext,
  TwinGraphosContextLive,
  TwinRuntimeContext,
  TwinRuntimeContextLive,
} from '../src';
import { BabelLSPAdapterLive } from '../src/adapters/Babel/Babel.adapter';
import { makeTwinGraph } from '../src/core/TwinProject.service';
import { lspConfigMock } from './dsl';
import { LSPDocumentsCtxMock } from './dsl/adapter.mock';

describe('Twin LSP adapters', () => {
  it.effect('Babel adapter', () => {
    return Effect.gen(function* () {
      const graphos = yield* TwinGraphosContext;
      const graphCtx = yield* makeTwinGraph;
      const adapter = yield* LSPAdapterSpec;
      const twin = yield* TwinRuntimeContext;

      const twinPath = path.join(__dirname, 'fixtures/react', 'tailwind.config.ts');
      yield* twin.bootTwinRuntime(twinPath);
      const ComponentPath = path.join(__dirname, 'fixtures/react', 'Component.tsx');

      const document = yield* adapter.getLSPDocument(ComponentPath);

      expect(document.regions.length).toBeGreaterThan(0);

      const lspTree = graphos.lspRegionsToTree(
        document.regions.filter((x) => x._tag === 'JSXNode'),
      );
      const grapho = graphos.lspTreeToGraph(lspTree);

      const traversedGr = graphCtx.traverseGraph(grapho);
      expect(traversedGr.length).toBeGreaterThan(0);
      expect(lspTree.root.childrenCount).toBeGreaterThan(0);
      const grr = yield* graphCtx.createSourceGraph(document.regions);
      const pst = Graph.dfs(grr, { start: [0], direction: 'outgoing' });
      const rs = pst.visit((i, data) => {
        return '-'.padStart(i, ' ').concat(data.tagName);
      });

      console.log(Array.from(rs).reverse().join('\n'));

      const graphViz1 = Graph.toGraphViz(grapho, {
        edgeLabel: (data) => inspect(data),
        graphName: 'Regions',
        nodeLabel: (node) =>
          `${node.tagName} - ${inspect(
            {
              range: document.getNodeRange(node.nodeRegion),
              name: node.tagName,
            },
            false,
            null,
          )}`,
      });

      yield* Effect.promise(() =>
        expect(graphViz1).toMatchFileSnapshot(
          path.join(__dirname, '__snapshots__', 'twin-babel.map.dot'),
        ),
      );
      return {};
    }).pipe(
      Effect.provide(BabelLSPAdapterLive),
      Effect.provide(Layer.effect(LSPDocumentsCtx, LSPDocumentsCtxMock)),
      Effect.provide(TwinGraphosContextLive),
      Effect.provide(TwinRuntimeContextLive),
      Effect.provide(Layer.effect(LSPConfig, lspConfigMock)),
    );
  });
});
