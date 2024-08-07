import * as NodeFileSystem from '@effect/platform-node-shared/NodeFileSystem';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import type { JsTransformOptions, JsTransformerConfig } from 'metro-transform-worker';
import fs from 'node:fs';
import path from 'path';
import { Project } from 'ts-morph';
import { createTailwind } from '@native-twin/core';
import { createVirtualSheet } from '@native-twin/css';
import { compileFileWithBabel } from '../src/compiler/babel.compiler';
import { TwinCompilerServiceLive } from '../src/compiler/models/compiler.model';
import { compileFile } from '../src/compiler/ts.compiler';
import { DocumentServiceLive } from '../src/document/Document.service';
import { StyleSheetServiceLive } from '../src/sheet/StyleSheet.service';
import {
  MetroTransformerContext,
  MetroTransformerServiceLive,
} from '../src/transformer/transformer.service';
import { TWIN_CACHE_DIR, TWIN_STYLES_FILE } from '../src/utils/constants';
import twConfig from './tailwind.config';

const MainLayer = Layer.mergeAll(
  Layer.merge(DocumentServiceLive, StyleSheetServiceLive).pipe(
    Layer.provide(NodeFileSystem.layer),
  ),
  MetroTransformerServiceLive,
  TwinCompilerServiceLive,
);

const tsCompiler = new Project({
  useInMemoryFileSystem: true,
});
const runnable = Effect.provide(compileFile, MainLayer);

export const createTestCompilerProgram = (filePath: string) => {
  const cssOutput = path.join(__dirname, TWIN_CACHE_DIR, TWIN_STYLES_FILE);
  const platform = 'ios';
  const twinConfig = twConfig;
  const twin = createTailwind(twConfig, createVirtualSheet());
  const allowedPaths = twinConfig.content.map((x) => path.join(__dirname, x));
  return runnable.pipe(
    Effect.provideService(MetroTransformerContext, {
      tsCompiler,
      config: {
        ...metroTestBaseConfig,
        allowedFiles: allowedPaths,
        outputDir: cssOutput,
        tailwindConfigPath: __dirname,
      },
      filename: filePath,
      options: testBaseTransformOptions,
      projectRoot: __dirname,
      cssOutput,
      fileType: 'script',
      isDev: true,
      platform,
      sourceCode: fs.readFileSync(filePath),
      twin: twin,
      twinConfig: twinConfig,
      allowedPaths,
    }),
    Effect.scoped,
    Effect.runPromise,
  );
};

const babelRunnable = Effect.provide(compileFileWithBabel, MainLayer);

export const createBabelTestCompilerProgram = (filePath: string) => {
  const cssOutput = path.join(__dirname, TWIN_CACHE_DIR, TWIN_STYLES_FILE);
  const platform = 'ios';
  const twinConfig = twConfig;
  const twin = createTailwind(twConfig, createVirtualSheet());
  const allowedPaths = twinConfig.content.map((x) => path.join(__dirname, x));
  return babelRunnable.pipe(
    Effect.provideService(MetroTransformerContext, {
      tsCompiler,
      config: {
        ...metroTestBaseConfig,
        allowedFiles: allowedPaths,
        outputDir: cssOutput,
        tailwindConfigPath: __dirname,
      },
      filename: filePath,
      options: testBaseTransformOptions,
      projectRoot: __dirname,
      cssOutput,
      fileType: 'script',
      isDev: true,
      platform,
      sourceCode: fs.readFileSync(filePath),
      twin: twin,
      twinConfig: twinConfig,
      allowedPaths,
    }),
    Effect.runPromise,
  );
};

const babelTransformerPath = require.resolve('@react-native/metro-babel-transformer');

export const metroTestBaseConfig: JsTransformerConfig = {
  unstable_collectDependenciesPath: '',
  allowOptionalDependencies: false,
  assetPlugins: [],
  assetRegistryPath: '',
  asyncRequireModulePath: 'asyncRequire',
  babelTransformerPath,
  dynamicDepsInPackages: 'reject',
  enableBabelRCLookup: false,
  enableBabelRuntime: true,
  globalPrefix: '',
  hermesParser: false,
  minifierConfig: { output: { comments: false } },
  minifierPath: 'minifyModulePath',
  optimizationSizeLimit: 100000,
  publicPath: '/assets',
  unstable_dependencyMapReservedName: undefined,
  unstable_compactOutput: false,
  unstable_disableModuleWrapping: false,
  unstable_disableNormalizePseudoGlobals: false,
  unstable_allowRequireContext: false,
};

export const testBaseTransformOptions: JsTransformOptions = {
  dev: true,
  hot: false,
  inlinePlatform: false,
  inlineRequires: false,
  minify: false,
  platform: 'ios',
  type: 'module',

  unstable_transformProfile: 'default',
};

export const jsxCodeOutputPath = path.join(__dirname, 'fixtures', 'jsx', 'ts-out.tsx');
export const metroCodeOutputPath = path.join(__dirname, 'fixtures', 'jsx', 'out.jsx');
export const twinFilePath = path.join(__dirname, TWIN_CACHE_DIR, TWIN_STYLES_FILE);
