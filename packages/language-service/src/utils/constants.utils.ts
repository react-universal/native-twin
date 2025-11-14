import type { RuleMeta } from '@native-twin/core';
import type { DocumentSelector } from 'vscode-languageserver-protocol';
import type { InternalTwinConfig } from '../models/twin/native-twin.types.js';

export const DOCUMENT_SELECTORS = [
  {
    scheme: 'file',
    language: 'typescript',
  },
  {
    scheme: 'file',
    language: 'typescriptreact',
  },
  {
    scheme: 'file',
    language: 'javascript',
  },
  {
    scheme: 'file',
    language: 'javascriptreact',
  },
] satisfies DocumentSelector;
export const configurationSection = 'nativeTwin';

export const DEFAULT_RULE_META: RuleMeta = {
  canBeNegative: false,
  feature: 'default',
  prefix: '',
  styleProperty: undefined,
  suffix: '',
  support: [],
};

export const DEFAULT_TWIN_CONFIG = {
  content: [],
  theme: {},
  darkMode: 'class',
  ignorelist: [],
  mode: 'native',
  preflight: {},
  root: {
    rem: 16,
  },
  rules: [],
  variants: [],
  animations: [],
} as InternalTwinConfig;

// TODO: Moved to compiler
export const DEFAULT_PLUGIN_CONFIG = {
  jsxAttributes: ['tw', 'class', 'className', 'variants'],
  functions: ['tw', 'apply', 'css', 'variants', 'style', 'styled', 'createVariants'],
  debug: false,
  enable: true,
  configPath: 'tailwind.config.ts',
  trace: {
    server: 'off',
  } as const,
};

export const twinCommonFiles = ['tailwind.config.ts', 'twin.config.ts'];

/** @type {import('ts-morph').CompilerOptions} */
export const TSCompilerDefaultOptions = {
  declaration: true,
  sourceMap: true,
  declarationMap: true,
  emitDecoratorMetadata: true,
  experimentalDecorators: true,
  noEmitOnError: true,
  downlevelIteration: true,
  removeComments: false,
  // ts.JsxEmit.ReactNative
  jsx: 3,
  // ts.ModuleKind.ESNext
  module: 99,
  // ts.ScriptTarget.ES2022
  target: 9,
  // ts.ModuleResolutionKind.Node10
  moduleResolution: 2,
  lib: ['lib.es2022.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
  // ts.ModuleDetectionKind.Force
  moduleDetection: 3,
  esModuleInterop: false,
  stripInternal: false,
  types: ['node', 'react-native', 'jest'],
  skipLibCheck: true,
  skipDefaultLibCheck: true,
  allowSyntheticDefaultImports: true,
  resolveJsonModule: true,
  allowJs: false,
  checkJs: false,
  strict: true,
  strictFunctionTypes: true,
  noFallthroughCasesInSwitch: true,
  noPropertyAccessFromIndexSignature: true,
  strictNullChecks: true,
  noUncheckedIndexedAccess: false,
  alwaysStrict: true,
  forceConsistentCasingInFileNames: true,
  allowUnreachableCode: false,
  noImplicitReturns: false,
  exactOptionalPropertyTypes: false,
  noImplicitAny: true,
  noImplicitThis: true,
  noImplicitOverride: false,
  noErrorTruncation: false,
  noUnusedParameters: false,
  noUnusedLocals: true,
  isolatedModules: false,
  outDir: './build/esm',
  declarationDir: './build/dts',
};

export type NativeTwinPluginConfiguration = typeof DEFAULT_PLUGIN_CONFIG;

export const typeScriptExtensionId = 'vscode.typescript-language-features';
export const pluginId = '@native-twin/ts-plugin';
const packageName = 'native-twin-vscode';
const publisher = 'native-twin';
export const extensionChannelName = 'Native Twin Language Client';
export const extensionServerChannelName = 'Native Twin Language Server';
export const extensionName = `${publisher}.${packageName}`;
export const diagnosticProviderSource = 'NativeTwin';
