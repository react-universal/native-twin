import type { DocumentSelector } from 'vscode-languageserver-protocol';
import type { InternalTwinConfig } from '../internal/TwinTypes.internal';

const DOCUMENT_SELECTORS = [
  { scheme: 'file', language: 'nativeTwin' },
  { scheme: 'file', language: 'typescript' },
  { scheme: 'file', language: 'typescriptreact' },
  { scheme: 'file', language: 'javascript' },
  { scheme: 'file', language: 'javascriptreact' },
] satisfies DocumentSelector;

const DEFAULT_TWIN_CONFIG = {
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

const DEFAULT_PLUGIN_CONFIG = {
  jsxAttributes: ['tw', 'class', 'className', 'variants'],
  functions: ['tw', 'apply', 'css', 'variants', 'style', 'styled', 'createVariants'],
  debug: false,
  rootDir: './',
  enable: true,
  tsConfigPath: './tsconfig.json',
  twinConfigPath: './tailwind.config.ts',
  completions: true,
  diagnostics: 'off',
  format: false,
  trace: {
    server: 'off',
  },
} satisfies TwinConfigOptions;

const twinCommonFiles = ['tailwind.config.ts', 'twin.config.ts'];
const typeScriptExtensionId = 'vscode.typescript-language-features';
const pluginId = '@native-twin/ts-plugin';
const packageName = 'native-twin-vscode';
const publisher = 'native-twin';
const extensionChannelName = 'Native Twin Language Client';
const extensionServerChannelName = 'Native Twin Language Server';
const vscodeExtensionName = `${publisher}.${packageName}`;
const diagnosticProviderSource = 'NativeTwin';
const configurationSection = 'nativeTwin';

export const LSPConstants = {
  typeScriptExtensionId,
  tsPluginName: pluginId,
  vscodePublisher: publisher,
  extensionChannelName,
  extensionServerChannelName,
  diagnosticProviderSource,
  vscodeExtensionName,
  documentSelectors: DOCUMENT_SELECTORS,
  twinConfigEmpty: DEFAULT_TWIN_CONFIG,
  lspRawConfig: DEFAULT_PLUGIN_CONFIG,
  vscodeConfigSection: configurationSection,
  twinCommonFiles,
};

export interface TwinConfigOptions {
  jsxAttributes: string[];
  functions: string[];
  debug: boolean;
  rootDir: string;
  enable: boolean;
  tsConfigPath: string;
  twinConfigPath: string;
  completions: boolean;
  diagnostics: 'off' | 'info' | 'warn';
  format: boolean;
  trace: {
    server: 'off' | 'messages' | 'verbose';
  };
}

export enum TwinDiagnosticCodes {
  None = '000',
  DuplicatedDeclaration = '001',
  DuplicatedClassName = '002',
}
