import { Effect, Layer, SubscriptionRef } from 'effect';
import fs from 'fs';
import path from 'path';
import ts from 'ts-morph';
import {
  createTwinLoggerLayerFor,
  JSXParserLive,
  LSPConfig,
  parseLSPConfigInput,
  type TwinConfigOptions,
  TwinGraphLive,
  TwinGraphosContextLive,
  TwinParserContextLive,
  TwinRuntimeContextLive,
  TypeScriptApi,
  TypeScriptProgram,
  TypescriptUtilsLive,
} from '../../src';
import { TypescriptParser } from '../../src/Typescript/TypescriptParser';
import { TestVscodeLSPAdapterLive } from './adapter.mock';
import { requireESM } from './load-esm';

const testFolder = path.join(__dirname, '..');

const TsProgramLive = Effect.gen(function* () {
  const { project, program } = createCustomProgram(
    path.join(testFolder, 'fixtures/react/tsconfig.json'),
  );
  const programRef = yield* SubscriptionRef.make(program);

  return TypeScriptProgram.of({
    project,
    getSourceFile: Effect.fn(function* (filename) {
      yield* programRef.get;
      const sourceFile = project.getSourceFile(filename);
      if (!sourceFile) {
        const newFile = project.createSourceFile(filename, fs.readFileSync(filename, 'utf-8'));
        return newFile;
      }
      return sourceFile;
    }),
  });
}).pipe(Layer.effect(TypeScriptProgram));

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
    loadTwinConfig: (twinConfig) => Effect.promise(() => requireESM(twinConfig)),
    config,
    onChangeConfig,
    configSelector: (selector) => config.get.pipe(Effect.map(selector)),
  });
});

export const TestLayer = Layer.empty.pipe(
  Layer.provideMerge(Layer.succeed(TypeScriptApi, ts)),
  Layer.provideMerge(TestVscodeLSPAdapterLive),
  Layer.provideMerge(TypescriptParser),
  Layer.provideMerge(TsProgramLive),
  Layer.provideMerge(TwinGraphLive),
  Layer.provideMerge(JSXParserLive),
  Layer.provideMerge(TwinParserContextLive),
  Layer.provideMerge(TypescriptUtilsLive),
  Layer.provideMerge(TwinRuntimeContextLive),
  Layer.provideMerge(Layer.effect(LSPConfig, lspConfig)),
  Layer.provideMerge(TwinGraphosContextLive),
  Layer.provide(createTwinLoggerLayerFor('LSP')),
);

export const createCustomProgram = (tsConfigPath: string) => {
  const tsConfig = ts.getCompilerOptionsFromTsConfig(tsConfigPath, {
    encoding: 'utf-8',
  });
  if (!tsConfig || tsConfig?.errors.length > 0) {
    throw new Error('');
  }
  const compilerOptions = tsConfig.options;
  const project = new ts.Project({
    compilerOptions,
    useInMemoryFileSystem: true,
  });
  const program = project.getProgram();
  const host = project.getModuleResolutionHost();

  return { host, program, project };
};
