import * as Effect from 'effect/Effect';
import type { JsTransformOptions, JsTransformerConfig } from 'metro-transform-worker';
import fs from 'node:fs';
import path from 'path';
import {
  MetroCompilerContext,
  NativeTwinService,
} from '@native-twin/babel/jsx-babel/services';
import { babelRunnable } from '../src/transformer/babel.transformer';
import { TWIN_CACHE_DIR, TWIN_STYLES_FILE } from '../src/utils/constants';

export const createBabelTestCompilerProgram = (filePath: string) => {
  const params = {
    filename: filePath,
    src: fs.readFileSync(filePath).toString('utf-8'),
    options: {
      dev: true,
      hot: true,
      platform: 'ios',
      projectRoot: __dirname,
      type: 'source',
    },
  };
  return babelRunnable.pipe(
    Effect.provide(
      MetroCompilerContext.make(params, {
        componentID: true,
        order: true,
        styledProps: true,
        templateStyles: false,
        tree: false,
      }),
    ),
    Effect.provide(NativeTwinService.make(params.options)),
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
