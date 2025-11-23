import { Effect, Layer, SubscriptionRef } from 'effect';
import path from 'path';
import ts from 'typescript';
import type { TwinConfigOptions } from '../../src';
import { JSXParserLive } from '../../src/core/JSXParser.service';
import { LSPConfig, parseLSPConfigInput } from '../../src/core/LSPConfig.service';
import { TwinParserContextLive } from '../../src/core/TwinParser.service';
import { TwinRuntimeContextLive } from '../../src/core/TwinRuntime.service';
import { TypescriptUtilsLive } from '../../src/core/TypescriptUtils.service';
import { TwinGraph, TypescriptApi } from '../../src/TS';
import { createTwinLoggerLayerFor } from '../../src/utils/lsp.logger.service';

const testFolder = path.join(__dirname, '..');
const testTSProgram = TypescriptApi.createCustomProgram(
  testFolder,
  path.join(testFolder, 'fixtures/react/tsconfig.json'),
);

const TsProgramLive = Effect.gen(function* () {
  // const files: ts.MapLike<{ version: number }> = {};
  const programRef = yield* SubscriptionRef.make(testTSProgram.program);

  return TypescriptApi.TypeScriptProgram.of({
    getSourceFile: Effect.fn(function* (filename) {
      const program = yield* programRef.get;
      return program.getSourceFile(filename)!;
    }),
    // languageServiceRef,
    // programRef,
  });
}).pipe(Layer.effect(TypescriptApi.TypeScriptProgram));

const lspConfig = Effect.gen(function* () {
  const config = yield* SubscriptionRef.make(
    parseLSPConfigInput({
      tsConfigPath: path.join(testFolder, 'fixtures/react/tsconfig.json'),
      twinConfigPath: path.join(testFolder, 'fixtures/react/tailwind.config.ts'),
      debug: true,
      enable: true,
      rootDir: path.join(testFolder, 'fixtures/react'),
    }),
  );

  const onChangeConfig = (newConfig: TwinConfigOptions) => SubscriptionRef.set(config, newConfig);

  return LSPConfig.of({
    config,
    onChangeConfig,
    configSelector: (selector) => config.get.pipe(Effect.map(selector)),
  });
});

export const TestLayer = Layer.empty.pipe(
  Layer.provideMerge(Layer.succeed(TypescriptApi.TypeScriptApi, ts)),
  Layer.provideMerge(TsProgramLive),
  Layer.provideMerge(TwinGraph.TwinGraphLive),
  Layer.provide(createTwinLoggerLayerFor('LSP')),
  Layer.provideMerge(JSXParserLive),
  Layer.provideMerge(TwinParserContextLive),
  Layer.provideMerge(TypescriptUtilsLive),
  Layer.provideMerge(Layer.effect(LSPConfig, lspConfig)),
  Layer.provide(TwinRuntimeContextLive),
);
