import { readFileSync } from 'fs';
import type { JsTransformOptions, JsTransformerConfig } from 'metro-transform-worker';
import fs from 'node:fs';
import path from 'path';
import { twinShift } from '../src/babel/twin.shift';
import { transform } from '../src/transformer/metro.transformer';

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
describe('Metro transformer', () => {
  it('metro', async () => {
    const result = await transform(
      { ...baseConfig, projectRoot: path.join(process.cwd()) } as any,
      path.join(__dirname),
      'fixtures/out.tsx',
      readFileSync(path.join(__dirname, 'fixtures/jsx', 'code.tsx')),
      { ...baseTransformOptions, type: 'script' },
    );
    expect(result.output).toBeDefined();
  });

  it('typescript', async () => {
    const result = await twinShift(
      'fixtures/code.tsx',
      readFileSync(path.join(__dirname, 'fixtures/jsx', 'code.tsx'), 'utf-8'),
    );
    fs.writeFileSync(jsxCodeOutputPath, result.full ?? 'ERROR');
    expect(result.code).toBeDefined();
  });
});
