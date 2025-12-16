import { describe, expect, it } from '@effect/vitest';
import { setup } from '@native-twin/core';
import { createVirtualSheet } from '@native-twin/css';
import { Graph, Logger, LogLevel } from 'effect';
import * as Effect from 'effect/Effect';
import { readFileSync } from 'fs';
import path from 'path';
import { inspect } from 'util';
import {
  JSXParser,
  LSPAdapterSpec,
  TwinGraphosContext,
  TwinRuntimeContext,
  TypeScriptProgram,
} from '../src';
import { makeTwinGraph } from '../src/core/TwinProject.service';
import { TestLayer } from './dsl';
import twinConfig from './fixtures/react/tailwind.config';

setup(twinConfig, createVirtualSheet());

describe('Twin LSP API', () => {
  it.effect('Draw graph for parsedFiles', () =>
    Effect.gen(function* () {
      const graphos = yield* TwinGraphosContext;
      const graphCtx = yield* makeTwinGraph;
      const tsParser = yield* JSXParser;
      const program = yield* TypeScriptProgram;
      const twin = yield* TwinRuntimeContext;
      const adapter = yield* LSPAdapterSpec;
      const twinPath = path.join(__dirname, 'fixtures/react', 'tailwind.config.ts');
      yield* twin.bootTwinRuntime(twinPath);

      const ComponentPath = path.join(__dirname, 'fixtures/react', 'Component.tsx');
      const tsSource = yield* program.getSourceFile(
        ComponentPath,
        readFileSync(ComponentPath, 'utf-8'),
      );
      const jsxRoots = tsParser.getJSXRootsFromSource(tsSource);
      const regions = tsParser.jsxNodesToRegions(jsxRoots);
      const document = yield* adapter.getLSPDocument(ComponentPath);
      // const regions = yield* adapter.getRegions(ComponentPath);
      const lspTree = graphos.lspRegionsToTree(regions);
      const grapho = graphos.lspTreeToGraph(lspTree);

      const traversedGr = graphCtx.traverseGraph(grapho);
      expect(traversedGr.length).toBeGreaterThan(0);
      expect(lspTree.root.childrenCount).toBeGreaterThan(0);

      const graphViz1 = Graph.toGraphViz(grapho, {
        edgeLabel: (data) => inspect(data),
        graphName: 'Regions',
        nodeLabel: (node) =>
          `${node.tagName} - ${inspect(document.getNodeRange(node.nodeRegion), false, null)}`,
      });

      yield* Effect.promise(() =>
        expect(graphViz1).toMatchFileSnapshot(
          path.join(__dirname, '__snapshots__', 'twin-tree.map.dot'),
        ),
      );

      const sourceGraph = yield* graphCtx.createSourceGraph(regions);

      const traversed = graphCtx.traverseGraph(sourceGraph);

      console.log(traversed);

      expect(traversed.length).toBeGreaterThan(0);

      const graphViz = Graph.toGraphViz(sourceGraph, {
        edgeLabel: (data) => inspect(data, { colors: false, depth: null, breakLength: Infinity }),
        graphName: 'Regions',
        nodeLabel: (node) =>
          `${node.tagName} - ${inspect({ name: node.tagName, id: node.id, info: node.nodeRegion.attributes.map((x) => x.value.text), range: document.getNodeRange(node.nodeRegion) }, { colors: false, depth: null, breakLength: 80 })}`,
      });

      yield* Effect.promise(() =>
        expect(graphViz).toMatchFileSnapshot(path.join(__dirname, '__snapshots__', 'regions.dot')),
      );
      expect(sourceGraph.nodes.size > 0).toBeDefined();
    }).pipe(Logger.withMinimumLogLevel(LogLevel.Info), Effect.provide(TestLayer)),
  );
  // it.effect('vscode adapter completions', () =>
  //   Effect.gen(function* () {
  //     const adapter = yield* LSPAdapterSpec;
  //     const cursorOffset = 189;
  //     const twin = yield* TwinRuntimeContext;
  //     yield* twin.bootTwinRuntime(path.join(__dirname, 'fixtures/react', 'tailwind.config.ts'));

  //     const ComponentPath = path.join(__dirname, 'fixtures/react', 'Component.tsx');
  //     const document = yield* adapter.getLSPDocument(ComponentPath);
  //     const cursorPosition = document.positionAt(cursorOffset);
  //     const regions = yield* adapter.getRegions(ComponentPath);

  //     expect(regions.length).toBeGreaterThan(0);

  //     const region = document.findRegionAt(cursorPosition);
  //     if (!region) throw expect(region).toBeDefined();

  //     const completions = yield* languagePrograms.getCompletionsAtPosition.apply(
  //       ComponentPath,
  //       cursorPosition,
  //     );

  //     if (Array.isArray(completions)) {
  //       expect(completions.length).toBeGreaterThan(2);
  //     } else {
  //       expect(completions).toBeInstanceOf(Array);
  //     }
  //     expect(region).toBeDefined();
  //   }).pipe(Logger.withMinimumLogLevel(LogLevel.All), Effect.provide(TestLayer)),
  // );
});
