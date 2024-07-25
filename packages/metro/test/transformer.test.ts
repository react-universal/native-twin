import type {
  JsTransformOptions,
  JsTransformerConfig,
  JsOutput,
} from 'metro-transform-worker';
import fs from 'node:fs';
import path from 'path';
import { createTailwind } from '@native-twin/core';
import { createVirtualSheet } from '@native-twin/css';
import { twinShift } from '../src/babel/twin.shift';
import { transform } from '../src/transformer/metro.transformer';
import { TWIN_CACHE_DIR, TWIN_STYLES_FILE } from '../src/utils/constants';
import { createCacheDir } from '../src/utils/file.utils';
import twConfig from './tailwind.config';

const babelTransformerPath = require.resolve('@react-native/metro-babel-transformer');

const baseConfig: JsTransformerConfig = {
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

const baseTransformOptions: JsTransformOptions = {
  dev: true,
  hot: false,
  inlinePlatform: false,
  inlineRequires: false,
  minify: false,
  platform: 'ios',
  type: 'module',

  unstable_transformProfile: 'default',
};

const jsxCodeOutputPath = path.join(__dirname, 'fixtures', 'jsx', 'ts-out.tsx');
const metroCodeOutputPath = path.join(__dirname, 'fixtures', 'jsx', 'out.jsx');
const twinFilePath = path.join(__dirname, TWIN_CACHE_DIR, TWIN_STYLES_FILE);

beforeAll(() => {
  console.log('ROOT: ', path.join(__dirname));
  createCacheDir(__dirname);
  fs.writeFileSync(twinFilePath, '');
});

describe('Metro transformer', () => {
  it('metro', async () => {
    const result = await transform(
      { ...baseConfig, projectRoot: path.join(__dirname) } as any,
      path.join(__dirname),
      'fixtures/out.tsx',
      fs.readFileSync(path.join(__dirname, 'fixtures/jsx', 'code.tsx')),
      { ...baseTransformOptions, type: 'script' },
    );

    const code =
      (result.output as JsOutput[])
        .map((x: JsOutput): string => x.data.code)
        .join('\n') ?? 'ERROR';

    fs.writeFileSync(metroCodeOutputPath, code);
    expect(code).toBeDefined();
  });

  it('typescript', async () => {
    const twin = createTailwind(twConfig, createVirtualSheet());
    const result = await twinShift(
      'fixtures/code.tsx',
      fs.readFileSync(path.join(__dirname, 'fixtures/jsx', 'code.tsx'), 'utf-8'),
      twin,
    );
    fs.writeFileSync(jsxCodeOutputPath, result.full ?? 'ERROR');
    expect(result.code).toBeDefined();
  });
});
