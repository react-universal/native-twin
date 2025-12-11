import { describe, expect, it } from '@effect/vitest';
import { setup } from '@native-twin/core';
import { createVirtualSheet } from '@native-twin/css';
import { Graph, Logger, LogLevel } from 'effect';
import * as Effect from 'effect/Effect';
import path from 'path';
import { inspect } from 'util';
import { LSPAdapterSpec } from '../src';
import { TwinRuntimeContext } from '../src/browser';
import { makeTwinGraph } from '../src/core/TwinProject.service';
import { TestLayer } from './dsl';
import twinConfig from './fixtures/react/tailwind.config';

setup(twinConfig, createVirtualSheet());

describe('Twin LSP API', () => {
  it.effect('Draw graph for parsedFiles', () =>
    Effect.gen(function* () {
      const graphCtx = yield* makeTwinGraph;
      const adapter = yield* LSPAdapterSpec;
      const twin = yield* TwinRuntimeContext;
      yield* twin.bootTwinRuntime(path.join(__dirname, 'fixtures/react', 'tailwind.config.ts'));

      const ComponentPath = path.join(__dirname, 'fixtures/react', 'Component.tsx');
      const document = yield* adapter.getLSPDocument(ComponentPath);
      const regions = yield* adapter.getRegions(ComponentPath);

      const sourceGraph = yield* graphCtx.createSourceGraph(
        document,
        regions.filter((x) => x._tag === 'JsxNodeRegion'),
      );

      const graphViz = Graph.toGraphViz(sourceGraph, {
        edgeLabel: (data) => inspect(data),
        graphName: 'Regions',
        nodeLabel: (node) => node.id,
      });

      yield* Effect.promise(() =>
        expect(graphViz).toMatchFileSnapshot(path.join(__dirname, '__snapshots__', 'regions.dot')),
      );
      expect(sourceGraph.nodes.size > 0).toBeDefined();
    }).pipe(Logger.withMinimumLogLevel(LogLevel.All), Effect.provide(TestLayer)),
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
