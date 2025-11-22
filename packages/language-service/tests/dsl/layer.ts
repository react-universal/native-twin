import { Layer } from 'effect';
import path from 'path';
import ts from 'typescript';
import { JSXParserLive } from '../../src/core/JSXParser.service';
import { LSPConfig, parseLSPConfigInput } from '../../src/core/LanguageConfig.service';
import { TwinParserContextLive } from '../../src/core/TwinParser.service';
import { TwinRuntimeContextLive } from '../../src/core/TwinRuntime.service';
import { TypescriptUtilsLive } from '../../src/core/TypescriptUtils.service';
import { TwinGraph, TypescriptApi } from '../../src/TS';
import { createTwinLoggerLayerFor } from '../../src/utils/lsp.logger.service';

const testFolder = path.join(__dirname, '..');
export const testTSProgram = TypescriptApi.createCustomProgram(
  testFolder,
  path.join(testFolder, 'fixtures/react/tsconfig.json'),
);

export const TestLayer = Layer.empty.pipe(
  Layer.provideMerge(Layer.succeed(TypescriptApi.TypeScriptApi, ts)),
  Layer.provideMerge(Layer.succeed(TypescriptApi.TypeScriptProgram, testTSProgram.program)),
  Layer.provideMerge(TwinGraph.TwinGraphLive),
  Layer.provide(createTwinLoggerLayerFor('LSP')),
  Layer.provideMerge(JSXParserLive),
  Layer.provideMerge(TwinParserContextLive),
  Layer.provideMerge(TypescriptUtilsLive),
  Layer.provideMerge(
    Layer.succeed(
      LSPConfig,
      parseLSPConfigInput({
        tsConfigPath: path.join(testFolder, 'fixtures/react/tsconfig.json'),
        twinConfigPath: path.join(testFolder, 'fixtures/react/tailwind.config.ts'),
        configPath: path.join(testFolder, 'fixtures/react/tailwind.config.ts'),
        debug: true,
        enable: true,
        rootDir: path.join(testFolder, 'fixtures/react'),
      }),
    ),
  ),
  Layer.provide(TwinRuntimeContextLive),
);
