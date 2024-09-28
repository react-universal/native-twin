import * as Array from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import esbuild from 'esbuild';
import path from 'path';
import { CliConfigFile } from './esbuild.config';
import { requireResolvePlugin } from './plugins/requireResolve.plugin';

const externals = [
  // VSCODE
  'vscode',
  'monaco-editor',
  'vscode-languageserver-types',
  'vscode-languageserver-textdocument',
  'vscode-languageserver',
  'vscode-languageclient',

  // EXPO
  'expo',
  'babel-preset-expo',
  '@expo/*',

  // REACT_NATIVE
  'metro',
  'hermes-parser',
  'react-native',
  'react-native-web',
  '@babel/*',
  'react-native-reanimated',
  'lightningcss',
  '@testing-library/react-native',

  // REACT
  'react',
  'react-is',
  'react/jsx',
  'next',
  '@jest/globals',
  'jest',
  'expect',

  // NATIVE_TWIN
  '@native-twin/*',
  'sucrase',
  '@effect/*',
  'effect',
  'jiti',
  'jscodeshift',
];
const resolveExtensions = ['.ts', '.js', '.tsx', '.jsx', '.cjs', '.mjs'];
export function getEsbuildConfig(
  format: esbuild.BuildOptions['format'],
  config: CliConfigFile,
): esbuild.BuildOptions[] {
  const configs: esbuild.BuildOptions[] = [];
  const extraExternals = pipe([...externals, ...config.external], Array.dedupe);

  const sharedSettings: esbuild.BuildOptions = {
    entryPoints: config.entries,
    resolveExtensions,
    external: extraExternals,
    logLevel: config.logs ? 'info' : 'silent',
    minify: config.minify,
    sourcemap: true,
    color: true,
    bundle: true,
    entryNames: '[dir]/[name]',
    conditions: ['main', 'module', 'exports'],
    outdir: path.join(process.cwd(), `build/${format}`),
    outExtension: {
      '.js': format === 'cjs' ? '.cjs' : '.mjs',
    },
    mainFields: ['module', 'main', 'browser'],
    platform: config.platform,
    metafile: true,
    format,
    plugins: [requireResolvePlugin()],
  };

  configs.push(sharedSettings);
  if (config.reactNative) {
    configs.push({
      ...sharedSettings,
      resolveExtensions: [
        '.web.js',
        '.web.cjs',
        '.web.jsx',
        '.web.ts',
        '.web.tsx',
        '.web.mjs',
        ...resolveExtensions,
      ],
      entryNames: '[dir]/[name].web',
      format,
    });
  }

  return configs;
}
export function createEsbuildContext(...args: esbuild.BuildOptions[]) {
  return pipe(
    args,
    Array.map((x) => Effect.promise(() => esbuild.context(x))),
  );
}
